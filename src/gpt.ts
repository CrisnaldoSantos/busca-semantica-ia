import "dotenv/config";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";
import { redis, redisVectorStore } from "./redis-store";

const openAiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
});

const prompt = new PromptTemplate({
  template: `
    Você responde perguntas sobre o livro A arte da guerra, do autor sun tzu. 
    Use o conteúdo das descrições abaixo para responder a pergunta do usuário.
    Se a resposta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.
    Transcrições:
    {context}
    
    Pergunta:
    {question}`.trim(),
  inputVariables: ["context", "question"],
});

export const chain = RetrievalQAChain.fromLLM(
  openAiChat,
  redisVectorStore.asRetriever(3),
  { prompt }
);

async function main() {
  await redis.connect();

  const response = await chain.call({
    query: "O que é doutrina?",
  });
  console.log(response);
  await redis.disconnect();
}

main();
