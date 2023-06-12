import { NextApiRequest, NextApiResponse } from "next";
import { ServerSentEvent } from "~/utils/ServerSentEvent";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { client_id } = req.query;

  if (typeof client_id !== "string") {
    res.status(400).json({ error: "client_id is required" });
    return;
  }

  // Setup headers for EventSource
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send progress info for client side.
  ServerSentEvent.on(client_id, (data) => {
    console.log(data);
    res.write(`data:${JSON.stringify(data)}\n\n`);
  });

  req.on("close", () => {
    ServerSentEvent.off(client_id);
    res.end();
  });
};
