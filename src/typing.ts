import type { ObjectId } from "mongodb";
import { MoreVideoDetails, type videoFormat } from "ytdl-core";

export enum FormatType {
  audioOnly = "audioOnly",
  videoOnly = "videoOnly",
  videoWithAudio = "videoWithAudio",
}

export interface ErrorResponse {
  msg: string;
}

export interface JobData {
  url: string;
  format: string;
}

export enum Status {
  downloading = "downloading",
  merging = "merging",
  completed = "completed",
  pending = "pending",
  ready = "ready",
  error = "error",
}

export interface YoutubeDetials {
  _id: ObjectId;
  videoId: string;
  videoDetails: MoreVideoDetails;
  formats: Format[];
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
> & { type: FormatType };
