import { type NextApiRequest, type NextApiResponse } from "next";
import { getDb, getSession } from "~/services/mongodb";
import { Collections, type YoutubeJob } from "~/entities";
import { requestInfoFromYoutube } from "~/services/youtube-services";

interface JobPayload {
  videoId?: string;
  url?: string;
  format?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { videoId, url, format } = req.body as JobPayload;

  if (videoId) {
    const job = await getInfoByVideoId(videoId);
    res.json(job);
  }

  if (url) {
    const grabbedInfo = await requestInfoFromYoutube(url);

    res.json(grabbedInfo);
  }
}

async function getInfoByVideoId(videoId: string) {
  const db = await getDb();
  const job = await db
    .collection<YoutubeJob>(Collections.YoutubeJob)
    .findOne({ videoId });

  if (!job) {
    throw { code: 400 };
  }

  return job;
}

// TODO:
async function saveJobInfo(videoId: string) {
  //   const db = await getDb();
  //   const session = getSession();
  //   return session
  //     .withTransaction(async () => {
  //       const { value } = await db
  //         .collection<YoutubeJob>(Collections.YoutubeJob)
  //         .findOneAndUpdate(
  //           { type: SequenceType.Order, year },
  //           { $inc: { lastSeq: 1 } },
  //           { upsert: true, session, returnDocument: "after" }
  //         );
  //     })
  //     .catch((e) => {
  //       console.error("Error on requesting from Youtube.:", e);
  //       return res.status(400).json({ msg: "Error on requesting from Youtube." });
  //     });
  //   return job;
}
