const mockUserConstructor = jest.fn();
const mockUserFindOne = jest.fn();
const mockUserFindById = jest.fn();
const mockEmailSend = jest.fn();

jest.mock("../models/user", () => Object.assign(mockUserConstructor, {
  findOne: mockUserFindOne,
  findById: mockUserFindById
}));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn(), verify: jest.fn() }));
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockEmailSend } }))
}));
jest.mock("../helpers/cookies", () => ({ setAuthCookies: jest.fn() }));

const jwt = require("jsonwebtoken");
const { setAuthCookies } = require("../helpers/cookies");
const { registerUser, verifyCode } = require("./register");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("registration routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.EMAIL = "test-email-key";
    mockEmailSend.mockResolvedValue({});
    mockUserConstructor.mockImplementation(data => ({
      ...data,
      _id: { toString: () => "user-1" },
      save: jest.fn().mockResolvedValue(undefined),
      toObject: () => ({ ...data, _id: "user-1", verificationCode: "1234" })
    }));
  });

  test("rejects missing registration fields", async () => {
    const res = createResponse();

    await registerUser({ body: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ["Username is required", "Email is required"],
      missing: ["username", "email"]
    });
    expect(mockUserFindOne).not.toHaveBeenCalled();
  });

  test("rejects an overlong username", async () => {
    const res = createResponse();

    await registerUser({ body: { username: "u".repeat(26), email: "a@example.com" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      errors: ["Username must be 25 characters or less"],
      missing: ["username"]
    });
  });

  test("requires both verification code and user ID", async () => {
    const res = createResponse();

    await verifyCode({ body: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      showVerificationForm: true,
      errors: ["Verification code is required", "User ID is required"],
      missing: ["code", "userId"]
    }));
    expect(mockUserFindById).not.toHaveBeenCalled();
  });

  test("rejects a verification request for an unknown user", async () => {
    mockUserFindById.mockResolvedValue(null);
    const res = createResponse();

    await verifyCode({ body: { code: "1234", userId: "missing" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      showVerificationForm: false,
      errors: ["Invalid verification request. Please try logging in again."]
    }));
    expect(jwt.sign).not.toHaveBeenCalled();
    expect(setAuthCookies).not.toHaveBeenCalled();
  });
});