There are plenty of resources on Docker out there, but not all tutorials are equally clear. I have therefore decided to provide a walkthrough of setting up a Docker project from scratch. 

## Step 1 - Server setup

Spin up a virtual server. You can use [Virtualbox](https://www.virtualbox.org/), but I decided to spin up a virtual 64 bit Centos server on Digital Ocean with 512 MB memory and a 20 GB disk (this server will in Docker context be referred to as the *host machine*). Prepare the server with the following commands:

```bash
# List kernel version - it MUST be 3.10 or above
> uname -r

# Update system packages
> sudo yum update

# Add yum repository
> sudo tee /etc/yum.repos.d/docker.repo <<-'EOF'
[dockerrepo]
name=Docker Repository
baseurl=https://yum.dockerproject.org/repo/main/centos/$releasever/
enabled=1
gpgcheck=1
gpgkey=https://yum.dockerproject.org/gpg
EOF

# Install Docker
> sudo yum install docker-engine

# Start the Docker daemon
> sudo service docker start
```

This should make it possible for you to run the `docker` command from the command line on your server. Try `docker --help` for a listing of commands.

## Step 2 - Downloading images

We are now able to start our first container. I will show you how to start a a Nginx and a MySQL container. In order to get up and running quickly, we are going to use the official Dockerfiles for both Nginx and MySQL stored on **Dockerhub** (equivalent to Github, but for Dockerfiles). You can store your own Dockerfiles in the cloud by signing up at [hub.docker.com](https://hub.docker.com/).

Now we are ready to pull the Dockerfiles using `docker pull nginx` and `docker pull mysql`. To see the images that we have just downloaded, run `docker images`. Verify that you can see the image for both Nginx and MySQL.

## Step 3 - Starting containers

You are now ready to start some containers. In order for our Nginx server to serve some HTML, we need to create a HTML file. On your host machine run the following commands: 

```bash
# Create a directory to store the HTML file
> mkdir -p /var/www

# Create an index page
> echo "<html><h1>Hello from host machine!</h1></html>" > /var/www/index.html
```

Read carefully through the code below before firing up the containers. Additionally, run `docker run --help` for parameter explanations.

```bash
# run    = starts the container process
# -d     = detach the container and run in the background
# -p     = map port from host machine to container
# --name = name your container
# -e     = set environment variable
# -v     = mount a drive from the host machine to the container
> docker run -d -p 80:80 -v /var/www/:/usr/share/nginx/html --name "nginx-server" nginx
> docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=Xa8j3cs10 --name "mysql-server" mysql
```

Containers should be regarded as immutable as they don't change after initialization. Furthermore, they can quickly be stopped, removed and started again. They are therefore not suitable for storing data. When working with MySQL, you want to make sure that the data written to the database is persisted. This can be achieved by mounting a directory from the host machine to the container.

```bash
# Stop the MySQL container
> docker stop "mysql-server"

# Remove the MySQL container
> docker rm "mysql-server"
 
# Create directory on host machine to hold data
> mkdir -p /var/data

# Start the MySQL container again (this time writing data to the host machine)
> docker run -d -p 3306:3306 -v /var/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=Xa8j3cs10 --name "mysql-server" mysql
```

Verify that the containers have started by running `docker ps`. 

## Step 4 - Testing containers

As described above, we have mapped the host machine's port 80 to port 80 on the Nginx container. Visit the IP address of the host machine and you should be welcomed by your own `index.html`! You have now successfully started a Nginx container and are able to control it through Docker commands.

In order to test the MySQL container try to connect using `root` as username and your chosen password. You can connect on the command line or use a MySQL manager such as [Sequel Pro](http://www.sequelpro.com/).

## Wrapping it up
Docker makes it easy to deploy your applications. Using Docker you can focus on your application and use well-supported images for your web server and databases. Additionally Docker takes the anxiety out of deploying to production - because of the isolation of containers you know that what works in development also works in production. 

I have included a few useful Docker snippets:

```bash
# List all Docker images
> docker images -a

# List all Docker containers
> docker ps -a

# Stop and remove all Docker containers
> docker stop $(docker ps -a -q)
> docker rm $(docker ps -a -q)

# Get command line access to a container
> docker exec -it [CONTAINER_ID] /bin/bash

# Get logs from container
> docker logs [CONTAINER_ID]

# Remove all exited containers
> docker rm -v $(docker ps -a -q -f status=exited)
```

