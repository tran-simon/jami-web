# Jami Web

The web version of Jami.

The repo is structured as 4 subprojects:

- `client`: the web front-end made with React
- `server`: the back-end server made with Express.js, which starts a daemon instance
- `common`: the common code used by both `client` and `server`
- `daemon`: a submodule containing the Jami daemon

## Prerequisites

- Linux
- [Node.js 16](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)
- [SWIG 4.1.0:](https://www.swig.org/)

  - Build from source with the following instructions: <https://swig.org/svn.html>

    > Note: you will need have Bison installed. On Ubuntu, this can be installed using `sudo apt install bison`.

    ```sh
    git clone https://github.com/swig/swig.git
    cd swig
    ./autogen.sh
    ./configure
    make
    sudo make install
    ```

## Setup

### Build the Jami daemon with Node.js bindings

1. Install the required dependencies: <https://docs.jami.net/build/dependencies.html>

   > Note: for Ubuntu, the minimally needed dependencies are:

   ```
   sudo apt install git build-essential cmake automake autoconf autopoint libtool pkg-config libdbus-1-dev libva-dev libvdpau-dev libasound2-dev libpulse-dev libudev-dev libexpat1-dev ssnasm yasm yasm nasm
   ```

2. Compile the dependencies:

   ```sh
   cd daemon/contrib
   mkdir native
   cd native
   ../bootstrap
   make -j$(nproc)
   ```

3. Install `node-gyp` to build the daemon with Node.js bindings:

   ```
   npm install -g node-gyp
   ```

4. Compile the daemon with Node.js bindings:

   ```sh
   cd ../..
   ./autogen.sh
   ./configure --with-nodejs
   make -j$(nproc)
   ```

5. Create a symlink to `jamid.node` in `server`:

   ```sh
   cd ../server
   ln -s ../daemon/bin/nodejs/build/Release/jamid.node jamid.node
   cd ..
   ```

### Install npm dependencies and set up Git hooks

```
npm install
```

This will install the relevant dependencies for all subprojects and configure Git hooks.

## Usage

### Run with hot-reload for development

Start both the client and server:

```sh
LD_LIBRARY_PATH="${PWD}/daemon/src/.libs" npm start
```

You can also start the client and server individually:

```sh
npm start --workspace client
LD_LIBRARY_PATH="${PWD}/daemon/src/.libs" npm start --workspace server
```

Open <http://localhost:3000> in your browser to view the app.

### Build for production

```
npm run build
```

### Preview the production build

```sh
LD_LIBRARY_PATH="${PWD}/daemon/src/.libs" npm run start:prod
```

### Lint files

```
npm run lint
```

Lint and fix files:

```
npm run lint:fix
```

### Format files

```
npm run format
```

### Clean build output

```
npm run clean
```

## Using a Docker container for development

You may instead wish to use a Docker container for development.

This allows you to avoid having to install all the dependencies needed to build the daemon on your computer. The container is meant for development: it uses bind mounts to mount the source code from your computer into the container, so that the container rebuilds the project whenever changes are made locally.

### With Docker Compose

1. Build the Docker image for the daemon:

   ```
   docker-compose build jami-daemon
   ```

2. Build the Docker image for Jami web:

   ```
   docker-compose build
   ```

3. Run the Docker container:

   ```
   docker-compose up
   ```

### Without Docker Compose

1. Build the Docker image for the daemon:

   ```sh
   cd daemon
   docker build --build-arg config_args="--with-nodejs" -t jami-daemon .
   cd ..
   ```

2. Build the Docker image for Jami web:

   ```sh
   docker build --target development --t jami-web .
   ```

3. Run the Docker container:

   ```
   docker run -it \
       -p 3000:3000 \
       -p 5000:5000 \
       --volume ${PWD}/client/src:/web-client/client/src \
       --volume ${PWD}/server/src:/web-client/server/src \
       --volume ${PWD}/client/.env.development:/web-client/client/.env.development \
       --volume ${PWD}/server/.env:/web-client/server/.env \
       jami-web
   ```
