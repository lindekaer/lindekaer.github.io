I am currently doing backend development for a company that uses DynamoDB. When running my API tests I would like to hit a testing database. Amazon Web Services (AWS) provides a local version of DynamoDB that can be used for exactly this purpose.

## Run the Docker image
The local DynamoDB is available as a Java program, but have been packaged in a Docker container for ease of use. I ended up using `ryanratcliff/dynamodb`, which I fetched from Docker Hub. This is how I downloaded and ran the container:

```bash
# Download the image from Docker Hub
docker pull ryanratcliff/dynamodb

# Run the container
docker run -d -p 8000:8000 --name my-local-dynamodb ryanratcliff/dynamodb
```

Once running, you can interact with DynamoDB through a shell exposed on `http://localhost:8000/shell`. You can either configure the database through the shell or programatically as part of your testing (what I did).

## Connect to DynamoDB
I use Node for the backend project. Connecting to the local DynamoDB is identical to the way you would normally do using the `aws-sdk`. However, pay attention to fields in the `update` object below:

```javascript
import AWS from 'aws-sdk'

AWS.config.update({
  region: 'localhost',              // use localhost here
  accessKeyId: 'xxx',               // random string
  secretAccessKey: 'xxx',           // random string
  endpoint: 'http://localhost:8000' // hit your local instance
})

var dynamo = new AWS.DynamoDB()
```

## Configure DynamoDB
Once you have established the connection, you can easily create your tables. Below is a simple example of a user table with `_id` as the primary key. Notice that the creation of tables is instant on the local version of DynamoDB.

```javascript
const tableConfig = {
  TableName: 'Users',
  KeySchema: [
    {
      AttributeName: '_id',
      KeyType: 'HASH'
    }
  ],
  AttributeDefinitions: [
    {
      AttributeName: '_id',
      AttributeType: 'S'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
}

dynamo.createTable(tableConfig, (err, data) => {
  console.log('Table is ready to use! 🦄')
})
```

## Start testing
Now you are ready to start testing on your local DynamoDB. That's it, take care!

