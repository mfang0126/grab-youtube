import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import {
  closeQueueResponse,
  initQueueResponse,
} from "~/services/youtube-services";
import { Status, type ProgressJob } from "~/typing";

/**
 * id is videoId
 */
interface QueueJobPayload {
  id: string;
  format: string;
}

/**
 * id is videoId
 */
interface UpdateJobPayload {
  id: string;
  status: string;
  progress: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add a new job to the queue
  if (req.method === "POST") {
    initQueueResponse(res);
    const { id, format } = req.body as QueueJobPayload;

    if (!id || (format && !id)) {
      throw new Error("Required parameters are missing.");
    }

    const db = await getDb();
    const result = await db
      .collection<ProgressJob>(Collections.Jobs)
      .insertOne({
        progress: 0,
        status: Status.ready,
        _id: new ObjectId(),
        updatedAt: new Date(),
        createAt: new Date(),
        formatItag: Number(format) ?? undefined,
        videoId: new ObjectId(id),
      });

    if (!result.insertedId) {
      throw new Error(`${id} - Cannot find the job data.`);
    }

    closeQueueResponse();
    res.json({ id, format });
  }

  // Update status to a job in the queue
  // As default, it marks the job as 100% + completed
  if (req.method === "PUT") {
    const { id, status, progress } = req.body as UpdateJobPayload;

    if (!id || !isStatus(status)) {
      throw new Error("Required parameters are missing.");
    }

    const db = await getDb();
    const { value } = await db
      .collection<ProgressJob>(Collections.Jobs)
      .findOneAndUpdate(
        { id: new ObjectId(id) },
        {
          $set: {
            progress: progress ?? 100,
            status: (status as Status) ?? Status.completed,
          },
        }
      );

    if (!value?._id) {
      throw new Error(`${id} - Cannot find the job data.`);
    }

    res.json(value);
  }
}

const isStatus = (input: string): boolean => {
  return Object.values(Status).includes(input as Status);
};
