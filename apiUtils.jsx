// Rate limiting and retry utilities
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const is429 = error.message?.includes('429') || error.status === 429;
      
      if (is429 && attempt < maxRetries) {
        // Exponential backoff for 429 errors
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`Rate limited. Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      
      // If it's the last attempt or not a 429 error, throw the error
      throw error;
    }
  }
};

export const createRateLimiter = (maxCalls, windowMs) => {
  const calls = [];
  
  return async (fn) => {
    const now = Date.now();
    
    // Remove calls outside the window
    while (calls.length > 0 && calls[0] <= now - windowMs) {
      calls.shift();
    }
    
    // Check if we're at the limit
    if (calls.length >= maxCalls) {
      const oldestCall = calls[0];
      const waitTime = windowMs - (now - oldestCall);
      await sleep(waitTime);
      return createRateLimiter(maxCalls, windowMs)(fn);
    }
    
    calls.push(now);
    return fn();
  };
};

// Create rate limiters for different types of operations
export const searchRateLimiter = createRateLimiter(10, 10000); // 10 calls per 10 seconds
export const dataRateLimiter = createRateLimiter(20, 30000); // 20 calls per 30 seconds