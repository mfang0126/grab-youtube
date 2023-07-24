import type { NextApiRequest, NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { requestInfoFromYoutube } from "~/services/youtube-services";
import type { Video } from "~/typing";
import { getYouTubeVideoId } from "~/utils/stringHelper";

interface VideoPayload {
  url: string;
}

// Grab video data by youtube url.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body as VideoPayload;
  if (!url) {
    throw { code: 400 };
  }

  const videoId = getYouTubeVideoId(url);
  const db = await getDb();

  if (videoId) {
    // Get job data by videoId
    const job = await db
      .collection<Video>(Collections.Videos)
      .findOne({ videoId });

    if (job?._id) {
      console.log(`${videoId} - Found video data in database.`);
      return res.json(job);
    }
  }

  console.log(`${videoId} - New video request.`);

  // Request job data from youtube
  const grabbedInfo = await requestInfoFromYoutube(url);

  if (!grabbedInfo) {
    return res.status(400).json({
      msg: "Error on pulling the video data.",
    });
  }

  const { value } = await db
    .collection<Video>(Collections.Videos)
    .findOneAndUpdate(
      { videoId: grabbedInfo.videoId },
      { $set: grabbedInfo },
      { upsert: true, returnDocument: "after" }
    );

  if (!value?._id) {
    return res.status(400).json({
      msg: "Error on saving the video data.",
    });
  }

  console.log(`${videoId} - Pull info from youtube`);
  res.json({ ...grabbedInfo, _id: value?._id });
}
