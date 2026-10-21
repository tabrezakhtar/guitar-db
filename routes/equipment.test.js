const mockEquipment = { findById: jest.fn() };
const mockGuitar = {
  find: jest.fn(),
  countDocuments: jest.fn()
};
const mockTagUpdateMany = jest.fn();
const mockDeleteImages = jest.fn();
const mockGenerateDescription = jest.fn();

jest.mock("../models/equipment.js", () => ({
  Guitar: mockGuitar,
  Amp: {},
  Pedal: {},
  Bass: {},
  Acoustic: {},
  Accessory: {},
  Equipment: mockEquipment,
  Comments: {}
}));
jest.mock("../models/tag", () => ({ updateMany: mockTagUpdateMany }));
jest.mock("../helpers/cloudinary", () => ({ deleteCloudinaryImages: mockDeleteImages }));
jest.mock("../helpers/openrouter", () => ({ generateEquipmentDescription: mockGenerateDescription }));
jest.mock("../query-builder.js", () => ({ queryBuilder: jest.fn() }));

const { get, remove, generateDescription } = require("./equipment");

function createResponse() {
  const res = { status: jest.fn(), send: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

function createQuery(items) {
  const query = {
    collation: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    populate: jest.fn()
  };
  query.collation.mockReturnValue(query);
  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.populate.mockReturnValue(query);
  query.then = (resolve, reject) => Promise.resolve(items).then(resolve, reject);
  return query;
}

describe("equipment routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("rejects an unsupported equipment type", async () => {
    const res = createResponse();

    await get({ query: { type: "spaceship" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGuitar.find).not.toHaveBeenCalled();
  });

  test("lists visible guitars and removes private like data from items", async () => {
    const item = {
      _id: "guitar-1",
      name: "Stratocaster",
      likes: ["user-1"],
      comments: [{ text: "Nice" }],
      user: { _id: "owner", username: "riff", admin: true }
    };
    mockGuitar.find.mockReturnValue(createQuery([item]));
    mockGuitar.countDocuments.mockResolvedValue(1);
    const res = createResponse();

    await get({ query: { type: "GUITAR", page: "1", limit: "10" } }, res, jest.fn());

    expect(mockGuitar.find).toHaveBeenCalledWith({ visibility: { $ne: 1 } });
    expect(res.send).toHaveBeenCalledWith({
      items: [{
        _id: "guitar-1",
        name: "Stratocaster",
        comments: [{ text: "Nice" }],
        user: { _id: "owner", username: "riff", avatarUrl: undefined, roles: undefined },
        commentCount: 1,
        likesCount: 1
      }],
      total: 1,
      page: 1,
      pages: 1
    });
  });

  test("deletes an equipment item and its Cloudinary images", async () => {
    const item = { images: ["image-1"], deleteOne: jest.fn().mockResolvedValue(undefined) };
    mockEquipment.findById.mockResolvedValue(item);
    const res = createResponse();

    await remove({ params: { id: "equipment-1" } }, res, jest.fn());

    expect(mockDeleteImages).toHaveBeenCalledWith(["image-1"]);
    expect(item.deleteOne).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: "Equipment deleted successfully" });
  });

  test("returns a generated description", async () => {
    mockGenerateDescription.mockResolvedValue("A warm, expressive tone.");
    const res = createResponse();

    await generateDescription({ body: { name: "Jazzmaster" } }, res, jest.fn());

    expect(mockGenerateDescription).toHaveBeenCalledWith({ name: "Jazzmaster" });
    expect(res.json).toHaveBeenCalledWith({ description: "A warm, expressive tone." });
  });
});