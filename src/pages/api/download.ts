import fs from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";
import path from "path";
import ytdl from "ytdl-core";
import { OUTPUT_PATH } from "~/config";
import { Status } from "~/typing";
import { isValidUrl, sanitizeFileName } from "~/utils/stringHelper";

const MAX_TIMEOUT = 300000; // 5 minutes

interface ProgressData {
  progress: number;
  status: Status;
}

const createOutputDirectory = () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
};

type SendData = (data: ProgressData, callback?: () => void) => void;

const downloadAsOneFile = async (
  url: string,
  sentData: SendData,
  format?: string
) => {
  const videoInfo = await ytdl.getInfo(url);
  const { title } = videoInfo.videoDetails;

  const fileName = sanitizeFileName(title);
  const filePath = path.join(OUTPUT_PATH, fileName);

  if (!isValidUrl(url)) {
    throw new Error("Invalid URL");
  }

  createOutputDirectory();
  sentData({ progress: 0, status: Status.pending });

  const video = ytdl(url, {
    quality: format || "highest",
    filter: "videoandaudio",
  });
  const writeStream = fs.createWriteStream(filePath);

  video.pipe(writeStream);

  return new Promise<void>((resolve, reject) => {
    writeStream.on("error", (error) =>
      reject(new Error(`File writing error: ${error.message}`))
    );
    video.on("progress", (_, downloaded, total) =>
      sentData({
        progress: (downloaded / total) * 100,
        status: Status.downloading,
      })
    );
    video.on("end", () =>
      sentData(
        {
          progress: 100,
          status: Status.completed,
        },
        () => resolve()
      )
    );
    video.on("error", (error) =>
      reject(new Error(`Video processing error: ${error.message}`))
    );
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, format } = req.query;
  const sentData: SendData = (data, callback) =>
    res.write(
      `data: ${JSON.stringify(data)}\n\n`,
      () => callback && callback()
    );

  try {
    if (typeof url !== "string" || (format && typeof format !== "string")) {
      throw new Error("Required parameters are missing.");
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.setTimeout(MAX_TIMEOUT, () => {
      sentData(
        {
          progress: 0,
          status: Status.error,
        },
        () => res.end()
      );
    });

    await downloadAsOneFile(url, sentData, format);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
