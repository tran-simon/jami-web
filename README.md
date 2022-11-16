# Jami-web

Jami-web is a web server that starts a Dameon on NodeJS express server and serve a React web client.

The first milestone is to allow user with LDAP credentials to connect to the account using JAMS service and start chatting with their contacts using instant messaging.

Next step will be to implement a video protocol such as WebRTC to allow audio and video calls from the users browser to another Jami contact allowing cross-platform communications.

# Main dependencies

- Jami Daemon with NodeJS bindings (https://review.jami.net/admin/repos/jami-daemon),
- NodeJS v16+
- Swig 4.1.0

# How to start the server

After building the Jami daemon you can use the following command to start the node js server using the LD_LIBRARY_PATH

`LD_LIBRARY_PATH="${PWD}/daemon/src/.libs"`

To build the dring.node Javascript interface to talk to the daemon api go to the daemon repo and use ./configure --with-nodejs then execute make -j4 to build the daemon

Create a symbolic link to `jamid.node` inside `server/`:

```sh
cd server
ln -s ../daemon/bin/nodejs/build/Release/jamid.node jamid.node
```

Then, start the servers:

```sh
# Install the package dependencies
npm install

# Start the client and backend servers
LD_LIBRARY_PATH="${PWD}/daemon/src/.libs" npm start
```

You may also start the servers individually:

```bash
npm start --workspace client
npm start --workspace server
```

# How to build for production

```bash
# Build the client app and the server. The resulting files are available in `client/dist` and `server/dist` respectively
npm run build

# Preview the production build locally
npm run start:prod
```

# Docker

You may run the web server in a Docker container. This will automatically build the daemon and do the necessary linking.

## 1. Build the daemon

```bash
cd daemon
docker build --build-arg config_args="--with-nodejs" -t jami-daemon .
cd ..
```

## 2. Build and run the web server and client

```bash
docker build --target development --tag jami-web .
docker run -it \
  -p 3001:3001 \
  -p 3000:3000 \
  -p 5000:5000 \
  --volume ${PWD}/client/src:/web-client/client/src \
  --volume ${PWD}/server/src:/web-client/server/src \
  --volume ${PWD}/client/.env.development:/web-client/client/.env.development \
  --volume ${PWD}/server/.env:/web-client/server/.env \
  jami-web
```

## Using [docker-compose](docker run -p 3000:3000 -it jami-project)

This will use a [Docker Volume](https://docs.docker.com/storage/volumes/) to enable auto-refresh when you change a file.

```bash
# First build the daemon if necessary
docker-compose build jami-daemon

# Then build the project and start the container
docker-compose build
docker-compose up
```
