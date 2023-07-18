import ytdl, { type MoreVideoDetails, type videoFormat } from "ytdl-core";
import { FormatType, type Format } from "~/typing";

export interface InfoResponse {
  videoDetails: MoreVideoDetails;
  formats: Format[];
}

export const requestInfoFromYoutube = async (url: string) => {
  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  try {
    const { videoDetails, formats } = await ytdl.getInfo(url);

    const filteredFormats = filterFormats(formats);
    return { videoDetails, formats: filteredFormats };
  } catch (error) {
    console.error(error);
    return { msg: "Error on requesting video info from YouTube" };
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
