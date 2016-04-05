Developing my REST application (running on Express), I experienced a problem when trying to update nested object properties. Specifically, I was passing the `req.body` directly to the MongoDB `$set` operator. This did however lead to problems, as I accidentally removed properties.

```javascript
// The user object in MongoDB (before the update)
var user = { 
  username: 'joe47',
  age: 42,
  address: {
    street: 'High Street',
    streetNumber: 109,
    zipCode: '2020-90'
  }
}

// The request body (sent as a PUT request to the Express app)
var body = {
  address: {
    streetNumber: 200
  }
}

// Updating the user
db.collections('users').update({ $set: req.body })

// The user object in MongoDB (after the update)
var user = { 
  username: 'joe47',
  age: 42,
  address: {
    streetNumber: 200,
  }
}
```

The set operation of the `address` property removed all other properties nested under `address`. In order to specifically update a single property in MongoDB, one has to use the string dot-notation.

```javascript
db.collections('users').update({ $set: { 'address.streetNumber': 200 } })
```

I therefore created a function to recursively loop through a nested JSON structure and construct a corresponding object in string dot-notation ready for a MongoDB update.

```javascript
function convertObject(obj) {
  var res = {};
  (function iterate(obj, parent) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (typeof obj[prop] === 'string' 
          || typeof obj[prop] === 'number' 
          || typeof obj[prop] === 'boolean' 
          || Object.prototype.toString.call(obj[prop]) === '[object Array]' ) {
          if (parent) res[parent + '.' + prop] = obj[prop];
          else res[prop] = obj[prop];
        } else {
          if (parent) iterate(obj[prop], parent + '.' + prop);
          else iterate(obj[prop], prop);
        }
      }
    }
  })(obj)
  return res;
}
```

Here is an example:

```javascript
// Body before converting
var body = {
  address: {
    streetNumber: 200
  }
}

body = convertObject(body); // => { 'address.streetNumber': 200 }
```

It is now easy as cake to update a document by passing the `req.body`.

```javascript
db.collections('users').update({ $set: convertObject(req.body) })
```