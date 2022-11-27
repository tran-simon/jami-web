# Server

## Setup

### Install npm dependencies and generate a private/public key pair

```
npm install
```

## Usage

### Run with hot-reload for development

```sh
LD_LIBRARY_PATH="../daemon/src/.libs" npm start
```

### Build for production

```
npm run build
```

### Preview the production build

```sh
LD_LIBRARY_PATH="../daemon/src/.libs" npm run start:prod
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
