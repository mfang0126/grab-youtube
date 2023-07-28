import { type ObjectId } from "mongodb";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { Status, type ProgressJob } from "~/typing";

interface Progress {
  id: ObjectId;
  progress: number;
  status: Status;
}

export default class ProgressTracker {
  private progressCache: Progress[];
  private currentProgress: number;

  constructor() {
    this.currentProgress = 0;
    this.progressCache = [];
  }

  /**
   * Update progress for a given ID.
   * @param {string} id - The ID of the progress.
   * @param {number} progress - The progress value.
   * @returns {Promise<void>}
   */
  async updateProgress(
    id: ObjectId,
    { progress, status }: Omit<Progress, "id">
  ): Promise<void> {
    if (progress > this.currentProgress) {
      this.currentProgress = progress;
    }

    this.progressCache.push({
      id,
      progress,
      status: progress === 100 ? Status.completed : status,
    });

    if (this.progressCache.length >= 10 || progress === 100) {
      await this.saveProgressBatch();
    }
  }

  /**
   * Save progress batch to MongoDB.
   * @returns {Promise<void>}
   */
  async saveProgressBatch(): Promise<void> {
    const progressToSave: Progress[] = this.progressCache;
    this.progressCache = [];

    const db = await getDb();
    await db.collection<ProgressJob>(Collections.Jobs).bulkWrite(
      progressToSave.map((p) => {
        return {
          updateOne: {
            filter: { _id: p.id },
            update: { $set: { progress: p.progress, status: p.status } },
          },
        };
      })
    );
  }
}
