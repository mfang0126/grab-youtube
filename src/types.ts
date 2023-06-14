import { type NextApiRequest, type NextApiResponse } from "next";

export type RequestHandler = (
  req: NextApiRequest,
  resp: NextApiResponse
) => Promise<void>;
