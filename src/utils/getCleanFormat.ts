import { type videoFormat } from "ytdl-core";

export const getCleanFormat = ({
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
