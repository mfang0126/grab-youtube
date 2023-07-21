import fs from "fs";
import type { NextApiResponse } from "next";
import path from "path";
import type { Readable } from "stream";
import ytdl, { type videoFormat } from "ytdl-core";
import { OUTPUT_PATH } from "~/config";
import { FormatType, Status, type Format, type YoutubeDetails } from "~/typing";
import { mergeAudioAndVideo } from "~/utils/mergeAudioVideo";
import { removeFilesWithExtensions } from "~/utils/removeFilesWithExtensions";
import { sanitizeFileName } from "~/utils/stringHelper";
import { AudioFormatMap } from "~/youtubeFormats";

interface ProgressData {
  progress: number;
  status: Status;
}

type Notifyer = (data: ProgressData) => Promise<void>;

let queueResponse: NextApiResponse | undefined;

export const initQueueResponse = (res: NextApiResponse) => {
  queueResponse = res;
};

export const getQueueResponse = () => {
  if (!queueResponse) {
    throw Error("Queue response need to be initialized first.");
  }
  return queueResponse;
};

export const closeQueueResponse = () => {
  queueResponse = undefined;
};

export const notifyProgress: Notifyer = (data) => {
  const queueResponse = getQueueResponse();
  return new Promise<void>((resolve) => {
    queueResponse.write(`data: ${JSON.stringify(data)}\n\n`, () => resolve());
  });
};

const createOutputDirectory = () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  }
};

const downloadFile = (stream: Readable, fileName: string) =>
  new Promise<string>((resolve, reject) => {
    const filePath = path.join(OUTPUT_PATH, fileName);

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);
    writeStream.on("error", (error) =>
      reject(new Error(`File writing error: ${error.message}`))
    );

    stream.on(
      "progress",
      (_, downloaded, total) =>
        void notifyProgress({
          progress: (downloaded / total) * 100,
          status: Status.downloading,
        })
    );
    stream.on("end", () => resolve(filePath));
    stream.on("error", (error) =>
      reject(new Error(`Video processing error: ${error.message}`))
    );
  });

export const generateVideo = async (
  selectedFormat: YoutubeDetails,
  formatItag?: number
) => {
  const { videoDetails, formats } = selectedFormat;
  const { title } = videoDetails;

  // format has audio and video. Only use it if we don't have matched format.
  const compromiseMatched = formats.find(
    (format) => format.hasAudio && format.hasVideo
  );

  // matched format has audio and video
  const formatMatched =
    formats.find((format) => format.itag === formatItag) ?? compromiseMatched;

  if (!formatMatched) {
    throw new Error("No valid format video to download.");
  }
  console.log("MATCHED VIDEO FORMAT: ", formatMatched);

  const { audioName, videoName, outputName } = sanitizeFileName(
    title,
    formatMatched.qualityLabel
  );
  const videoUrl = selectedFormat.videoDetails.video_url;
  const { hasAudio: matchedHasAudio, container: matchedContainer } =
    formatMatched;
  createOutputDirectory();
  void notifyProgress({ progress: 0, status: Status.pending });

  // Process video selected format has no audio.
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

    const audioStream = ytdl(videoUrl, { quality: matchedAudioFormatItag });
    const videoStream = ytdl(videoUrl, { quality: formatItag });

    // Memory might be funny from here.
    const downloadAudio = downloadFile(audioStream, audioName);
    const downloadVideo = downloadFile(videoStream, videoName);

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
          (data) => {
            void notifyProgress(data);
          }
        );
        await removeFilesWithExtensions();
        return notifyProgress({ progress: 100, status: Status.completed });
      })
      .catch((e) => {
        console.log(e);
        throw new Error((e as Error).message);
      });
  }

  // Process video selected format has audio.
  const video = ytdl(videoUrl, { quality: formatItag });
  const filePath = path.join(OUTPUT_PATH, outputName);

  const writeStream = fs.createWriteStream(filePath);
  video.pipe(writeStream);
  writeStream.on("error", (error) => {
    throw new Error(`File writing error: ${error.message}`);
  });

  return new Promise<void>((resolve, reject) => {
    video
      .on(
        "progress",
        (_, downloaded, total) =>
          void notifyProgress({
            progress: (downloaded / total) * 100,
            status: Status.downloading,
          })
      )
      .on(
        "end",
        () =>
          void notifyProgress({
            progress: 100,
            status: Status.completed,
          }).then(() => resolve())
      )
      .on("error", (error) =>
        reject(new Error(`Video processing error: ${error.message}`))
      );
  });
};

export const requestInfoFromYoutube = async (url: string) => {
  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  try {
    const { videoDetails, formats } = await ytdl.getInfo(url);
    const { videoId } = videoDetails;

    const filteredFormats = filterFormats(formats);
    return {
      videoId,
      videoDetails,
      formats: filteredFormats,
    };
  } catch (error) {
    console.error(`Error on requesting video info from YouTube: `, error);
  }
};

function getFormatType(format: videoFormat) {
  if (!format.hasVideo && format.hasAudio) {
    return FormatType.audioOnly;
  }

  if (format.hasVideo && !format.hasAudio) {
    return FormatType.videoOnly;
  }

  if (format.hasVideo && format.hasAudio) {
    return FormatType.videoWithAudio;
  }
}

function filterFormats(formats: videoFormat[]) {
  return formats
    .reduce((acc, format) => {
      if (format.container !== "mp4") return acc;

      const type = getFormatType(format);
      if (!type) return acc;

      const updatedFormat = { ...format, type };
      acc.push(updatedFormat);
      return acc;
    }, [] as Format[])
    .sort((a, b) => a.itag - b.itag);
}
