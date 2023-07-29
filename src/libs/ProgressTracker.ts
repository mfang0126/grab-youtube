import { type ObjectId } from "mongodb";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { Status, type ProgressJob } from "~/typing";

export interface ProgressTrackerData {
  progress?: number;
  status: Status;
}

export default class ProgressTracker {
  private _progressCache: ProgressTrackerData[];
  private _currentProgress: number;
  private _id: ObjectId;

  constructor(id: ObjectId) {
    this._currentProgress = 0;
    this._progressCache = [];
    this._id = id;
  }

  /**
   * Update progress for a given ID.
   * @param {number} progress - The progress value.
   * @returns {Promise<void>}
   */
  async updateProgress({
    progress,
    status,
  }: Omit<ProgressTrackerData, "id">): Promise<void> {
    if (status && typeof progress !== "number") {
      this._progressCache.push({ progress, status });
      return;
    }

    if (typeof progress === "number" && status) {
      if (progress > this._currentProgress) {
        const roundProgress = Math.round(progress);
        this._currentProgress = roundProgress;
      }

      this._progressCache.push({
        progress,
        status: progress === 100 ? Status.completed : status,
      });

      if (this._progressCache.length >= 10 || progress === 100) {
        await this.saveProgressBatch();
        return;
      }
    }

    throw new Error("Cannot track progress without progress or status.");
  }

  /**
   * Save progress batch to MongoDB.
   * @returns {Promise<void>}
   */
  async saveProgressBatch(): Promise<void> {
    const progressToSave: ProgressTrackerData[] = this._progressCache;
    this._progressCache = [];

    const db = await getDb();
    await db.collection<ProgressJob>(Collections.Jobs).bulkWrite(
      progressToSave.map((p) => {
        return {
          updateOne: {
            filter: { _id: this._id },
            update: { $set: { progress: p.progress, status: p.status } },
          },
        };
      })
    );
  }
}
