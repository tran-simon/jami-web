FROM jami-daemon

WORKDIR /web-client
ENV LD_LIBRARY_PATH=/daemon/src/.libs
ENV SECRET_KEY_BASE=test123

# Install dependencies
RUN apt-get update && apt-get install -y \
    lldb \
    liblldb-dev

# Create a symlink to the daemon node app
RUN ln -s /daemon/bin/nodejs/build/Release/jamid.node jamid.node

COPY package*.json ./
COPY common/package*.json common/
COPY client/package*.json client/
COPY server/package*.json server/

RUN npm ci --ignore-scripts

# Build common library
COPY common common
COPY tsconfig.json ./
RUN npm run build --workspace common

COPY . .

CMD ["npm", "start"]
