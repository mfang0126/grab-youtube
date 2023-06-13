import { type NextApiRequest, type NextApiResponse } from "next";
import { ServerSentEvent } from "~/utils/ServerSentEvent";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { client_id } = req.query;

  if (typeof client_id !== "string") {
    res.status(400).json({ error: "client_id is required" });
    return;
  }

  // Setup headers for EventSource
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.status(200).send("event-stream");

  // Send progress info for client side.
  ServerSentEvent.on(client_id, (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    ServerSentEvent.off(client_id);
    res.end();
  });
}
