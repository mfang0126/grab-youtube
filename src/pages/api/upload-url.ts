import { type NextApiRequest, type NextApiResponse } from "next";
import { MAIN_BUCKET } from "~/config";
import { getUploadUrl } from "~/services/aws-service";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    bucketId = MAIN_BUCKET,
    name,
    contentType,
  } = req.body as { bucketId: string; name: string; contentType: string };
  const url = getUploadUrl(bucketId, name, contentType);
  console.log("Get file upload URL: ", url);
  if (!url) {
    throw { code: 500 };
  }
  res.json({ url });
}
