jest.mock("../models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn()
}));
jest.mock("../models/equipment.js", () => ({
  Equipment: { find: jest.fn(), deleteMany: jest.fn(), updateMany: jest.fn() },
  Comments: { deleteMany: jest.fn() }
}));
jest.mock("../helpers/cloudinary", () => ({ deleteCloudinaryImages: jest.fn() }));
jest.mock("../helpers/cookies", () => ({ clearAuthCookies: jest.fn() }));
jest.mock("./youtube", () => ({ saveYoutubeChannel: jest.fn() }));

const User = require("../models/user");
const { Equipment, Comments } = require("../models/equipment.js");
const { deleteCloudinaryImages } = require("../helpers/cloudinary");
const { clearAuthCookies } = require("../helpers/cookies");
const { getUserProfile, updateUserProfile, deleteUserProfile } = require("./profile");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("profile routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("requires an ID when reading a profile", async () => {
    const res = createResponse();

    await getUserProfile({ query: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("updates profile fields and returns the saved profile", async () => {
    const user = {
      _id: "user-1",
      username: "new-name",
      bio: "Bio",
      location: "London",
      website: "example.com",
      createdAt: new Date("2026-01-01"),
      avatarUrl: "avatar",
      save: jest.fn().mockResolvedValue(undefined)
    };
    User.findOne.mockResolvedValue(null);
    User.findById.mockResolvedValue(user);
    const res = createResponse();

    await updateUserProfile({ body: {
      _id: "user-1",
      username: "new-name",
      bio: "Bio",
      location: "London",
      website: "example.com",
      visibility: 1,
      featured: true
    } }, res, jest.fn());

    expect(user.save).toHaveBeenCalled();
    expect(user.visibility).toBe(1);
    expect(user.featured).toBe(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Profile updated successfully",
      user: expect.objectContaining({ _id: "user-1", username: "new-name", visibility: 1, featured: true })
    }));
  });

  test("deletes profile data and clears authentication cookies", async () => {
    const user = { _id: "user-1", avatarUrl: "avatar-url" };
    const equipment = [{ images: ["guitar-image"] }, { images: [] }];
    User.findById.mockResolvedValue(user);
    Equipment.find.mockResolvedValue(equipment);
    Equipment.deleteMany.mockResolvedValue({ deletedCount: 2 });
    Comments.deleteMany.mockResolvedValue({ deletedCount: 1 });
    Equipment.updateMany.mockResolvedValue({});
    User.findByIdAndDelete.mockResolvedValue(user);
    const res = createResponse();

    await deleteUserProfile({ body: { userId: "user-1" } }, res, jest.fn());

    expect(deleteCloudinaryImages).toHaveBeenCalledWith(["avatar-url", "guitar-image"]);
    expect(Equipment.deleteMany).toHaveBeenCalledWith({ user: "user-1" });
    expect(Comments.deleteMany).toHaveBeenCalledWith({ user: "user-1" });
    expect(Equipment.updateMany).toHaveBeenCalledWith(
      { likes: "user-1" },
      { $pull: { likes: "user-1" } }
    );
    expect(User.findByIdAndDelete).toHaveBeenCalledWith("user-1");
    expect(clearAuthCookies).toHaveBeenCalledWith(res, false);
    expect(res.json).toHaveBeenCalledWith({
      message: "User profile deleted successfully",
      deletedImages: 2,
      deletedEquipment: 2
    });
  });
});