# Jami-web

Jami-web is a web server that starts a Dameon on NodeJS express server and serve a React web client.

The first milestone is to allow user with LDAP credentials to connect to the account using JAMS service and start chatting with their contacts using instant messaging.

Next step will be to implement a video protocol such as WebRTC to allow audio and video calls from the users browser to another Jami contact allowing cross-platform communications.

# Main dependencies

- Jami Daemon with NodeJS bindings (https://review.jami.net/admin/repos/jami-daemon),
- NodeJS v16+

* Swig 4.1.0

# How to start the server

After building the Jami daemon you can use the following command to start the node js server using the LD_LIBRARY_PATH

Where $PATH_TO_JAMI_PROJECT is the path to the shared library of your Jami daemon

LD_LIBRARY_PATH=$PATH_TO_JAMI_PROJECT/ring-project/install/daemon/lib node

To build the dring.node Javascript interface to talk to the daemon api go to the daemon repo and use ./configure --with-nodejs then execute make -j4 to build the daemon

Create a symbolic link to `jamid.node` at the root of jami-web and inside `server/`:

```bash
ln -s daemon/bin/nodejs/build/Release/jamid.node jamid.node
ln -s daemon/bin/nodejs/build/Release/jamid.node server/jamid.node
```

Then, start the servers:

```bash
# Install the package dependencies
npm install

# Start the client and backend servers
npm start
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
  --volume $(pwd)/client/src:/web-client/client/src \
  --volume $(pwd)/server/src:/web-client/server/src \
  --volume $(pwd)/client/.env.development:/web-client/client/.env.development \
  --volume $(pwd)/server/.env:/web-client/server/.env \
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

# Sentry

- uncomment the line `// import config from "./sentry-server.config.json" assert { type: "json" };` in `./sentry.js`

- uncomment the line `// import config from "../sentry-client.config.json"` and the init config`Sentry.init(...` in `./client/index.js`

- uncomment the lines `// import { sentrySetUp } from './sentry.js'` and `sentrySetUp(app)` in `./app.ts`

- add `sentry-client.config.json` file in `client` and `sentry-server.config.json` (ask them to an admin) in your project root

# Tests

- Cypress: run the following script `sh ./cypress-test.sh`
