import type { Format } from "fluent-ffmpeg";
import type { NextApiRequest, NextApiResponse } from "next";
import type { MoreVideoDetails } from "ytdl-core";
import { requestInfoFromYoutube } from "~/services/youtube-services";
import type { ErrorResponse } from "~/typing";

export interface InfoResponse {
  videoDetails: MoreVideoDetails;
  formats: Format[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InfoResponse | ErrorResponse>
) {
  const { url } = req.query;

  if (typeof url !== "string") {
    throw new Error("Required parameters are missing.");
  }

  try {
    const response = await requestInfoFromYoutube(url);

    res.json(response);
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .json({ msg: "Error on requesting video info from YouTube" });
  }
}
