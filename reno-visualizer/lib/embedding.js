import { getEmbedding } from "./openai.js";

export async function embedProduct(product) {
  const text = `${product.name} ${product.description} ${product.metadata?.style || ""}`;
  const embedding = await getEmbedding(text);
  return { id: product.id, embedding };
}