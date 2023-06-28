import { type videoFormat } from "ytdl-core";

export enum Status {
  downloading = "downloading",
  merging = "merging",
  completed = "completed",
  pending = "pending",
  ready = "ready",
  error = "error",
}

export type Format = Pick<
  videoFormat,
  | "itag"
  | "quality"
  | "qualityLabel"
  | "container"
  | "contentLength"
  | "hasAudio"
  | "hasVideo"
  | "mimeType"
>;
