import fs from "fs/promises";
import path from "path";
import { OUTPUT_PATH } from "~/config";

/**
 * List all file paths in a directory.
 * @param directoryPath - The path of the directory you want to read.
 * @returns A promise that resolves with an array of file paths.
 */
export async function listMediaFilePaths(
  directoryPath: string,
  swapPath?: string
): Promise<string[]> {
  try {
    const fileNames = await fs.readdir(directoryPath);
    const filePaths = fileNames
      .map((fileName) =>
        path.join(swapPath ? swapPath : directoryPath, fileName)
      )
      .filter((path) => path.includes(".mp4"));
    return filePaths;
  } catch (error) {
    console.error("An error occurred while reading the directory:", error);
    return [];
  }
}

export async function listFileNameInDir(
  directoryPath: string
): Promise<string[]> {
  try {
    const files = await fs.readdir(directoryPath);

    const fileStatsPromises = files.map(async (file) => {
      const stats = await fs.stat(path.join(directoryPath, file));
      return { file, ...stats };
    });

    const fileStats = await Promise.all(fileStatsPromises);

    fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    const latestThreeFiles = fileStats
      .filter((stats) => stats.file.includes(".mp4"))
      .slice(0, 3)
      .map((stats) => stats.file);

    return latestThreeFiles;
  } catch (error) {
    console.error("An error occurred while reading the directory:", error);
    return [];
  }
}

export const createOutputDirectory = async () => {
  try {
    await fs.access(OUTPUT_PATH);
  } catch {
    await fs.mkdir(OUTPUT_PATH, { recursive: true });
  }
};
