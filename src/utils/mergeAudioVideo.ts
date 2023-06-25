import ffmpeg from "fluent-ffmpeg";

interface Progress {
  frames: number;
  currentFps: number;
  currentKbps: string;
  targetSize: number;
  timemark: string;
  percent: number;
}

export const mergeAudioAndVideo = (
  videoInput: string,
  audioInput: string,
  outputFile: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoInput)
      .input(audioInput)
      .outputOptions("-c:v copy") // copie the original video stream
      .outputOptions("-c:a aac") // transcode the audio stream to aac
      .outputOptions("-map 0:v") // tell ffmpeg to use the video from the first input
      .outputOptions("-map 1:a") // tell ffmpeg to use the audio from the second input
      .output(outputFile)
      .on("end", resolve)
      .on("error", reject)
      .on("progress", (progress: Progress) => {
        console.log(`Processing: ${progress.percent}% done`);
      })
      .run();
  });
};

// mergeAudioAndVideo("input.mp4", "input.mp3", "output.mp4")
//   .then(() => console.log("Finished processing"))
//   .catch((err: Error) => console.log("An error occurred: " + err.message));
