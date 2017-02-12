I have been doing some performance testing of WebRTC connection setup time using a Dockerized Selenium setup. In order to spawn multiple clients in a specific sequence, I needed some insights into the lifecycle of each client. This could easily be achieved with simple `console.log` statements, but I ran into a problem - *how do I get the browser logs from a Selenium instance*?

The Selenium API is pretty comprehensive and it took a bit of work to figure out the right approach. Here is the working code:

```javascript
import webdriver from 'selenium-webdriver'
import { chrome } from 'selenium-webdriver/chrome'

// Setup of logging preferences
const loggingPreferences = new webdriver.logging.Preferences()
loggingPreferences.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL)

const chromeOptions = new chrome.Options()
chromeOptions.addArguments('--no-sandbox')
chromeOptions.addArguments('--enable-logging')
chromeOptions.setLoggingPrefs(loggingPreferences)

const driver = new webdriver.Builder()
  .forBrowser(webdriver.Browser.CHROME)
  .setChromeOptions(chromeOptions)
  .build()

driver.get(`http://example.com/test`)
driver.wait(untilDoneEvent)
driver.quit()
```

First of all notice the `untilDoneEvent` function passed to `driver.wait`. This function needs to eventually return a truthy value to indicate that the driver can proceed. Unfortunately you can't just return a `promise`, so I had to create an immidietely invoked function and return true upon resolving. Pairing this with `setInterval` I was able to fetch browser logs every **500ms** and check for any message containing my done signal, `**DONE**`.

```javascript
function untilDoneEvent () {
  return (() => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(function () {
        driver.manage().logs().get(webdriver.logging.Type.BROWSER)
          .then(function (entries) {
            entries.forEach(e => {
              if (e.message.indexOf('**DONE**') !== -1) {
                clearInterval(interval)
                return resolve()
              }
            })
          })
      }, 500)
    })
  })().then(() => true)
```

It works, but is not the must concise. If you have some ideas for improvement, please let me know!
