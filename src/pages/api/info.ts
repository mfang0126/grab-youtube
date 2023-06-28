import { type NextApiRequest, type NextApiResponse } from "next";
import ytdl, { type videoFormat } from "ytdl-core";
import { type Format } from "~/typing";

const getCleanFormat = ({
  itag,
  quality,
  qualityLabel,
  container,
  contentLength,
  hasAudio,
  hasVideo,
  mimeType,
}: videoFormat) => ({
  itag,
  quality,
  qualityLabel,
  container,
  contentLength,
  hasAudio,
  hasVideo,
  mimeType,
});

export interface InfoResponse {
  title: string;
  audioOnlyFormats: Format[];
  videoOnlyFormats: Format[];
  videoWithAudio: Format[];
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InfoResponse>
) {
  const { url } = req.query;

  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  const { videoDetails, formats } = await ytdl.getInfo(url);
  const { title } = videoDetails;

  const filteredFormats = formats.filter(
    (format) => format.container === "mp4"
  );

  const audioOnlyFormats = filteredFormats
    .filter((format) => !format.hasVideo && format.hasAudio)
    .map(getCleanFormat);
  const videoOnlyFormats = filteredFormats
    .filter((format) => format.hasVideo && !format.hasAudio)
    .map(getCleanFormat);
  const videoWithAudio = filteredFormats
    .filter((format) => format.hasVideo && format.hasAudio)
    .map(getCleanFormat);

  return res.json({
    title,
    audioOnlyFormats,
    videoOnlyFormats,
    videoWithAudio,
  });
}
