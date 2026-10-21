const mockRateLimit = jest.fn(() => jest.fn());
const mockMongoStore = jest.fn();

jest.mock("express-rate-limit", () => (...args) => mockRateLimit(...args));
jest.mock("rate-limit-mongo", () => jest.fn((...args) => mockMongoStore(...args)));

const limiterNames = [
  "authLimiter",
  "magicLinkLimiter",
  "refreshTokenLimiter",
  "createProfileLimiter",
  "testMagicLinkLimiter",
  "testRefreshLimiter",
  "generateDescriptionLimiter"
];

function loadRateLimiters(enabled) {
  jest.resetModules();
  process.env.RATE_LIMIT = enabled ? "true" : "false";
  process.env.DATABASE_URI = "mongodb://example/test";
  mockRateLimit.mockClear();
  mockMongoStore.mockClear();
  return require("./rateLimiter");
}

describe("rate limiter middleware", () => {
  afterAll(() => {
    delete process.env.RATE_LIMIT;
    delete process.env.DATABASE_URI;
  });

  test("exports pass-through middleware when rate limiting is disabled", () => {
    const limiters = loadRateLimiters(false);
    const req = {};
    const res = {};
    const next = jest.fn();

    limiterNames.forEach(name => {
      expect(limiters[name](req, res, next)).toBeUndefined();
    });

    expect(next).toHaveBeenCalledTimes(limiterNames.length);
  });

  test("configures Mongo-backed limiters when enabled", () => {
    loadRateLimiters(true);

    expect(mockRateLimit).toHaveBeenCalledTimes(7);
    expect(mockMongoStore).toHaveBeenCalledTimes(7);
    expect(mockMongoStore).toHaveBeenCalledWith({
      uri: "mongodb://example/test",
      collectionName: "authRateLimits",
      expireTimeMs: 15 * 60 * 1000
    });
  });

  test("uses the expected limits and per-user key for description generation", () => {
    loadRateLimiters(true);

    const configs = mockRateLimit.mock.calls.map(([config]) => config);
    const descriptionConfig = configs[6];

    expect(configs.map(({ max }) => max)).toEqual([10, 5, 20, 5, 2, 3, 2]);
    expect(descriptionConfig.windowMs).toBe(60 * 1000);
    expect(descriptionConfig.keyGenerator({ userId: "user-1", ip: "127.0.0.1" })).toBe("user-1");
    expect(descriptionConfig.keyGenerator({ ip: "127.0.0.1" })).toBe("127.0.0.1");
  });

  test("uses the configured response messages for exceeded limits", () => {
    loadRateLimiters(true);

    const configs = mockRateLimit.mock.calls.map(([config]) => config);

    expect(configs[0].message).toEqual(expect.objectContaining({ message: "Too many authentication attempts" }));
    expect(configs[1].message).toEqual(expect.objectContaining({ message: "Too many magic link requests" }));
    expect(configs[6].message).toEqual(expect.objectContaining({ message: "Too many description generation requests" }));
  });
});