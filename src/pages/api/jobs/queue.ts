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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    initQueueResponse(res);
    const { id, format } = req.body as QueueJobPayload;

    if (!id || (format && id)) {
      throw new Error("Required parameters are missing.");
    }

    const db = await getDb();
    const { value } = await db
      .collection<ProgressJob>(Collections.Jobs)
      .findOneAndUpdate(
        { id: new ObjectId(id) },
        { $set: { progress: 0, status: Status.ready } }
      );

    if (!value?._id) {
      throw new Error(`${id} - Cannot find the job data.`);
    }

    closeQueueResponse();
    res.json(value);
  }

  if (req.method === "PUT") {
    const { id, status } = req.body as UpdateJobPayload;

    if (!id || !isStatus(status)) {
      throw new Error("Required parameters are missing.");
    }

    const db = await getDb();
    const { value } = await db
      .collection<ProgressJob>(Collections.Jobs)
      .findOneAndUpdate(
        { id: new ObjectId(id) },
        { $set: { progress: 100, status: status as Status } }
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
