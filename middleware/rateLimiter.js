const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

const isRateLimitEnabled = process.env.RATE_LIMIT === "true";

const noOpMiddleware = (req, res, next) => next();

const createMongoStore = (collectionName, expireTimeMs) => new MongoStore({
  uri: process.env.DATABASE_URI,
  collectionName,
  expireTimeMs
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  store: createMongoStore("authRateLimits", 15 * 60 * 1000),
  message: {
    message: "Too many authentication attempts",
    errors: "Too many authentication attempts, please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`AUTH LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const magicLinkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5,
  store: createMongoStore("magicLinkRateLimits", 5 * 60 * 1000),
  message: {
    message: "Too many magic link requests",
    errors: "Too many magic link requests, please try again after 5 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`MAGIC LINK LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 20,
  store: createMongoStore("refreshTokenRateLimits", 5 * 60 * 1000),
  message: {
    message: "Too many token refresh requests",
    errors: "Too many token refresh requests, please try again after 5 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`REFRESH TOKEN LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const createProfileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  store: createMongoStore("createProfileRateLimits", 60 * 60 * 1000),
  message: {
    message: "Too many profile creation attempts",
    errors: "Too many profile creation attempts, please try again after 1 hour."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`CREATE PROFILE LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const testMagicLinkLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 2,
  store: createMongoStore("testMagicLinkRateLimits", 1 * 60 * 1000),
  message: {
    message: "Too many magic link requests (TEST MODE)",
    errors: "Too many magic link requests, please try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`TEST MAGIC LINK LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const testRefreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 3,
  store: createMongoStore("testRefreshRateLimits", 1 * 60 * 1000),
  message: {
    message: "Too many token refresh requests (TEST MODE)",
    errors: "Too many token refresh requests, please try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  skip: (req) => {
    console.log(`TEST REFRESH LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

module.exports = {
  authLimiter: isRateLimitEnabled ? authLimiter : noOpMiddleware,
  magicLinkLimiter: isRateLimitEnabled ? magicLinkLimiter : noOpMiddleware,
  refreshTokenLimiter: isRateLimitEnabled ? refreshTokenLimiter : noOpMiddleware,
  createProfileLimiter: isRateLimitEnabled ? createProfileLimiter : noOpMiddleware,
  testMagicLinkLimiter: isRateLimitEnabled ? testMagicLinkLimiter : noOpMiddleware,
  testRefreshLimiter: isRateLimitEnabled ? testRefreshLimiter : noOpMiddleware
};

