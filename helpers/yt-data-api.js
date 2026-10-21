const { google } = require('googleapis');
const API_KEY = process.env.YOUTUBE_API_KEY;
const youtube = API_KEY ? google.youtube({ version: "v3", auth: API_KEY }) : null;

function extractChannelIdOrHandle(input) {
  if (!input) return null;
  const value = String(input).trim();
  if (value.includes("youtube.com") || value.includes("youtu.be")) {
    if (value.includes("/@")) {
      const handle = value.split("/@")[1].split("/")[0].split("?")[0];
      return { type: "handle", value: handle.replace(/^@/, "") };
    }
    if (value.includes("/channel/")) {
      const channelId = value.split("/channel/")[1].split("/")[0].split("?")[0];
      return { type: "id", value: channelId };
    }
    return null;
  }
  const cleaned = value.replace(/^@/, "");
  if (/^UC[A-Za-z0-9_-]{22}$/.test(cleaned)) {
    return { type: "id", value: cleaned };
  }
  if (/^[A-Za-z0-9_.-]{2,}$/.test(cleaned)) {
    return { type: "handle", value: cleaned };
  }
  return null;
}

async function getChannelId(handle) {
  const res = await youtube.channels.list({
    part: ["id"],
    forHandle: handle
  });
  return res.data.items[0].id;
}

async function getUploadsPlaylistId(id) {
  const res = await youtube.channels.list({
    part: ["contentDetails"],
    id: [id]
  });
  return res.data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getLatestVideos(playlistId, maxResults = 5) {
  const res = await youtube.playlistItems.list({
    part: ["snippet"],
    playlistId,
    maxResults
  });

  return res.data.items.map(item => ({
    title: item.snippet.title,
    videoId: item.snippet.resourceId.videoId,
    publishedAt: item.snippet.publishedAt,
    thumbnail: item.snippet.thumbnails.high.url,
    url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
  }));
}

async function main() {
  if (!API_KEY) {
    console.error("Missing YOUTUBE_API_KEY environment variable");
    process.exit(1);
    return;
  }

  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node yt-data-api.js <youtube_url>");
    process.exit(1);
  }
  const parsed = extractChannelIdOrHandle(url);
  if (!parsed) {
    console.error("Invalid YouTube URL");
    process.exit(1);
  }
  const { type, value } = parsed;
  let channelId = value;
  if (type === "handle") {
    channelId = await getChannelId(value);
  }
  const uploadsPlaylistId = await getUploadsPlaylistId(channelId);
  const videos = await getLatestVideos(uploadsPlaylistId, 50);
  console.log(JSON.stringify(videos, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = {
  extractChannelIdOrHandle,
  getChannelId,
  getUploadsPlaylistId,
  getLatestVideos,
  main
};
