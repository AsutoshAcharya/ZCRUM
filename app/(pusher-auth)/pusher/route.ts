import type { NextApiRequest, NextApiResponse } from "next";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const auth = pusher.authenticateUser(socketId, channel);
  res.send(auth);
}
