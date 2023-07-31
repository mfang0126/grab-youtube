import fs from "fs";
import path from "path";
import { OUTPUT_PATH } from "~/config";

export const removeFilesWithExtensions = async () => {
  try {
    const files = await fs.promises.readdir(OUTPUT_PATH);

    for (const file of files) {
      const isTempFile =
        file.includes(".audio.mp4") || file.includes(".video.mp4");
      const filePath = path.join(OUTPUT_PATH, file);

      if (isTempFile) {
        await fs.promises.unlink(filePath);
        console.log(`REMOVED TEMP FILE: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error occurred while removing files:", error);
  }
};
