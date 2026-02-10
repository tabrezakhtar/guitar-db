const { google } = require("googleapis");
const User = require("../models/user");

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
    console.error("Missing YOUTUBE_API_KEY environment variable");
    // process.exit(1);
}

const youtube = google.youtube({ version: "v3", auth: API_KEY });

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
  if (!res.data.items || res.data.items.length === 0) {
    return null;
  }
  return res.data.items[0].id;
}

async function getUploadsPlaylistId(id) {
  const res = await youtube.channels.list({
    part: ["contentDetails"],
    id: [id]
  });
  if (!res.data.items || res.data.items.length === 0) {
    return null;
  }
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

async function getYoutubeVideos(req, res, next) {
  try {
    if (!req.body || !req.body.url) {
      return res.status(400).json({
        message: "URL is required",
        errors: "Please provide a YouTube URL, channel handle, or channel ID"
      });
    }

    const { url, maxResults = 50 } = req.body;

    const parsed = extractChannelIdOrHandle(url);
    if (!parsed) {
      return res.status(400).json({
        message: "Invalid input",
        errors: "Please provide a valid YouTube URL, handle (e.g., @andertons), or channel ID"
      });
    }

    const { type, value } = parsed;
    let channelId = value;

    if (type === "handle") {
      channelId = await getChannelId(value);
      if (!channelId) {
        return res.status(404).json({
          message: "Channel not found",
          errors: "No YouTube channel found for this handle"
        });
      }
    }

    let uploadsPlaylistId = null;

    if (req.user && req.user._id) {
      const user = await User.findById(req.user._id).select("uploadsPlaylistId youtubeChannelId");
      if (user && user.youtubeChannelId === channelId && user.uploadsPlaylistId) {
        uploadsPlaylistId = user.uploadsPlaylistId;
      }
    }

    if (!uploadsPlaylistId) {
      uploadsPlaylistId = await getUploadsPlaylistId(channelId);
      if (!uploadsPlaylistId) {
        return res.status(404).json({
          message: "Channel not found",
          errors: "No YouTube channel found with this ID"
        });
      }

      if (req.user && req.user._id) {
        await User.findByIdAndUpdate(req.user._id, {
          uploadsPlaylistId,
          youtubeChannelId: channelId
        });
      }
    }

    const videos = await getLatestVideos(uploadsPlaylistId, maxResults);

    res.status(200).json({
      message: "Videos fetched successfully",
      channelId,
      videos
    });
  } catch (error) {
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({
        message: "YouTube API error",
        errors: error.response.data.error?.message || error.message
      });
    }
    next(error);
  }
}

module.exports = { getYoutubeVideos };