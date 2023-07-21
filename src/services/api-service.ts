import axios from "axios";
import type { YoutubeDetails } from "~/typing";

interface FilePath {
  name: string;
  path: string;
}

export const getFilePaths = () =>
  axios.get<FilePath[]>("/api/files-path").then((res) => res.data);

export const getJobInfo = (url: string, videoId?: string) =>
  axios
    .post<YoutubeDetails>("/api/jobs", { url, videoId })
    .then((res) => res.data);

export const sendJobToQueue = (id: string, format: string) =>
  axios
    .post<FilePath[]>("/api/jobs/queue", { id, format })
    .then((res) => res.data);
