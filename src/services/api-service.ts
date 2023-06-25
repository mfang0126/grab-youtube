import axios from "axios";
import { type InfoResponse } from "~/pages/api/info";

interface FilePath {
  name: string;
  path: string;
}

export const getFilePaths = () =>
  axios.get<FilePath[]>("/api/files-path").then((res) => res.data);

export const getInfo = (url: string) =>
  axios
    .get<InfoResponse>("/api/info", { params: { url } })
    .then((res) => res.data);
