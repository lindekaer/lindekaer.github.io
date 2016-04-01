Being able to deploy to with zero downtime is a must. I will show you a simple setup involving very little configuration.

## The idea

The idea is two run multiple Docker containers with your application at once. Nginx proxies incoming connections to the ports providing access to the application. 