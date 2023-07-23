import axios from "axios";
import type { DownloadFile, JobItem, VideoItem } from "~/typing";

export const getFilePaths = () =>
  axios.get<DownloadFile[]>("/api/files-path").then((res) => res.data);

export const getVideos = (url: string, videoId?: string) =>
  axios.post<VideoItem>("/api/jobs", { url, videoId }).then((res) => res.data);

// TODO: fix the type
export const sendJobToQueue = (id: string, format: string) =>
  axios
    .post<DownloadFile[]>("/api/jobs/queue", { id, format })
    .then((res) => res.data);

export const getJobsFromQueue = () =>
  axios.get<JobItem[]>("/api/jobs/queue").then((res) => {
    console.log(res.data);
    return res.data;
  });
