# Blog

## TODO
- Analyze the page using Chrome Devtools Rendering options
- Do an article on how SSL works

## Notes
- Due to a bug in Leaflet, the map hijacks scroll touch events. Use version 7.5 or wait for fix.
- Add Docker text (see below)
- Create 404.html
- Finnish Romania article
- Write Barcelona article

https://docs.docker.com/v1.8/installation/centos/

The docker daemon binds to a Unix socket instead of a TCP port. By default that Unix socket is owned by the user root and other users can access it with sudo. For this reason, docker daemon always runs as the root user.

To avoid having to use sudo when you use the docker command, create a Unix group called docker and add users to it. When the docker daemon starts, it makes the ownership of the Unix socket read/writable by the docker group.

Warning: The docker group is equivalent to the root user; For details on how this impacts security in your system, see Docker Daemon Attack Surface for details.

To create the docker group and add your user:

Log into Centos as a user with sudo privileges.

Create the docker group and add your user.

sudo usermod -aG docker your_username

Log out and log back in.

This ensures your user is running with the correct permissions.

Verify your work by running docker without sudo.

$ docker run hello-world