import "dotenv/config";
import path from "node:path";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TokenTextSplitter } from "langchain/text_splitter";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "redis";

const filename = "a-arte-da-guerra.pdf";
const documentPath = path.resolve(__dirname, "../books/", filename);

const loader = new PDFLoader(documentPath, {
  splitPages: false,
});

async function load() {
  const docs = await loader.load();

  const splitter = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: 600,
    chunkOverlap: 0,
  });

  const splittedDocs = await splitter.splitDocuments(docs);

  const redis = createClient({
    url: "redis://127.0.0.1:6379",
  });

  await redis.connect();

  await RedisVectorStore.fromDocuments(
    splittedDocs,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      indexName: "a-arte-da-guerra-embbedings",
      redisClient: redis,
      keyPrefix: "a-arte-da-guerra:",
    }
  );

  await redis.disconnect();
}

load();
