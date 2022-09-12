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
COPY client/package*.json client/

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "start"]
