import ffmpeg from "fluent-ffmpeg";
import { Status } from "~/typing";

interface Progress {
  frames: number;
  currentFps: number;
  currentKbps: string;
  targetSize: number;
  timemark: string;
  percent: number;
}

// TODO: fix the type
interface ProgressData {
  progress: number;
  status: Status;
}
type Notifyer = (data: ProgressData) => void;

export const mergeAudioAndVideo = (
  videoInput: string,
  audioInput: string,
  outputFile: string,
  notifyProgress: Notifyer
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoInput)
      .input(audioInput)
      .output(outputFile)
      .outputOptions(["-map 0:v", "-map 1:a", "-c:v libx264", "-c:a aac"])
      .on("end", resolve)
      .on("error", reject)
      .on("start", (command) => {
        console.log("FFMPEG COMMAND: ", command);
      })
      .on("progress", (progress: Progress) => {
        void notifyProgress({
          progress: progress.percent,
          status: Status.merging,
        });
      })
      .run();
  });
};
