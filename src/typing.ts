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

export interface VideoItem {
  _id: string;
  youtubeVideoId: string;
  videoDetails: MoreVideoDetails;
  formats: Format[];
}

export interface Video extends Omit<VideoItem, "_id"> {
  _id: ObjectId;
}

interface JobBase {
  progress?: number;
  formatItag?: number;
  status?: Status;
  updatedAt?: Date;
}

export interface JobItem extends JobBase {
  _id: string;
  videoTitle: string;
}

export interface ProgressJob extends JobBase {
  _id: ObjectId;
  videoId: ObjectId;
  createAt?: Date;
}

export interface DownloadFile {
  name: string;
  path: string;
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
