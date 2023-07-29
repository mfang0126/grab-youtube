import fs from "fs";
import path from "path";
import type { Readable } from "stream";
import ytdl, { filterFormats } from "ytdl-core";
import { OUTPUT_PATH } from "~/config";
import ProgressTracker from "~/libs/ProgressTracker";
import { Status, type ProgressJob, type Video } from "~/typing";
import { createOutputDirectory } from "~/utils/dirHelper";
import { mergeAudioAndVideo } from "~/utils/mergeAudioVideo";
import { removeFilesWithExtensions } from "~/utils/removeFilesWithExtensions";
import { sanitizeFileName } from "~/utils/stringHelper";
import { AudioFormatMap } from "~/youtubeFormats";

let tracker: ProgressTracker;

const downloadFile = (stream: Readable, fileName: string) =>
  new Promise<string>((resolve, reject) => {
    const filePath = path.join(OUTPUT_PATH, fileName);

    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);
    writeStream.on("error", (error) => {
      console.error(error);
      void tracker
        .updateProgress({ status: Status.error })
        .then(() => reject(new Error(`File writing error: ${error.message}`)));
    });

    stream.on("progress", (_, downloaded, total) => {
      void tracker.updateProgress({
        progress: (downloaded / total) * 100,
        status: Status.downloading,
      });
    });

    stream.on("end", () => {
      void tracker
        .updateProgress({
          progress: 100,
          status: Status.completed,
        })
        .then(() => resolve(filePath));
    });
  });

export const generateVideo = async (
  selectedVideo: Video,
  selectedJob: ProgressJob
) => {
  tracker = new ProgressTracker(selectedJob._id);

  const formatItag = selectedJob.formatItag;
  const { videoDetails, formats } = selectedVideo;
  const { title } = videoDetails;

  console.log(`Job started for video ID: ${selectedVideo._id.toString()}`);
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
  await createOutputDirectory();

  await tracker.updateProgress({ progress: 0, status: Status.pending });

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
        (data) => void tracker.updateProgress(data)
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
