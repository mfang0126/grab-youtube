import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { generateVideo } from "~/services/youtube-services";
import { Status, type ProgressJob, type Video } from "~/typing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await getDb();
  const job = await db.collection<ProgressJob>(Collections.Jobs).findOne(
    {
      status: { $in: [Status.ready, Status.downloading] },
    },
    { sort: { status: -1, updatedAt: -1 } }
  );

  if (!job?.videoId) {
    console.log(`No job to process.`);
    return res.json(`No job to process.`);
  }

  // TODO: check if we have file and we don't download.
  // We can show the file directly.
  const video = await db
    .collection<Video>(Collections.Videos)
    .findOne({ _id: job.videoId });

  if (!video?._id) {
    console.log(`${job?._id.toString()} - Cannot find video data.`);
    return res.json(`No job to process.`);
  }

  try {
    await generateVideo(video, job.formatItag);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }

  console.log(`Job: ${job._id.toString()} finished.`);
  return res.json(`Job: ${job._id.toString()} finished.`);
}
