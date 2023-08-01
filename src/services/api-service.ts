import axios from "axios";
import type { DownloadFile, JobItem, Status, VideoItem } from "~/typing";

export const getFiles = (url: string) =>
  axios.get<DownloadFile[]>(url).then((res) => res.data);

export const getVideo = (url: string) =>
  axios
    .get<VideoItem>("/api/video", { params: { url } })
    .then((res) => res.data);

export const addNewJob = (id: string, format: string) =>
  axios
    .post<DownloadFile[]>("/api/jobs/queue", { id, format })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [];
    });

export const getJobsByStatus = (status?: Status[]) =>
  axios
    .get<JobItem[]>("/api/jobs/queue", { params: { status } })
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [] as JobItem[];
    });

export const getCronTriggered = () =>
  axios
    .get<JobItem[]>("/api/cron")
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return [] as JobItem[];
    });

export const startDownloadJob = (id: string) =>
  axios
    .post<DownloadFile[]>(`/api/jobs/${id}/start`)
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return;
    });
