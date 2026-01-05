import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    const skipPaths = ['/api/auth/callback', '/api/auth/user', '/api/sparks/featured', '/api/sparks/today', '/api/sparks/published'];
    return skipPaths.some(path => req.path.startsWith(path));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    if (req.path === '/api/auth/callback' || req.path === '/api/auth/user') {
      return true;
    }
    return false;
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: "Rate limit exceeded for this action." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  },
});
