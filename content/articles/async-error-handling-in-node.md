In this post I would like to walk you through error handling in a typical Node application. Handling errors can be quite tricky - especially when dealing with asynchronous functions. Let's get started!

## Callback pattern
In Node the callback pattern is very common. In a nutshell, asynchronous functions are passed a function as a parameter. This function is then called when the asynchronous operation has finished and is therefore called a **callback** function. Check out this example:

```javascript
// Definition of a asynchronous function
function getUsers (callback) {
  // Imitation of asynchronous function call
  // Could fx be querying a database
  setTimeout((users) => {
    callback(null, users)
  }, 2000)
}

// Call the function and pass the callback function
getUsers((err, users) => {
  if (err) console.log('Whoops!')
  else console.log(users)
})
```

When `getUsers` has retrieved the users, it calls the callback function with two parameters:

- `null` meaning that there is no error
- `users` that represent the data to be returned

This was of passing the error as the first parameter to the callback function is, surprisingly, called the *error first pattern*. This pattern is very common in the Node ecosystem. Many examples can be found in the core libraries of Node.

```javascript
// Import core I/O library
import fs from 'fs'

// Read file asynchronously
fs.readFile('data.json', (err, file) => {
  if (err) console.log('Problem reading file...')
  else {
    console.log(JSON.parse(file.toString()))
  }
})
```

As you see in this example, we pass a callback function to `fs.readFile` - the function is then called with the potential error as the first parameter and the actual file content as the second parameter

### Callback hell
When you nest several asynchronous functions within each other you end up with *callback hell*. This is a problem because the code gets hard to comprehend for the synchronous-thinking human mind. Additionally it is aesthetically appalling.

```javascript
getUsers((err, users) => {
  if (err) console.log(err)
  getUserProjects(users, (err, projects) => {
    if (err) console.log(err)
    getProjectRatings(projects, (err, ratings) => {
      if (err) console.log(err)
      console.log(`Total amount of ratings: ${ratings.length}`)
    })
  })
})
```

## Promises
Using promises is an alternative to the callback pattern for asynchronous operations. A great deal of literature has been written on the topic of promises, so I will keep it simple: **A promise is a value which may be available now, in the future or never**.

 🔥 What? Let's look at an example.

 ```javascript
 function getUsers () {
   // Return a promise that is either resolved or rejected
   return new Promise((resolve, reject) => {
     setTimeout((err, users) => {
       if (err) reject(err)
       resolve(users)
     }, 2000)
   })
 }
 ```

 Basically you wrap the function logic in `return new Promise((resolve, reject) => { ... })`. Based on the outcome of the of the function logic, you call either `resolve` or `reject`. You resolve upon success and reject upon errors. Both functions accept only one argument, but this argument can be any data type including objects and arrays. Let's use our promise returning function!

 ```javascript
getUsers()
  .then(users => console.log(users))
  .catch(err => console.log('We have a problem!'))
 ```
