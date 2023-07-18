import { type NextApiRequest, type NextApiResponse } from "next";
import { type JobData } from "~/typing";
import { sendMessageToQueue } from "~/utils/sendMessageToQueue";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, format } = req.body as JobData;
  if (typeof url !== "string" || typeof format !== "string") {
    return res.status(400).json({ error: "Required parameters are missing." });
  }

  try {
    await sendMessageToQueue("youtube", {
      url,
      format,
    });
    res.status(200).json("Download job sent.");
  } catch (error) {
    console.error("Error processing job request:", error);
    return res
      .status(400)
      .json({ error: "Error on sending download job to the queue." });
  }
}
