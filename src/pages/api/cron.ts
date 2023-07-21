import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import {
  closeQueueResponse,
  generateVideo,
  initQueueResponse,
} from "~/services/youtube-services";
import { Status, type ProgressJob, type YoutubeDetails } from "~/typing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  initQueueResponse(res);

  const db = await getDb();
  const job = await db.collection<ProgressJob>(Collections.Jobs).findOne(
    {
      status: { $eq: Status.ready },
    },
    { sort: { updatedAt: -1 } }
  );

  if (!job?._id) {
    closeQueueResponse();
    return console.log(`No job to process.`);
  }

  const video = await db
    .collection<YoutubeDetails>(Collections.Videos)
    .findOne({ _id: job._id });

  if (!video?._id) {
    closeQueueResponse();
    return console.log(`Cannot find this job.`);
  }

  await generateVideo(video, job.formatItag);
}
