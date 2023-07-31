import { type NextApiRequest, type NextApiResponse } from "next";
import { listFileNameInDir } from "~/utils/dirHelper";
import { DOWNLOAD_PATH } from "~/config";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const names = await listFileNameInDir(DOWNLOAD_PATH);

  const files = names.map((name) => ({
    name,
    path: path.join("downloads", name),
  }));
  res.json(files);
}
