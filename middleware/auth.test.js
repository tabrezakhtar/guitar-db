jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock("../models/equipment", () => ({
  Equipment: { findById: jest.fn() },
  Comments: { findById: jest.fn() }
}));

jest.mock("../models/user", () => ({ findById: jest.fn() }));

const jwt = require("jsonwebtoken");
const { Equipment, Comments } = require("../models/equipment");
const User = require("../models/user");
const {
  verifyToken,
  verifyTokenOptional,
  checkEquipmentOwnership,
  checkUserOwnership,
  checkCommentOwnership,
  checkBanned
} = require("./auth");

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
    cookie: jest.fn()
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

describe("authentication middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
  });

  test("accepts a valid access token and sets the request user", () => {
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: "user-1" }));
    const req = { cookies: { accessToken: "access", refreshToken: "refresh" } };
    const res = createResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("access", "test-secret", expect.any(Function));
    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects when no refresh token is provided", () => {
    const req = { cookies: { accessToken: "access" } };
    const res = createResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "No refresh token, authorization denied",
      errors: "Authentication required"
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("refreshes tokens when the access token is expired", () => {
    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === "access") {
        return callback({ name: "TokenExpiredError" });
      } else {
        return callback(null, { id: "user-2" });
      }
    });
    jwt.sign.mockReturnValueOnce("new-access").mockReturnValueOnce("new-refresh");
    const req = { cookies: { accessToken: "access", refreshToken: "refresh" } };
    const res = createResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(jwt.sign).toHaveBeenNthCalledWith(1, { id: "user-2" }, "test-secret", { expiresIn: "15m" });
    expect(jwt.sign).toHaveBeenNthCalledWith(2, { id: "user-2" }, "test-secret", { expiresIn: "7d" });
    expect(res.cookie).toHaveBeenNthCalledWith(1, "accessToken", "new-access", expect.objectContaining({ maxAge: 15 * 60 * 1000 }));
    expect(res.cookie).toHaveBeenNthCalledWith(2, "refreshToken", "new-refresh", expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 * 1000 }));
    expect(req.userId).toBe("user-2");
    expect(next).toHaveBeenCalled();
  });

  test("rejects when the refresh token is invalid", () => {
    jwt.verify.mockImplementation((token, secret, callback) => callback({ name: "JsonWebTokenError" }));
    const req = { cookies: { accessToken: "access", refreshToken: "refresh" } };
    const res = createResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Refresh token expired or invalid",
      errors: "Your session has expired. Please log in again."
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("allows optional authentication without a refresh token", () => {
    const req = { cookies: {} };
    const next = jest.fn();

    verifyTokenOptional(req, createResponse(), next);

    expect(next).toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test("sets the user for a valid optional access token", () => {
    jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: "user-3" }));
    const req = { cookies: { accessToken: "access", refreshToken: "refresh" } };
    const next = jest.fn();

    verifyTokenOptional(req, createResponse(), next);

    expect(req.userId).toBe("user-3");
    expect(next).toHaveBeenCalled();
  });
});

describe("ownership and account middleware", () => {
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createResponse();
    next = jest.fn();
  });

  test("requires an equipment ID", async () => {
    await checkEquipmentOwnership({ params: {}, body: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Equipment.findById).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 404 when equipment does not exist", async () => {
    Equipment.findById.mockResolvedValue(null);

    await checkEquipmentOwnership({ params: { id: "equipment-1" }, body: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("rejects equipment owned by another user", async () => {
    Equipment.findById.mockResolvedValue({ user: { toString: () => "owner" } });

    await checkEquipmentOwnership({ params: { id: "equipment-1" }, body: {}, userId: "other" }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches equipment and continues when the user owns it", async () => {
    const equipment = { user: { toString: () => "user-1" } };
    Equipment.findById.mockResolvedValue(equipment);
    const req = { params: { id: "equipment-1" }, body: {}, userId: "user-1" };

    await checkEquipmentOwnership(req, res, next);

    expect(req.equipment).toBe(equipment);
    expect(next).toHaveBeenCalled();
  });

  test("allows only the authenticated user to modify their profile", async () => {
    const req = { params: {}, body: { _id: "user-1" }, query: {}, userId: "user-1" };

    await checkUserOwnership(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects a profile ID that does not match the authenticated user", async () => {
    await checkUserOwnership(
      { params: { userId: "user-2" }, body: {}, query: {}, userId: "user-1" },
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("attaches a comment when the authenticated user owns it", async () => {
    const comment = { user: { toString: () => "user-1" } };
    Comments.findById.mockResolvedValue(comment);
    const req = { params: { id: "comment-1" }, body: {}, userId: "user-1" };

    await checkCommentOwnership(req, res, next);

    expect(req.comment).toBe(comment);
    expect(next).toHaveBeenCalled();
  });

  test("reports a missing comment", async () => {
    Comments.findById.mockResolvedValue(null);

    await checkCommentOwnership({ params: { id: "comment-1" }, body: {}, userId: "user-1" }, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("rejects banned users", async () => {
    User.findById.mockResolvedValue({ isBanned: () => true });

    await checkBanned({ userId: "user-1" }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ banned: true }));
    expect(next).not.toHaveBeenCalled();
  });

  test("continues for users who are not banned", async () => {
    User.findById.mockResolvedValue({ isBanned: () => false });

    await checkBanned({ userId: "user-1" }, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("forwards equipment lookup errors to Express", async () => {
    const error = new Error("database unavailable");
    Equipment.findById.mockRejectedValue(error);

    await checkEquipmentOwnership({ params: { id: "equipment-1" }, body: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});