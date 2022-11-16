# jami-web client

This is the client for jami-web

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Run all tests.<br />

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

Your app is ready to be deployed!

See the section about [deployment](https://vitejs.dev/guide/static-deploy.html) for more information.

### `npm run start:prod`

Preview the production build locally.

### `npm run clean`

Clean build files

### `npm run lint`

Verify that no lint errors are present. Use `npm run lint:fix` to fix some errors.

### `npm run format`

Format all files with prettier. Use `npm run format:check` to verify that all files are formatted without changing any.

## `npm run extract-translations`

Update the translation files.

The translations are handled by [i18next](https://www.i18next.com/)

## Sentry

- uncomment the line `// import config from "./sentry-server.config.json" assert { type: "json" };` in `./sentry.js`

- uncomment the line `// import config from "../sentry-client.config.json"` and the init config`Sentry.init(...` in `./client/index.js`

- uncomment the lines `// import { sentrySetUp } from './sentry.js'` and `sentrySetUp(app)` in `./app.ts`

- add `sentry-client.config.json` file in `client` and `sentry-server.config.json` (ask them to an admin) in your project root

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).
