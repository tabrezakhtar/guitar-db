const { google } = require("googleapis");
const User = require("../models/user");
const Livestream = require("../models/livestream");

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

async function getChannelDetails(id) {
  const res = await youtube.channels.list({
    part: ["snippet", "contentDetails", "brandingSettings"],
    id: [id]
  });

  if (!res.data.items || res.data.items.length === 0) return null;
  const item = res.data.items[0];
  const uploads = item.contentDetails?.relatedPlaylists?.uploads || null;
  const title = item.snippet?.title || "";
  const avatar = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "";
  const banner = item.brandingSettings?.image?.bannerExternalUrl || "";
  return { uploadsPlaylistId: uploads, title, avatar, banner };
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

async function getYoutubeVideosByUser(req, res, next) {
  try {
    const { userId, maxResults = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        errors: "Please provide a userId"
      });
    }

    const user = await User.findById(userId).select("uploadsPlaylistId youtubeChannelId youtubeChannelHandle youtubeChannelTitle youtubeChannelAvatar");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    if (!user.uploadsPlaylistId) {
      return res.status(404).json({
        message: "No YouTube channel linked",
        errors: "This user has not linked a YouTube channel"
      });
    }

    const videos = await getLatestVideos(user.uploadsPlaylistId, Number(maxResults) || 50);

    res.status(200).json({
      title: user.youtubeChannelTitle || "",
      avatar: user.youtubeChannelAvatar || "",
      handle: user.youtubeChannelHandle || "",
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

async function getYoutubeLivestreamsByUser(req, res, next) {
  try {
    const { userId, maxResults = 50 } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        errors: "Please provide a userId"
      });
    }

    const user = await User.findById(userId).select("youtubeChannelId youtubeChannelHandle youtubeChannelTitle youtubeChannelAvatar uploadsPlaylistId");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: "No user found with this ID"
      });
    }

    if (!user.youtubeChannelId) {
      return res.status(404).json({
        message: "No YouTube channel linked",
        errors: "This user has not linked a YouTube channel"
      });
    }

    const cached = await Livestream.findOne({ userId });
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (cached && cached.cachedAt > oneHourAgo) {
      return res.status(200).json({
        title: user.youtubeChannelTitle || "",
        avatar: user.youtubeChannelAvatar || "",
        handle: user.youtubeChannelHandle || "",
        streams: cached.streams,
        previousStreams: cached.previousStreams || []
      });
    }

    const ytRes = await youtube.search.list({
      part: ["snippet"],
      channelId: user.youtubeChannelId,
      type: ["video"],
      maxResults: Number(maxResults) || 50,
      order: "date"
    });

    const liveStreams = (ytRes.data.items || [])
      .filter(item => item.snippet.liveBroadcastContent === "live")
      .map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        status: "live"
      }));

    const upcomingStreams = (ytRes.data.items || [])
      .filter(item => item.snippet.liveBroadcastContent === "upcoming")
      .map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        status: "upcoming"
      }));

    const streams = [...liveStreams, ...upcomingStreams];

    let previousStreams = [];
    if (user.uploadsPlaylistId) {
      try {
        const recentVideos = await getLatestVideos(user.uploadsPlaylistId, 20);
        console.log(JSON.stringify(recentVideos, null, 2));
        const videoIds = recentVideos.map(v => v.videoId).join(",");
        
        if (videoIds) {
          const videosRes = await youtube.videos.list({
            part: ["snippet", "liveStreamingDetails"],
            id: videoIds
          });

          previousStreams = (videosRes.data.items || [])
            .filter(item => item.liveStreamingDetails && item.liveStreamingDetails.actualEndTime)
            .slice(0, 5)
            .map(item => ({
              title: item.snippet.title,
              videoId: item.id,
              publishedAt: item.snippet.publishedAt,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
              url: `https://www.youtube.com/watch?v=${item.id}`,
              status: "completed"
            }));
        }
      } catch (error) {
        console.error("Error fetching previous streams:", error);
      }
    }

    await Livestream.findOneAndUpdate(
      { userId },
      { streams, previousStreams, cachedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      title: user.youtubeChannelTitle || "",
      avatar: user.youtubeChannelAvatar || "",
      handle: user.youtubeChannelHandle || "",
      streams,
      previousStreams
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

async function saveYoutubeChannel(req, res, next) {
  try {
    const { url } = req.body;

    if (!url || url.trim() === "") {
      await User.findByIdAndUpdate(req.userId, {
        uploadsPlaylistId: "",
        youtubeChannelId: "",
        youtubeChannelHandle: "",
        youtubeChannelTitle: "",
        youtubeChannelAvatar: "",
        youtubeChannelBanner: "",
        youtubeChannelUrl: ""
      });

      return res.status(200).json({
        message: "YouTube channel removed successfully",
        title: "",
        avatar: "",
        banner: "",
        handle: "",
        youtubeChannelId: "",
        uploadsPlaylistId: "",
        youtubeChannelUrl: ""
      });
    }

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

    const details = await getChannelDetails(channelId);
    if (!details || !details.uploadsPlaylistId) {
      return res.status(404).json({
        message: "Channel not found",
        errors: "No YouTube channel found with this ID"
      });
    }

    const handleToSave = (type === "handle") ? value : "";
    const youtubeUrl = handleToSave ? `https://www.youtube.com/@${handleToSave}` : `https://www.youtube.com/channel/${channelId}`;
    
    await User.findByIdAndUpdate(req.userId, {
      uploadsPlaylistId: details.uploadsPlaylistId,
      youtubeChannelId: channelId,
      youtubeChannelHandle: handleToSave,
      youtubeChannelTitle: details.title,
      youtubeChannelAvatar: details.avatar,
      youtubeChannelBanner: details.banner,
      youtubeChannelUrl: youtubeUrl
    });

    res.status(200).json({
      message: "YouTube channel saved successfully",
      title: details.title,
      avatar: details.avatar,
      banner: details.banner,
      handle: handleToSave,
      youtubeChannelId: channelId,
      uploadsPlaylistId: details.uploadsPlaylistId,
      youtubeChannelUrl: youtubeUrl
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

async function proxyYoutubeImage(req, res, next) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        message: "URL is required",
        errors: "Please provide a YouTube image URL"
      });
    }

    if (!url.includes("yt3.ggpht.com") && !url.includes("ytimg.com") && !url.includes("yt3.googleusercontent.com") && !url.includes("res.cloudinary.com/dx8d5hlk1")) {
      return res.status(400).json({
        message: "Invalid URL",
        errors: "Only YouTube and Cloudinary image URLs are allowed"
      });
    }

    const https = require("https");
    const http = require("http");
    const protocol = url.startsWith("https") ? https : http;

    protocol.get(url, (imageRes) => {
      if (imageRes.statusCode !== 200) {
        return res.status(imageRes.statusCode).json({
          message: "Failed to fetch image",
          errors: "Could not load the image from YouTube"
        });
      }

      res.setHeader("Content-Type", imageRes.headers["content-type"] || "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      imageRes.pipe(res);
    }).on("error", (err) => {
      res.status(500).json({
        message: "Error fetching image",
        errors: err.message
      });
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getYoutubeVideosByUser, getYoutubeLivestreamsByUser, saveYoutubeChannel, proxyYoutubeImage };