import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
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
