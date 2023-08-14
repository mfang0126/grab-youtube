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
    if (!progress && !status) {
      throw new Error("Cannot update progress without progress or status.");
    }

    if (status && !progress) {
      this._progressCache.push({ progress: this._currentProgress, status });
      return;
    }

    if (typeof progress === "number" && status) {
      const roundProgress = Math.round(progress);

      if (roundProgress > this._currentProgress) {
        this._currentProgress = roundProgress;
        this._progressCache.push({
          progress: this._currentProgress,
          status,
        });
      }
    }

    if (this._progressCache.length >= 10) {
      await this.saveProgressBatch();
      console.log(`Progress: ${this._currentProgress} | Status: ${status}`);
      return;
    }
  }

  async resetProgress(status?: Status): Promise<void> {
    this._currentProgress = 0;
    this._progressCache = [];

    const db = await getDb();
    const { value } = await db
      .collection<ProgressJob>(Collections.Jobs)
      .findOneAndUpdate(
        { _id: this._id },
        { $set: { progress: 0, status } },
        { returnDocument: "after" }
      );

    if (value?._id) {
      console.log(JSON.stringify(value));
    }
  }

  async completedProgress(): Promise<void> {
    this._currentProgress = 100;
    this._progressCache = [];

    const db = await getDb();
    const { value } = await db
      .collection<ProgressJob>(Collections.Jobs)
      .findOneAndUpdate(
        { _id: this._id },
        { $set: { progress: 100, status: Status.completed } },
        { returnDocument: "after" }
      );

    if (value?._id) {
      console.log(JSON.stringify(value));
    }
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
            update: {
              $set: {
                progress: p.progress,
                status: p.status,
                updatedAt: new Date(),
              },
            },
          },
        };
      })
    );
  }
}
