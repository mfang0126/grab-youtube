import type { videoFormat } from "ytdl-core";
import type { FormatType } from "./typing";

export enum Collections {
  Videos = "videos",
  Jobs = "jobs",
}

export type YoutubeJob = Pick<
  videoFormat,
  | "itag"
  | "quality"
  | "qualityLabel"
  | "container"
  | "contentLength"
  | "hasAudio"
  | "hasVideo"
  | "mimeType"
> & { type: FormatType };
