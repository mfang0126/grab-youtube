import axios from "axios";
import { type InfoResponse } from "~/pages/api/integration/youtube";
import { type JobData } from "~/typing";

interface FilePath {
  name: string;
  path: string;
}

export const getFilePaths = () =>
  axios.get<FilePath[]>("/api/files-path").then((res) => res.data);

export const getInfoFromYoutube = (url: string) =>
  axios
    .get<InfoResponse>("/api/integration/youtube", { params: { url } })
    .then((res) => res.data);

export const sendJobToQueue = (data: JobData) =>
  axios.post<FilePath[]>("/api/queue-job", data).then((res) => res.data);
