const rateLimit = require("express-rate-limit");

// General auth rate limiter - for login attempts and profile creation
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    message: "Too many authentication attempts",
    errors: "Too many authentication attempts from this IP, please try again after 15 minutes."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Don't skip successful requests
  skipFailedRequests: false, // Don't skip failed requests
  onLimitReached: (req) => {
    console.log(`🚫 AUTH RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 AUTH LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false; // Don't skip any requests
  }
});

// Stricter rate limiter for magic link requests to prevent spam
const magicLinkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 magic link requests per 5 minutes
  message: {
    message: "Too many magic link requests",
    errors: "Too many magic link requests from this IP, please try again after 5 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req) => {
    console.log(`🚫 MAGIC LINK RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 MAGIC LINK LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

// More permissive rate limiter for token refresh
const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 refresh requests per 5 minutes
  message: {
    message: "Too many token refresh requests",
    errors: "Too many token refresh requests from this IP, please try again after 5 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, including successful ones
  skipFailedRequests: false,
  onLimitReached: (req) => {
    console.log(`🚫 REFRESH TOKEN RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 REFRESH TOKEN LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

// Very strict rate limiter for profile creation
const createProfileLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 profile creations per hour
  message: {
    message: "Too many profile creation attempts",
    errors: "Too many profile creation attempts from this IP, please try again after 1 hour."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req) => {
    console.log(`🚫 CREATE PROFILE RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 CREATE PROFILE LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

// Test rate limiters with lower limits for easier testing
const testMagicLinkLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute for testing
  max: 2, // Very low limit for testing
  message: {
    message: "Too many magic link requests (TEST MODE)",
    errors: "Too many magic link requests from this IP, please try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req) => {
    console.log(`🚫 TEST MAGIC LINK RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 TEST MAGIC LINK LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

const testRefreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute for testing
  max: 3, // Very low limit for testing
  message: {
    message: "Too many token refresh requests (TEST MODE)",
    errors: "Too many token refresh requests from this IP, please try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req) => {
    console.log(`🚫 TEST REFRESH RATE LIMIT REACHED for IP: ${req.ip}`);
  },
  skip: (req) => {
    console.log(`🔍 TEST REFRESH LIMITER: Checking IP ${req.ip} for ${req.method} ${req.path}`);
    return false;
  }
});

module.exports = {
  authLimiter,
  magicLinkLimiter,
  refreshTokenLimiter,
  createProfileLimiter,
  // Test versions with lower limits
  testMagicLinkLimiter,
  testRefreshLimiter
};
