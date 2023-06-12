import { NextApiRequest, NextApiResponse } from "next";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import { ServerSentEvent } from "~/utils/ServerSentEvent";

const OUTPUT_PATH = path.join(process.cwd(), "public", "downloads");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, format } = req.query;

  try {
    if (typeof url !== "string") {
      throw new Error("URL is required");
    }

    const video = ytdl(url, {
      quality: format || "highest",
    });

    const client_id = `video_${Date.now()}`;
    const filePath = path.join(OUTPUT_PATH, `${client_id}.mp4`);
    video.pipe(fs.createWriteStream(filePath));

    video.on("progress", (_, downloaded, total) => {
      const progress = (downloaded / total) * 100;
      ServerSentEvent.emit(client_id, { progress, status: "downloading" });
    });

    video.on("end", () => {
      ServerSentEvent.emit(client_id, { progress: 100, status: "completed" });
    });

    res.status(200).json({ client_id, status: "downloading" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
