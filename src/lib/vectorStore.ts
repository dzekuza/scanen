import { PineconeClient } from '@pinecone-database/pinecone';

const pineconeApiKey = process.env.PINECONE_API_KEY;
const pineconeIndex = process.env.PINECONE_INDEX_NAME;

let pinecone: PineconeClient | null = null;
let fallbackStore: Record<string, { id: string, embedding: number[], metadata: any }[]> = {};

async function getPinecone() {
  if (!pinecone && pineconeApiKey && pineconeIndex) {
    pinecone = new PineconeClient();
    await pinecone.init({ apiKey: pineconeApiKey, environment: process.env.PINECONE_ENVIRONMENT });
  }
  return pinecone;
}

export async function upsertEmbedding(businessId: string, id: string, embedding: number[], metadata: any) {
  const client = await getPinecone();
  if (client) {
    const index = client.Index(pineconeIndex!);
    await index.upsert({
      upsertRequest: {
        namespace: businessId,
        vectors: [{ id, values: embedding, metadata }],
      },
    });
  } else {
    if (!fallbackStore[businessId]) fallbackStore[businessId] = [];
    fallbackStore[businessId].push({ id, embedding, metadata });
  }
}

export async function queryEmbeddings(businessId: string, embedding: number[], topK: number): Promise<{id: string, score: number, metadata: any}[]> {
  const client = await getPinecone();
  if (client) {
    const index = client.Index(pineconeIndex!);
    const res = await index.query({
      queryRequest: {
        namespace: businessId,
        topK,
        vector: embedding,
        includeMetadata: true,
        includeValues: false,
      },
    });
    return res.matches?.map(m => ({ id: m.id, score: m.score, metadata: m.metadata })) || [];
  } else {
    // Simple cosine similarity fallback
    const store = fallbackStore[businessId] || [];
    function cosine(a: number[], b: number[]) {
      let dot = 0, a2 = 0, b2 = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        a2 += a[i] * a[i];
        b2 += b[i] * b[i];
      }
      return dot / (Math.sqrt(a2) * Math.sqrt(b2));
    }
    return store
      .map(item => ({ ...item, score: cosine(item.embedding, embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
} 