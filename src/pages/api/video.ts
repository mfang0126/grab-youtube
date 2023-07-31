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

  const youtubeVideoId = getYouTubeVideoId(url);
  const db = await getDb();

  if (youtubeVideoId) {
    // Get job data by youtubeVideoId
    const job = await db
      .collection<Video>(Collections.Videos)
      .findOne({ videoId: youtubeVideoId });

    if (job?._id) {
      console.log(`${youtubeVideoId} - Found video data in database.`);
      return res.json(job);
    }
  }

  console.log(`${youtubeVideoId} - New video request.`);

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
      { videoId: grabbedInfo.youtubeVideoId },
      { $set: grabbedInfo },
      { upsert: true, returnDocument: "after" }
    );

  if (!value?._id) {
    return res.status(400).json({
      msg: "Error on saving the video data.",
    });
  }

  console.log(`${youtubeVideoId} - Pull info from youtube`);
  res.json({ ...grabbedInfo, _id: value?._id });
}
