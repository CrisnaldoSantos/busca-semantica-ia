import { redis, redisVectorStore } from "./redis-store";

async function search() {
  await redis.connect();

  const response = await redisVectorStore.similaritySearchWithScore(
    "O que é doutrina?",
    5
  );

  console.log(response);

  await redis.disconnect();
}

search();
