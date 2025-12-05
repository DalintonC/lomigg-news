const Sentry = require('@sentry/node');
const { logger } = require('./logger');

const isProduction = process.env.NODE_ENV === 'production';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: 'lomigg-news@1.0.0',
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    debug: false,
  });
  
  logger.info('Sentry initialized', { 
    environment: process.env.NODE_ENV
  });
}

function captureError(error, context = {}) {
  logger.error('Error captured', error, context);
  
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context.component || 'unknown',
        source: context.source || 'unknown',
        fatal: context.fatal || false,
      }
    });
  }
}

async function flush(timeout = 2000) {
  if (process.env.SENTRY_DSN) {
    await Sentry.flush(timeout);
  }
}

module.exports = { captureError, flush };