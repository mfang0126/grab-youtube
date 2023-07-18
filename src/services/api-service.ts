import axios from "axios";
import type { JobData, YoutubeDetials } from "~/typing";

interface FilePath {
  name: string;
  path: string;
}

export const getFilePaths = () =>
  axios.get<FilePath[]>("/api/files-path").then((res) => res.data);

export const getJobInfo = (url: string, videoId?: string) =>
  axios
    .post<YoutubeDetials>("/api/jobs", { url, videoId })
    .then((res) => res.data);

export const sendJobToQueue = (data: JobData) =>
  axios.post<FilePath[]>("/api/queue-job", data).then((res) => res.data);
