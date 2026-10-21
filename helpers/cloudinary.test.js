jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      destroy: jest.fn()
    }
  }
}));

const cloudinary = require("cloudinary").v2;
const { deleteCloudinaryImages } = require("./cloudinary");

const originalCloudinaryEnv = {
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  API_SECRET: process.env.API_SECRET
};

describe("deleteCloudinaryImages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLOUD_NAME = "test-cloud";
    process.env.API_KEY = "test-key";
    process.env.API_SECRET = "test-secret";
    cloudinary.uploader.destroy.mockImplementation((publicId) =>
      Promise.resolve({ publicId, result: "ok" })
    );
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.entries(originalCloudinaryEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  test("configures Cloudinary and deletes versioned nested image IDs", async () => {
    const images = [
      "https://res.cloudinary.com/test-cloud/image/upload/v1234567890/guitars/classic-strat.jpg"
    ];

    const results = await deleteCloudinaryImages(images);

    expect(cloudinary.config).toHaveBeenCalledWith({
      cloud_name: "test-cloud",
      api_key: "test-key",
      api_secret: "test-secret"
    });
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      "guitars/classic-strat",
      { invalidate: true }
    );
    expect(results).toEqual([
      { publicId: "guitars/classic-strat", result: "ok" }
    ]);
  });

  test("deletes image IDs when the URL has no version segment", async () => {
    await deleteCloudinaryImages([
      "https://res.cloudinary.com/test-cloud/image/upload/avatars/user-photo.png"
    ]);

    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      "avatars/user-photo",
      { invalidate: true }
    );
  });

  test("returns an empty result without deleting when given no images", async () => {
    await expect(deleteCloudinaryImages([])).resolves.toEqual([]);

    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });
});