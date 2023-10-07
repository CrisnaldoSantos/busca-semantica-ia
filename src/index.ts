import express from "express";

import { Router, Request, Response } from "express";
import { chain } from "./gpt";
import { redis } from "./redis-store";

const app = express();

const route = Router();

app.use(express.json());

route.post("/", async (req: Request, res: Response) => {
  await redis.connect();

  const response = await chain.call({
    query: req.body?.question,
  });

  await redis.disconnect();

  res.json({ response: response?.text });
});

app.use(route);

app.listen(3333, () => console.log("server running on port 3333"));
