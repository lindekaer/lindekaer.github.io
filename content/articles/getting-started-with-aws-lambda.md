Lambda functions are awesome and hold the potential to greatly simplify the way you develop and deploy. In this article I will take you on a whirlwind tour from concept to deployment using Amazon Web Services (AWS). Hold on! 🌪

<p class="article__notice">Before you continue make sure you have set up your AWS CLI. Check out [this guide](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-set-up.html) to get ready!</p>

## Lambda 101
In a nutshell AWS Lambda is a service that enables you to deploy code without worrying about your infrastructure. This means you only have to focus on your application logic. A simple Lambda function looks like this:

```javascript
export.handler = function(event, context) {
  context(null, 'Hello, Racoon!')
}
```
