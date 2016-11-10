In this tutorial I will show you how to restrict access to the files you store in a AWS S3 bucket. In order to achieve this, we are going to set up both [AWS S3](https://github.com/open-guides/og-aws#s3) and [AWS CloudFront](https://github.com/open-guides/og-aws#cloudfront). Before doing into the implementation I'd like to provide an overview of the problem space and the technologies.

## S3, CloudFront and signed URLs
**S3** is a storage solution from Amazon Web Services (AWS) for storing files. These files can be anything from `.html` (for hosting a static site) to various image and audio formats such as `.mp3` and `.mp4`. **CloudFront** is a CDN service that plays well together with other AWS services. Storing files and serving them over CDN is all well and good, but what if I want to enable only authenticated users to be able to download? Additionally, what if I want to restrict the access to, let's say, 20 seconds?

An answer to this problem is *usage of signed URLs*. A signed URL is a URL that been signed by a trusted authority. It is possible to include additional details in the signature such as time to expiry. This means that we can sign a URL pointing to a resource in our S3 bucket and thereby ensure that only authenticated users can access the resource. There is a bit more nuance to the solution, but let's take a look at the implementation step for step.

## Implementation
My implementation is mostly based on the AWS Console (web interface), but using the AWS CLI is also a possibility.

### 1. Create S3 bucket
- Go to AWS S3
- Click **Create Bucket**
- Fill in **Bucket Name** and choose a **Region** suitable for your application
- Click the newly created bucket
- Click **Upload** and upload an image (why not a funny cat?)

<div class="media">
  <img class="media__image" data-src="http://i.imgur.com/SzaXL2R.jpg" title="Feel free to use this cat">
</div>

### 2. Create CloudFront distribution
- Go to AWS CloudFront
- Click **Create Distribution**
- Under *Web* click **Get Started**
- Highlight the **Origin Domain Name** and select your S3 bucket from the dropdown
- *Optional*: If your store your files in a nested structure `project/assets/images` you can specify the path in **Origin Path**
- Check **Restrict Bucket Access** (yup, surprise!)
- Check **Create a New Identity**
- Check in the **Comment** field write a suitable name (this identity can be reused for other distributions)
- Check **Yes, Update Bucket Policy**

Basically, we have made CloudFront aware of our files' location and created a policy for the S3 bucket that makes it possible for CloudFront to fetch resources from an otherwise *private* S3 Bucket.

- Check yes in **Restrict Viewer Access**

This is the rule that enforces signed URLs to access resources

- Leave the remaining defaults and click **Create Distribution**

### 3. Create CloudFront credentials
- Go to your AWS account (click your username in the top right corner)
- Go to **Security Credentials**
- Expand **CloudFront Key Pairs**
- Click **Create New Key Pair**
- Download both the private and public key and store them safely
- Note down the **Access Key ID**, you will need that for later

## 4. Create signed URLs
I am using NodeJS for my application, so I made use of the NPM package `aws-cloudfront-sign`. Install it in your project directory.

```shell
npm install --save aws-cloudfront-sign
```

I will demonstrate the creation of a signed URL by implementing the `aws-cloudfront-sign` package in an Express route handler.

```javascript
import express from 'express'
import cf from 'aws-cloudfront-sign'

// AWS specific options
const AWS_ACCESS_KEY_ID = 'xxxxxxxxxx'
const AWS_PRIVATE_KEY_PATH = './private-key.pem'
const AWS_CLOUD_FRONT_URL = 'http://xxxxxxxx.cloudfront.net'

// Initialize the Express application
const app = express()
app.listen(9000, () => console.log('Running on port 9000'))

// Setup route handler
app.get('/images', createSignedUrl)

// Signed URL logic
function createSignedUrl (req, res) {
  const name = req.query.name
  const extension = req.query.ext
  const options = {
    keypairId: AWS_ACCESS_KEY_ID,
    privateKeyPath: AWS_PRIVATE_KEY_PATH,
    expireTime: new Date().getTime() + 45000
  }
  const url = `${AWS_CLOUD_FRONT_URL}/${name}.${extension}`
  const signedUrl = cf.getSignedUrl(url, options)
  res.json({ url: signedUrl })
}
```

You will now be able to create a signed URL for the `funny_cat.jpg` in your *private* S3 bucket. Try this:

```shell
curl http://localhost:9000/images?name=funny_cat&ext=jpg
```

That will return a looong URL with query keys *Expires*, *Policy* and *Key-Pair-Id*. With this URL, you can go right ahead and fetch the resource. The URL will expire after 45 seconds as declared in our `options` object.

And well, that's it! ⚡️
