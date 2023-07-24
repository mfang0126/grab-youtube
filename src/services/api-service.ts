import axios from "axios";
import type { DownloadFile, JobItem, Status, VideoItem } from "~/typing";

export const getFilePaths = () =>
  axios
    .get<DownloadFile[]>("/api/files-path")
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [];
    });

export const getVideo = (url: string, videoId?: string) =>
  axios
    .post<VideoItem>("/api/video", { url, videoId })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return null;
    });

export const sendJobToQueue = (id: string, format: string) =>
  axios
    .post<DownloadFile[]>("/api/jobs/queue", { id, format })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [];
    });

export const getAllQueueJobs = (status?: Status) =>
  axios
    .get<JobItem[]>("/api/jobs/queue", { params: { status } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [] as JobItem[];
    });
