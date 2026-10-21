jest.mock("../models/user", () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn()
}));
jest.mock("../helpers/cookies", () => ({ clearAuthCookies: jest.fn() }));

const User = require("../models/user");
const { clearAuthCookies } = require("../helpers/cookies");
const { logout, getUserStatus, followUser, updateFavUsers } = require("./users");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("user routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("logs out and clears auth cookies", async () => {
    const res = createResponse();

    await logout({}, res, jest.fn());

    expect(clearAuthCookies).toHaveBeenCalledWith(res, false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Logout successful" });
  });

  test("reports a missing user status", async () => {
    User.findById.mockResolvedValue(null);
    const res = createResponse();

    await getUserStatus({ userId: "missing" }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User not found" }));
  });

  test("rejects attempts to follow yourself", async () => {
    const res = createResponse();

    await followUser({ userId: "user-1", body: { targetUserId: "user-1" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("adds the current user to the target's followers", async () => {
    User.findById
      .mockResolvedValueOnce({ _id: "target" })
      .mockResolvedValueOnce({ followers: [] });
    User.findByIdAndUpdate.mockResolvedValue({});
    const res = createResponse();

    await followUser({ userId: "current", body: { targetUserId: "target" } }, res, jest.fn());

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("target", {
      $addToSet: { followers: "current" }
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updates favorites after filtering empty and self IDs", async () => {
    User.findByIdAndUpdate.mockResolvedValue({});
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "current" }) });
    const res = createResponse();

    await updateFavUsers({ userId: "current", body: { userIds: ["user-2", "", "current", null] } }, res, jest.fn());

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith("current", {
      $set: { favUsers: ["user-2"] }
    });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: { _id: "current" } }));
  });

  test("rejects a favorites payload that is not an array", async () => {
    const res = createResponse();

    await updateFavUsers({ userId: "current", body: { userIds: "user-2" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});