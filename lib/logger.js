const isDev = process.env.NODE_ENV === 'development';

const logger = {
  info: (message, meta = {}) => {
    if (isDev) {
      console.log(`ℹ️  ${message}`, meta);
    } else {
      console.log(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    }
  },
  
  error: (message, error, meta = {}) => {
    if (isDev) {
      console.error(`❌ ${message}`, error);
    } else {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        ...meta
      }));
      
      // TODO: Enviar a Sentry en production
    }
  },
  
  success: (message, meta = {}) => {
    if (isDev) {
      console.log(`✅ ${message}`, meta);
    } else {
      console.log(JSON.stringify({
        level: 'success',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    }
  },
  
  warn: (message, meta = {}) => {
    if (isDev) {
      console.warn(`⚠️  ${message}`, meta);
    } else {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    }
  }
};

module.exports = { logger };