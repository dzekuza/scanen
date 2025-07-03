import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getEmbeddings(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  });
  return res.data[0].embedding;
} 