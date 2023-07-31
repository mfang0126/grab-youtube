import { ObjectId } from "mongodb";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { generateVideo } from "~/services/youtube-services";
import { type ProgressJob, type Video } from "~/typing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({
      msg: "Required parameters are missing.",
    });
  }

  const db = await getDb();
  const job = await db.collection<ProgressJob>(Collections.Jobs).findOne({
    _id: new ObjectId(id),
  });

  if (!job?.videoId) {
    console.log(`No job to process.`);
    return res.json(`No job to process.`);
  }

  const video = await db
    .collection<Video>(Collections.Videos)
    .findOne({ _id: job.videoId });

  if (!video?._id) {
    console.log(`${job?._id.toString()} - Cannot find video data.`);
    return res.json(`No job to process.`);
  }

  try {
    // should add job id here.
    await generateVideo(video, job);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }

  console.log(`Job: ${job._id.toString()} finished.`);
  return res.json(`Job: ${job._id.toString()} finished.`);
}
