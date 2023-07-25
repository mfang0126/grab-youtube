import { ObjectId } from "mongodb";
import { type NextApiRequest, type NextApiResponse } from "next";
import { Collections } from "~/entities";
import { getDb } from "~/services/mongodb";
import { Status, type ProgressJob } from "~/typing";

// Get the progress of the downloading job.
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

      if (result.status === Status.completed) {
        console.log("Download completed.");
        res.write(
          `data: ${JSON.stringify({ progress, status: result.status })} \n\n`
        );
        return res.end();
      }

      progress = result.progress;
      res.write(`data: ${JSON.stringify({ progress })} \n\n`);
    })();
  }, 1000);

  // Keep alive for EventSource
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  res.on("close", () => {
    clearInterval(interval);
  });
}
