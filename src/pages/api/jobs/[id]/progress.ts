import { ObjectId } from "mongodb";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import type { ProgressJob } from "~/typing";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  let progress: number | null = null;

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({
      msg: "Required parameters are missing.",
    });
  }
  console.log(`${id} - Fetching progress.`);

  const interval = setInterval(() => {
    void (async () => {
      const db = await getDb();
      const result = await db
        .collection<ProgressJob>(Collections.Jobs)
        .findOne({
          _id: new ObjectId(id),
        });

      if (result?.progress === undefined) {
        console.log("Error on fetching job progress.");
        return res.end();
      }

      progress = result.progress;
      res.write(`data: ${JSON.stringify({ progress })} \n\n`);
    })();
  }, 1000);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  res.on("close", () => {
    clearInterval(interval);
  });
}
