async function withRetry(fn, options = {}) {
    const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoff = 2,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(
          initialDelay * Math.pow(backoff, attempt),
          maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

module.exports = { withRetry };