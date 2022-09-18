FROM ubuntu:22.04

WORKDIR /app

ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    autoconf \
    automake \
    autopoint \
    bison \
    build-essential \
    cmake \
    curl \
    git \
    libarchive-dev \
    libasio-dev \
    libasound2-dev \
    libdbus-1-dev \
    libdbus-c++-dev \
    libexpat1-dev \
    libfmt-dev \
    libgmp-dev \
    nettle-dev \
    libgnutls28-dev \
    libjsoncpp-dev \
    libmsgpack-dev \
    libnatpmp-dev \
    libopus-dev \
    libpulse-dev \
    libspeex-dev \
    libspeexdsp-dev \
    libssl-dev \
    libtool \
    libudev-dev \
    libupnp-dev \
    libva-dev \
    libvdpau-dev \
    libvpx-dev \
    libx264-dev \
    libyaml-cpp-dev \
    libhttp-parser-dev \
    libwebrtc-audio-processing-dev \
    libsecp256k1-dev \
    nasm \
    pkg-config \
    yasm

# Install Node
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g node-gyp

# Install latest Swig (4.1)
WORKDIR /swig
RUN git clone https://github.com/swig/swig.git && \
    cd swig && \
    ./autogen.sh && \
    ./configure && \
    make -j$(nproc) && \
    make install

WORKDIR /app
COPY . .
WORKDIR /app/daemon

# Build daemon dependencies
RUN mkdir -p contrib/native && \
    cd contrib/native && \
    ../bootstrap && \
    make -j$(nproc)

# Build the daemon
RUN ./autogen.sh && \
    ./configure --with-nodejs && \
    make -j$(nproc)

WORKDIR /app

RUN apt-get update && apt-get install -y \
    lldb \
    liblldb-dev

ENV LD_LIBRARY_PATH=/app/daemon/src/.libs
ENV SECRET_KEY_BASE=test123
RUN npm install && \
    ln -s /app/daemon/bin/nodejs/build/Release/jamid.node jamid.node && \
    npm run build

CMD ["npm", "start"]
