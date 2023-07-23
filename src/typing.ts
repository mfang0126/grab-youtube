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

export interface Video extends Omit<VideoItem, "_id"> {
  _id: ObjectId;
}

export interface VideoItem {
  _id: string;
  videoId: string;
  videoDetails: MoreVideoDetails;
  formats: Format[];
}

export interface DownloadFile {
  name: string;
  path: string;
}

export interface Job extends Omit<JobItem, "_id"> {
  _id: ObjectId;
}

export interface JobItem {
  _id: string;
  progress?: number;
  formatItag?: number;
  status?: Status;
  updatedAt?: Date;
  videoTitle: string;
}

export interface ProgressJobItem {
  _id: string;
  videoId: ObjectId;
  progress?: number;
  formatItag?: number;
  status?: Status;
  updatedAt?: Date;
  createAt?: Date;
}
export interface ProgressJob extends Omit<ProgressJobItem, "_id"> {
  _id: ObjectId;
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
