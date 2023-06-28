import fs from "fs";
import { type NextApiRequest, type NextApiResponse } from "next";
import path from "path";
import { type Readable } from "stream";
import ytdl from "ytdl-core";
import { OUTPUT_PATH } from "~/config";
import { Status } from "~/typing";
import { mergeAudioAndVideo } from "~/utils/mergeAudioVideo";
import { removeFilesWithExtensions } from "~/utils/removeFilesWithExtensions";
import { isValidUrl, sanitizeFileName } from "~/utils/stringHelper";
import { AudioFormatMap } from "~/youtubeFormats";

const MAX_TIMEOUT = 600000; // 5 minutes

interface ProgressData {
  progress: number;
  status: Status;
}

const createOutputDirectory = () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
};

export type Notifyer = (data: ProgressData, callback?: () => void) => void;

const downloadFile = (
  video: Readable,
  fileName: string,
  notifyProgress: Notifyer
) =>
  new Promise<string>((resolve, reject) => {
    const filePath = path.join(OUTPUT_PATH, fileName);

    const writeStream = fs.createWriteStream(filePath);
    video.pipe(writeStream);
    writeStream.on("error", (error) =>
      reject(new Error(`File writing error: ${error.message}`))
    );

    video.on("progress", (_, downloaded, total) =>
      notifyProgress({
        progress: (downloaded / total) * 100,
        status: Status.downloading,
      })
    );
    video.on("end", () => resolve(filePath));
    video.on("error", (error) =>
      reject(new Error(`Video processing error: ${error.message}`))
    );
  });

const downloadAsOneFile = async (
  url: string,
  notifyProgress: Notifyer,
  formatItag?: number
) => {
  const { videoDetails, formats } = await ytdl.getInfo(url);
  const { title } = videoDetails;

  const compromiseMatched = formats.find(
    (format) => format.hasAudio && format.hasVideo
  );
  const formatMatched =
    formats.find((format) => format.itag === formatItag) ?? compromiseMatched;

  if (!formatMatched) {
    throw new Error("No matched format");
  }
  console.log("MATCHED VIDEO FORMAT: ", formatMatched);

  const { audioName, videoName, outputName } = sanitizeFileName(
    title,
    formatMatched.qualityLabel
  );

  const { hasAudio: matchedHasAudio, container: matchedContainer } =
    formatMatched;
  createOutputDirectory();
  notifyProgress({ progress: 0, status: Status.pending });

  if (!matchedHasAudio) {
    const matchedAudioFormat = formats.find(
      (format) =>
        Object.keys(AudioFormatMap).indexOf(`${format.itag}`) !== -1 &&
        format.container === matchedContainer
    );

    if (!matchedAudioFormat) {
      throw new Error("No available audio format.");
    }
    console.log("MATCHED AUDIO FORMAT: ", matchedAudioFormat);

    const { itag: matchedAudioFormatItag } = matchedAudioFormat;
    const audioStream = ytdl(url, { quality: matchedAudioFormatItag });
    const videoStream = ytdl(url, { quality: formatItag });

    const downloadAudio = downloadFile(audioStream, audioName, notifyProgress);
    const downloadVideo = downloadFile(videoStream, videoName, notifyProgress);

    return Promise.all([downloadAudio, downloadVideo])
      .then(async ([audioFilePath, videoFilePath]) => {
        const outputPath = path.join(OUTPUT_PATH, outputName);
        const writeStream = fs.createWriteStream(outputPath);

        writeStream.on("error", (error) => {
          throw new Error(`File writing error: ${error.message}`);
        });

        await mergeAudioAndVideo(
          videoFilePath,
          audioFilePath,
          outputPath,
          notifyProgress
        );
        await removeFilesWithExtensions();
        return notifyProgress({ progress: 100, status: Status.completed });
      })
      .catch((e) => {
        console.log(e);
        throw new Error((e as Error).message);
      });
  }

  const video = ytdl(url, { quality: formatItag });
  const filePath = path.join(OUTPUT_PATH, outputName);

  const writeStream = fs.createWriteStream(filePath);
  video.pipe(writeStream);
  writeStream.on("error", (error) => {
    throw new Error(`File writing error: ${error.message}`);
  });

  return new Promise<void>((resolve, reject) => {
    video.on("progress", (_, downloaded, total) =>
      notifyProgress({
        progress: (downloaded / total) * 100,
        status: Status.downloading,
      })
    );
    video.on("end", () =>
      notifyProgress(
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
  const notifyProgress: Notifyer = (data, callback) =>
    res.write(
      `data: ${JSON.stringify(data)}\n\n`,
      () => callback && callback()
    );

  try {
    if (typeof url !== "string" || (format && typeof format !== "string")) {
      throw new Error("Required parameters are missing.");
    }

    if (!isValidUrl(url)) {
      throw new Error("Invalid URL");
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.setTimeout(MAX_TIMEOUT, () => {
      notifyProgress(
        {
          progress: 0,
          status: Status.error,
        },
        () => res.end()
      );
    });

    console.log("Youtube url: ", url);
    console.log("Format tag: ", format);
    await downloadAsOneFile(url, notifyProgress, Number(format));
  } catch (error) {
    console.log(error);
    res.status(500).write(
      `data: ${JSON.stringify({
        progress: 0,
        status: Status.error,
        msg: (error as Error).message,
      })}\n\n`
    );
    res.end();
  }
}
