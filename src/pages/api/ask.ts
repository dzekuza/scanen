import type { NextApiRequest, NextApiResponse } from 'next';
import { getEmbeddings } from '@/lib/embeddings';
import { queryEmbeddings } from '@/lib/vectorStore';
import { Configuration, OpenAIApi } from 'openai';

const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { businessId, question, businessName } = req.body;
  if (!businessId || !question || !businessName) return res.status(400).json({ error: 'Missing businessId, question, or businessName' });
  try {
    const qEmbedding = await getEmbeddings(question);
    const matches = await queryEmbeddings(businessId, qEmbedding, 5);
    const context = matches.map(m => m.metadata.text).join('\n---\n');
    const systemPrompt = `You are a commercial assistant for ${businessName}. Use the provided document content to recommend best offer or pricing for the customer.`;
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
      ],
      max_tokens: 512,
      temperature: 0.2,
    });
    res.status(200).json({ answer: completion.data.choices[0].message?.content || '' });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
} 