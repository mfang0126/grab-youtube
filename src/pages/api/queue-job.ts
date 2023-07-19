import { type NextApiRequest, type NextApiResponse } from "next";
import { type JobPayload } from "~/typing";
import { sendMessageToQueue } from "~/utils/sendMessageToQueue";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { jobId, format } = req.body as JobPayload;

  if (typeof jobId !== "string" || typeof format !== "string") {
    return res.status(400).json({ error: "Required parameters are missing." });
  }

  try {
    await sendMessageToQueue("youtube", {
      jobId,
      format,
    });

    console.log(`${jobId}-${format} - Download job sent.`);
    res.status(200).json("Download job sent.");
  } catch (error) {
    console.error("Error processing job request:", error);
    return res
      .status(400)
      .json({ error: "Error on sending download job to the queue." });
  }
}
