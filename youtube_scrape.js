const { Innertube } = require("youtubei.js");

async function getLiveStreams(channelId) {
  const yt = await Innertube.create();

  const channel = await yt.getChannel(channelId);

  // Get the Live tab
  const liveTab = await channel.getLiveStreams();

  const streams = liveTab.videos.map(video => ({
    title: video.title?.toString(),
    videoId: video.id,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    isLive: video.is_live,
    isUpcoming: video.is_upcoming,
    startTime: video.upcoming?.start_time,
    thumbnail: video.thumbnails?.[0]?.url || video.best_thumbnail?.url,
    description: video.description?.toString() || video.snippets?.[0]?.text?.toString()
  }));

  return streams;
}

(async () => {
  const streams = await getLiveStreams('');
  console.log(streams);
})();