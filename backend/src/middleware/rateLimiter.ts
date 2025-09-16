import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { AuthenticatedRequest } from './auth';

// In-memory store for rate limiting (fallback)
const store = new Map<string, { count: number; resetTime: number }>();

// Custom key generator that uses user ID if authenticated, otherwise IP
const keyGenerator = (req: Request): string => {
  const authReq = req as AuthenticatedRequest;
  return authReq.user?.id || req.ip || 'anonymous';
};

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limiter for create/update operations
export const createUpdateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user/IP
  keyGenerator,
  message: {
    error: 'Too many requests. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use in-memory store if Redis is not available
  store: process.env.REDIS_URL ? undefined : {
    incr: (key: string) => {
      const now = Date.now();
      const windowMs = 60 * 1000;
      const resetTime = now + windowMs;
      
      const current = store.get(key);
      if (!current || now > current.resetTime) {
        store.set(key, { count: 1, resetTime });
        return Promise.resolve({ totalHits: 1, resetTime: new Date(resetTime) });
      }
      
      current.count++;
      store.set(key, current);
      return Promise.resolve({ totalHits: current.count, resetTime: new Date(current.resetTime) });
    },
    decrement: (key: string) => {
      const current = store.get(key);
      if (current && current.count > 0) {
        current.count--;
        store.set(key, current);
      }
      return Promise.resolve();
    },
    resetKey: (key: string) => {
      store.delete(key);
      return Promise.resolve();
    }
  }
});

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: {
    error: 'Too many requests from this IP. Please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});
