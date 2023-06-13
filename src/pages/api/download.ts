import { type NextApiRequest, type NextApiResponse } from "next";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import { ServerSentEvent } from "~/utils/ServerSentEvent";

const OUTPUT_PATH = path.join(process.cwd(), "public", "downloads");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, format } = req.query;

  try {
    if (typeof url !== "string") {
      throw new Error("URL is required");
    }

    const video = ytdl(url, {
      quality: format || "highest",
    });

    const client_id = `video_${Date.now()}`;
    video.pipe(
      fs.createWriteStream(path.join(OUTPUT_PATH, `${client_id}.mp4`))
    );

    let progress = 0;
    let status = "pending";

    video.on("progress", (_, downloaded, total) => {
      progress = (downloaded / total) * 100;
      status = "downloading";
      ServerSentEvent.emit(client_id, { progress, status });
    });

    const filePath = path.join("downloads", `${client_id}.mp4`);
    video.on("end", () => {
      progress = 100;
      status = "completed";
      ServerSentEvent.emit(client_id, {
        progress,
        status,
        filePath,
      });
    });

    res.status(200).json({ client_id, progress, status });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
