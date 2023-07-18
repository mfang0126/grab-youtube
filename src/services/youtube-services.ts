import ytdl, { type videoFormat } from "ytdl-core";
import { FormatType, type Format } from "~/typing";

export const requestInfoFromYoutube = async (url: string) => {
  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  try {
    const { videoDetails, formats } = await ytdl.getInfo(url);
    const { videoId } = videoDetails;

    const filteredFormats = filterFormats(formats);
    return {
      videoId,
      videoDetails,
      formats: filteredFormats,
    };
  } catch (error) {
    console.error(`Error on requesting video info from YouTube: `, error);
  }
};

function getFormatType(format: videoFormat) {
  if (!format.hasVideo && format.hasAudio) {
    return FormatType.audioOnly;
  }

  if (format.hasVideo && !format.hasAudio) {
    return FormatType.videoOnly;
  }

  if (format.hasVideo && format.hasAudio) {
    return FormatType.videoWithAudio;
  }
}

function filterFormats(formats: videoFormat[]) {
  return formats
    .reduce((acc, format) => {
      if (format.container !== "mp4") return acc;

      const type = getFormatType(format);
      if (!type) return acc;

      const updatedFormat = { ...format, type };
      acc.push(updatedFormat);
      return acc;
    }, [] as Format[])
    .sort((a, b) => a.itag - b.itag);
}
