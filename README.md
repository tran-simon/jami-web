# Jami-web

Jami-web is a web server that starts a Dameon on NodeJS express server and serve a React web client.

The first milestone is to allow user with LDAP credentials to connect to the account using JAMS service and start chatting with their contacts using instant messaging.

Next step will be to implement a video protocol such as WebRTC to allow audio and video calls from the users browser to another Jami contact allowing cross-platform communications.

# Main dependencies

* Jami Daemon with NodeJS bindings (https://review.jami.net/admin/repos/jami-daemon),
* NodeJS v16+
+ Swig 4.1.0

# How to start the server

After building the Jami daemon you can use the following command to start the node js server using the LD_LIBRARY_PATH

Where $PATH_TO_JAMI_PROJECT is the path to the shared library of your Jami daemon

LD_LIBRARY_PATH=$PATH_TO_JAMI_PROJECT/ring-project/install/daemon/lib node

To build the dring.node Javascript interface to talk to the daemon api go to the daemon repo and use ./configure --with-nodejs then execute make -j4 to build the daemon

# Docker

You may run the web server in a Docker container. This will automatically build the daemon and do the necessary linking.

```bash
docker build -t jami-web .
docker run -it -p 3000:3000 jami-web
```

## Using [docker-compose](docker run -p 3000:3000 -it jami-project)
This will use a [Docker Volume](https://docs.docker.com/storage/volumes/) to enable auto-refresh when you change a file.

```bash
docker-compose build
docker-compose up
```

# Sentry

- uncomment the line `// import config from "./sentry-server.config.json" assert { type: "json" };` in `./sentry.js`
- uncomment the line `// import config from "../sentry-client.config.json"` and the init config`Sentry.init(...` in `./client/index.js`
- uncomment the lines `// import { sentrySetUp } from './sentry.js'` and `sentrySetUp(app)` in `./app.js`
- add `sentry-client.config.json` file in `client` and `sentry-server.config.json` (ask them to an admin) in your project root

# Tests

 - Cypress: run the following script `sh ./cypress-test.sh`
