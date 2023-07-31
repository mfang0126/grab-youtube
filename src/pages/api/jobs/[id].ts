import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { type Status, type JobItem } from "~/typing";
import { isStatus } from "~/utils/stringHelper";

interface Job extends Omit<JobItem, "_id"> {
  _id: ObjectId;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id, status } = req.query;

    if (typeof id !== "string") {
      return res.status(400).json({
        msg: "Required parameters are missing.",
      });
    }

    const isValid = typeof status === "string" && isStatus(status);
    const updater = isValid ? { status: { $eq: status as Status } } : {};
    console.log(`Searching: ${id}${isValid ? ` - ${status}` : ""}`);

    const db = await getDb();
    const matchedJob = await db
      .collection<Job>(Collections.Jobs)
      .findOne({ _id: new ObjectId(id), ...updater });

    if (!matchedJob?._id) {
      return res.status(400).json({
        code: 400,
        message: "Cannot find job.",
      });
    }

    return res.json(matchedJob);
  }

  return { code: 400 };
}
