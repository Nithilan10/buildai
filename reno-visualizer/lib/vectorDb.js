import { PineconeClient } from "@pinecone-database/pinecone";

const client = new PineconeClient();
await client.init({ apiKey: process.env.PINECONE_KEY, environment: "us-east1-gcp" });
const index = client.Index("products");

export async function upsertProducts(productsWithEmbeddings) {
  const vectors = productsWithEmbeddings.map(p => ({
    id: p.id,
    values: p.embedding,
    metadata: { name: p.name, category: p.category }
  }));
  await index.upsert({ vectors });
}

export async function querySimilarProducts(queryEmbedding, topK = 10) {
  const res = await index.query({ vector: queryEmbedding, topK, includeMetadata: true });
  return res.matches;
}
