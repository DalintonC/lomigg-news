const Sentry = require('@sentry/node');
const { logger } = require('./logger');

const isProduction = process.env.NODE_ENV === 'production';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: 'lomigg-news@1.0.0',
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    beforeSend(event) {
      // Filter known errors/ignorable
      if (event.exception) {
        const error = event.exception.values?.[0];
        
        // Ignore APIs rate limits
        if (error?.value?.includes('429') || error?.value?.includes('rate limit')) {
          return null;
        }
      }
      
      return event;
    },
  });
  
  logger.info('Sentry initialized', { 
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_DSN.substring(0, 30) + '...'
  });
}

function captureError(error, context = {}) {
  logger.error('Capturing error in Sentry', error, context);
  
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
      tags: {
        component: context.component || 'unknown',
        source: context.source || 'unknown',
      }
    });
  }
}

async function flush(timeout = 2000) {
  if (process.env.SENTRY_DSN) {
    logger.info('Flushing Sentry events...', { timeout });
    await Sentry.flush(timeout);
    return result;
  }
}
module.exports = { captureError, flush };