import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
// import config from "./sentry-server.config.json" assert { type: "json" };

export function sentrySetUp(app) {
  Sentry.init({
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error!');
  });

  // The error handler must be before any other error middleware and after all controllers
  // app.use(Sentry.Handlers.errorHandler());
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 404 and 500 errors
        if (error.status === 404 || error.status === 500) {
          return true;
        }
        return false;
      },
    })
  );
  // Optional fallthrough error handler
  app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + '\n');
  });
}
