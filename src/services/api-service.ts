import axios from "axios";

export const getFilePaths = () =>
  axios
    .get<{ name: string; path: string }[]>("/api/file-paths")
    .then((res) => res.data);
