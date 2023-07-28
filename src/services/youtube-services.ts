import fs from "fs";
import path from "path";
import type { Readable } from "stream";
import ytdl, { type videoFormat } from "ytdl-core";
import { OUTPUT_PATH } from "~/config";
import ProgressTracker from "~/libs/ProgressTracker";
import {
  FormatType,
  Status,
  type Format,
  type ProgressJob,
  type Video,
} from "~/typing";
import { mergeAudioAndVideo } from "~/utils/mergeAudioVideo";
import { removeFilesWithExtensions } from "~/utils/removeFilesWithExtensions";
import { sanitizeFileName } from "~/utils/stringHelper";
import { AudioFormatMap } from "~/youtubeFormats";

interface ProgressData {
  progress: number;
  status: Status;
}
type Notifyer = (data: ProgressData) => Promise<void>;

const tracker = new ProgressTracker();
let processingVideo: Video;
let processingJob: ProgressJob;

const downloadFile = (stream: Readable, fileName: string) =>
  new Promise<string>((resolve, reject) => {
    const filePath = path.join(OUTPUT_PATH, fileName);

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);
    writeStream.on("error", (error) => {
      console.error(error);
      void notifyProgress({ progress: 0, status: Status.error }).then(() =>
        reject(new Error(`File writing error: ${error.message}`))
      );
    });

    stream.on("progress", (_, downloaded, total) => {
      void notifyProgress({
        progress: (downloaded / total) * 100,
        status: Status.downloading,
      });
    });

    stream.on("end", () => {
      void notifyProgress({
        progress: 100,
        status: Status.completed,
      }).then(() => resolve(filePath));
    });
  });

export const generateVideo = async (
  selectedVideo: Video,
  selectedJob: ProgressJob
) => {
  processingVideo = selectedVideo;
  processingJob = selectedJob;

  const formatItag = selectedJob.formatItag;
  const { videoDetails, formats } = selectedVideo;
  const { title } = videoDetails;

  console.log(`Job started for video ID: ${processingVideo._id.toString()}`);
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

  const { itag, qualityLabel } = formatMatched;
  console.log(`MATCHED VIDEO FORMAT: ${itag} - ${qualityLabel}`);

  const { audioName, videoName, outputName } = sanitizeFileName(
    title,
    formatMatched.qualityLabel
  );
  const videoUrl = selectedVideo.videoDetails.video_url;
  const { hasAudio: matchedHasAudio, container: matchedContainer } =
    formatMatched;
  createOutputDirectory();

  await notifyProgress({ progress: 0, status: Status.pending });

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
    console.log("MATCHED AUDIO FORMAT: ", matchedAudioFormat.mimeType);

    try {
      const { itag: matchedAudioFormatItag } = matchedAudioFormat;
      const audioStream = ytdl(videoUrl, {
        quality: matchedAudioFormatItag,
      }).on("error", (error) => {
        throw new Error(`Audio stream error: ${error.message}`);
      });
      const videoStream = ytdl(videoUrl, { quality: formatItag }).on(
        "error",
        (error) => {
          throw new Error(`Video stream error: ${error.message}`);
        }
      );

      // Memory might be funny from here.
      const audioFilePath = await downloadFile(audioStream, audioName);
      const videoFilePath = await downloadFile(videoStream, videoName);

      const outputPath = path.join(OUTPUT_PATH, outputName);
      const writeStream = fs.createWriteStream(outputPath);

      writeStream.on("error", (error) => {
        throw new Error(`File writing error: ${error.message}`);
      });

      await mergeAudioAndVideo(
        videoFilePath,
        audioFilePath,
        outputPath,
        (data) => void notifyProgress(data)
      );
    } catch (error) {
      throw new Error(
        `Error on merging audio and video: ${(error as Error).message}`
      );
    }

    await removeFilesWithExtensions();
    return console.log("Downloaded one file with merging");
  }

  // Process video selected format has audio.
  const video = ytdl(videoUrl, { quality: formatItag });
  const filePath = await downloadFile(video, outputName);
  if (filePath) {
    return console.log("Downloaded one file without merging");
  }
  return console.log("Downloaded one file without merging");
};

// The job is under /api/cron
const notifyProgress: Notifyer = async ({ progress, status }) => {
  const roundProgress = Math.round(progress);

  await tracker.updateProgress(processingJob._id, {
    progress: roundProgress,
    status,
  });
  console.log({ progress: roundProgress, status });
};

const createOutputDirectory = () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH, { recursive: true });
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

export const requestInfoFromYoutube = async (url: string) => {
  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  try {
    const { videoDetails, formats } = await ytdl.getInfo(url);
    const { videoId } = videoDetails;

    const filteredFormats = filterFormats(formats);
    return {
      youtubeVideoId: videoId,
      videoDetails,
      formats: filteredFormats,
    };
  } catch (error) {
    console.error(`Error on requesting video info from YouTube: `, error);
  }
};
