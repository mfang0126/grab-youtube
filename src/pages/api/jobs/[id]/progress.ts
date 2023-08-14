import { ObjectId } from "mongodb";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { Status, type ProgressJob } from "~/typing";

// Get the progress of the downloading job.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

      const { progress, status } = result ?? {};
      if (progress === undefined) {
        console.log("Error on fetching job progress.");
        return res.end();
      }

      if (status === Status.completed) {
        console.log("Download completed.");
        res.write(`data: ${JSON.stringify({ progress, status })} \n\n`);
        return res.end();
      }

      res.write(`data: ${JSON.stringify({ progress, status })} \n\n`);
    })();
  }, 3000);

  // Keep alive for EventSource
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  res.on("close", () => {
    clearInterval(interval);
  });
}
