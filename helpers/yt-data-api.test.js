const mockYoutube = {
  channels: { list: jest.fn() },
  playlistItems: { list: jest.fn() }
};

jest.mock("googleapis", () => ({
  google: {
    youtube: jest.fn(() => mockYoutube)
  }
}));

const originalApiKey = process.env.YOUTUBE_API_KEY;
process.env.YOUTUBE_API_KEY = "test-api-key";

const { google } = require("googleapis");
const {
  extractChannelIdOrHandle,
  getChannelId,
  getUploadsPlaylistId,
  getLatestVideos,
  main
} = require("./yt-data-api");

describe("YouTube Data API helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.YOUTUBE_API_KEY;
    } else {
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });

  describe("extractChannelIdOrHandle", () => {
    test.each([
      ["@riff-tales", { type: "handle", value: "riff-tales" }],
      ["riff.tales", { type: "handle", value: "riff.tales" }],
      ["UC0123456789abcdefghijkl", { type: "id", value: "UC0123456789abcdefghijkl" }],
      ["https://www.youtube.com/@riff-tales/videos", { type: "handle", value: "riff-tales" }],
      ["https://youtube.com/channel/UC0123456789abcdefghijkl?view=1", { type: "id", value: "UC0123456789abcdefghijkl" }]
    ])("parses %s", (input, expected) => {
      expect(extractChannelIdOrHandle(input)).toEqual(expected);
    });

    test.each([undefined, "", "x", "https://youtube.com/c/custom-name"]) (
      "returns null for unsupported input %s",
      input => {
        expect(extractChannelIdOrHandle(input)).toBeNull();
      }
    );
  });

  test("creates the YouTube client with the API key", () => {
    jest.resetModules();
    const { google: freshGoogle } = require("googleapis");
    require("./yt-data-api");

    expect(freshGoogle.youtube).toHaveBeenCalledWith({
      version: "v3",
      auth: "test-api-key"
    });
  });

  test("reports a missing API key when main is called without one", async () => {
    delete process.env.YOUTUBE_API_KEY;
    jest.resetModules();
    const { main: mainWithoutApiKey } = require("./yt-data-api");
    const exit = jest.spyOn(process, "exit").mockImplementation(() => {});
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    await mainWithoutApiKey();

    expect(error).toHaveBeenCalledWith("Missing YOUTUBE_API_KEY environment variable");
    expect(exit).toHaveBeenCalledWith(1);

    exit.mockRestore();
    error.mockRestore();
  });

  test("looks up a channel ID by handle", async () => {
    mockYoutube.channels.list.mockResolvedValue({ data: { items: [{ id: "channel-id" }] } });

    await expect(getChannelId("riff-tales")).resolves.toBe("channel-id");
    expect(mockYoutube.channels.list).toHaveBeenCalledWith({
      part: ["id"],
      forHandle: "riff-tales"
    });
  });

  test("looks up a channel's uploads playlist", async () => {
    mockYoutube.channels.list.mockResolvedValue({
      data: { items: [{ contentDetails: { relatedPlaylists: { uploads: "uploads-id" } } }] }
    });

    await expect(getUploadsPlaylistId("channel-id")).resolves.toBe("uploads-id");
    expect(mockYoutube.channels.list).toHaveBeenCalledWith({
      part: ["contentDetails"],
      id: ["channel-id"]
    });
  });

  test("maps playlist items to the public video format", async () => {
    mockYoutube.playlistItems.list.mockResolvedValue({
      data: {
        items: [{
          snippet: {
            title: "New song",
            publishedAt: "2026-10-21T12:00:00Z",
            thumbnails: { high: { url: "https://example.com/thumbnail.jpg" } },
            resourceId: { videoId: "video-id" }
          }
        }]
      }
    });

    await expect(getLatestVideos("uploads-id", 10)).resolves.toEqual([{
      title: "New song",
      videoId: "video-id",
      publishedAt: "2026-10-21T12:00:00Z",
      thumbnail: "https://example.com/thumbnail.jpg",
      url: "https://www.youtube.com/watch?v=video-id"
    }]);
    expect(mockYoutube.playlistItems.list).toHaveBeenCalledWith({
      part: ["snippet"],
      playlistId: "uploads-id",
      maxResults: 10
    });
  });

  test("uses five results by default", async () => {
    mockYoutube.playlistItems.list.mockResolvedValue({ data: { items: [] } });

    await expect(getLatestVideos("uploads-id")).resolves.toEqual([]);
    expect(mockYoutube.playlistItems.list).toHaveBeenCalledWith({
      part: ["snippet"],
      playlistId: "uploads-id",
      maxResults: 5
    });
  });
});