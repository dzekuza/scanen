import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export async function getEmbeddings(text: string): Promise<number[]> {
  const res = await openai.createEmbedding({
    model: 'text-embedding-3-large',
    input: text,
  });
  return res.data.data[0].embedding;
} 