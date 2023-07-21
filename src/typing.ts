import type { ObjectId } from "mongodb";
import type { MoreVideoDetails, videoFormat } from "ytdl-core";

export enum FormatType {
  audioOnly = "audioOnly",
  videoOnly = "videoOnly",
  videoWithAudio = "videoWithAudio",
}

export interface ErrorResponse {
  msg: string;
}

export enum Status {
  downloading = "downloading",
  merging = "merging",
  completed = "completed",
  pending = "pending",
  ready = "ready",
  error = "error",
}

export interface YoutubeDetails {
  _id: ObjectId;
  videoId: string;
  videoDetails: MoreVideoDetails;
  formats: Format[];
}

export interface ProgressJob {
  _id: ObjectId;
  progress?: number;
  formatItag?: number;
  status?: Status;
  updatedAt?: Date;
  createAt?: Date;
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
