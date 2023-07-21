import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { generateVideo } from "~/services/youtube-services";
import { Status, type ProgressJob, type YoutubeDetails } from "~/typing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();
  const job = await db.collection<ProgressJob>(Collections.Jobs).findOne(
    {
      status: { $eq: Status.ready },
    },
    { sort: { updatedAt: -1 } }
  );

  if (!job?.videoId) {
    console.log(`No job to process.`);
    return res.json(`No job to process.`);
  }

  const video = await db
    .collection<YoutubeDetails>(Collections.Videos)
    .findOne({ _id: job.videoId });

  if (!video?._id) {
    console.log(`${job?._id.toString()} - Cannot find video data.`);
    return res.json(`No job to process.`);
  }

  await generateVideo(video, job.formatItag);

  await db.collection<ProgressJob>(Collections.Jobs).findOneAndUpdate(
    { _id: job._id },
    {
      $set: { updatedAt: new Date(), status: Status.completed, progress: 100 },
    }
  );

  return res.json(`Job's Done`);
}
