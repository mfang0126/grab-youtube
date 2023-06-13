import { type NextApiRequest, type NextApiResponse } from "next";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";

const OUTPUT_PATH = path.join(process.cwd(), "public", "downloads");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, format } = req.query;

  try {
    if (typeof url !== "string") {
      throw new Error("URL is required");
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

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

      res.write(
        `data: ${JSON.stringify({
          progress,
          status,
        })}\n\n`
      );
    });

    video.on("end", () => {
      const filePath = path.join("downloads", `${client_id}.mp4`);
      progress = 100;
      status = "completed";

      res.write(
        `data: ${JSON.stringify({
          progress,
          status,
          filePath,
        })}\n\n`
      );
    });

    res.status(200).send(JSON.stringify({ progress, status }));
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
