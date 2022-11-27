# Client

## Setup

```
npm install
```

## Usage

### Run with hot-reload for development

```
npm start
```

Open <http://localhost:3000> in your browser to view the app.

### Build for production

```
npm run build
```

### Preview the production build

```
npm run start:prod
```

### Run tests

Run Jest tests:

```
npm test
```

Run Cypress tests:

```
npm run test:cypress
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

### Update the translation files

```
npm run extract-translations
```

The translations are handled by [i18next](https://www.i18next.com/).

### Sentry

- Uncomment the line `// import config from "./sentry-server.config.json" assert { type: "json" };` in `sentry.js`
- Uncomment the line `// import config from "../sentry-client.config.json"` and the init config `Sentry.init(...` in `index.ts`
- Add `sentry-client.config.json` file in `client` and `sentry-server.config.json` (ask them to an admin)
