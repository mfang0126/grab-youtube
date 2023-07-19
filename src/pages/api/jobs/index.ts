import type { NextApiRequest, NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { requestInfoFromYoutube } from "~/services/youtube-services";
import type { YoutubeDetials } from "~/typing";
import { getYouTubeVideoId } from "~/utils/stringHelper";

interface JobPayload {
  url: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body as JobPayload;
  const videoId = getYouTubeVideoId(url);
  const db = await getDb();

  if (videoId) {
    console.log(`${videoId} - Found videoId`);
    // Get job data by videoId
    const job = await db
      .collection<YoutubeDetials>(Collections.YoutubeJob)
      .findOne({ videoId });

    if (job?._id) {
      console.log(`${videoId} - Found video data.`);
      return res.json(job);
    }
  }

  if (url) {
    // Request job data from youtube
    const grabbedInfo = await requestInfoFromYoutube(url);

    if (!grabbedInfo) {
      throw { code: 400 };
    }

    const { value } = await db
      .collection<YoutubeDetials>(Collections.YoutubeJob)
      .findOneAndUpdate(
        { videoId: grabbedInfo.videoId },
        { $set: grabbedInfo }
      );

    if (value?._id) {
      console.log(`${videoId} - Pull info from youtube`);
      return res.json({ ...grabbedInfo, _id: value?._id });
    }
  }

  throw { code: 400 };
}