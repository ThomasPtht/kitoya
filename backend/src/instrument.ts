// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: 'https://36430cb3f6bfbebd3ac2129c8afccc90@o4510894781104128.ingest.de.sentry.io/4512001464336464',
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
