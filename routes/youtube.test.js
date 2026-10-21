const mockYoutube = {
  channels: { list: jest.fn() },
  playlistItems: { list: jest.fn() },
  search: { list: jest.fn() },
  videos: { list: jest.fn() }
};
const mockUser = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
};
const mockLivestream = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn()
};

jest.mock("googleapis", () => ({ google: { youtube: jest.fn(() => mockYoutube) } }));
jest.mock("../models/user", () => mockUser);
jest.mock("../models/livestream", () => mockLivestream);

const originalApiKey = process.env.YOUTUBE_API_KEY;
process.env.YOUTUBE_API_KEY = "test-youtube-key";

const { getYoutubeVideosByUser, saveYoutubeChannel, proxyYoutubeImage } = require("./youtube");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("YouTube routes", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.YOUTUBE_API_KEY;
    } else {
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });

  test("requires a user ID when requesting videos", async () => {
    const res = createResponse();

    await getYoutubeVideosByUser({ query: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockUser.findById).not.toHaveBeenCalled();
  });

  test("returns the user's latest videos", async () => {
    const user = {
      uploadsPlaylistId: "uploads-1",
      youtubeChannelTitle: "Riff Tales",
      youtubeChannelAvatar: "avatar-url",
      youtubeChannelHandle: "riff-tales"
    };
    mockUser.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    mockYoutube.playlistItems.list.mockResolvedValue({
      data: { items: [{ snippet: {
        title: "New video",
        publishedAt: "2026-10-21T12:00:00Z",
        thumbnails: { high: { url: "thumbnail-url" } },
        resourceId: { videoId: "video-1" }
      } }] }
    });
    const res = createResponse();

    await getYoutubeVideosByUser({ query: { userId: "user-1", maxResults: "12" } }, res, jest.fn());

    expect(mockYoutube.playlistItems.list).toHaveBeenCalledWith({
      part: ["snippet"],
      playlistId: "uploads-1",
      maxResults: 12
    });
    expect(res.json).toHaveBeenCalledWith({
      title: "Riff Tales",
      avatar: "avatar-url",
      handle: "riff-tales",
      videos: [{
        title: "New video",
        videoId: "video-1",
        publishedAt: "2026-10-21T12:00:00Z",
        thumbnail: "thumbnail-url",
        url: "https://www.youtube.com/watch?v=video-1"
      }]
    });
  });

  test("removes a linked channel when the URL is blank", async () => {
    const res = createResponse();

    await saveYoutubeChannel({ body: { url: "  " }, userId: "user-1" }, res, jest.fn());

    expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith("user-1", {
      uploadsPlaylistId: "",
      youtubeChannelId: "",
      youtubeChannelHandle: "",
      youtubeChannelTitle: "",
      youtubeChannelAvatar: "",
      youtubeChannelBanner: "",
      youtubeChannelUrl: ""
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "YouTube channel removed successfully" }));
  });

  test("rejects image proxy URLs outside the allowlist", async () => {
    const res = createResponse();

    await proxyYoutubeImage({ query: { url: "https://example.com/image.jpg" } }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid URL" }));
  });
});