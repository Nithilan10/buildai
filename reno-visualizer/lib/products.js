import fetch from "node-fetch";
import fs from "fs/promises";
import path from "path";

const LOCAL_TILES = path.join(process.cwd(), "data", "tiles.json");
const FURNITURE_API = "https://furniture-api.fly.dev/api/v1/furniture";

export async function getLocalTiles() {
  const raw = await fs.readFile(LOCAL_TILES, "utf8");
  return JSON.parse(raw);
}

export async function getFurniture() {
  try {
    const res = await fetch(FURNITURE_API);
    const data = await res.json();
    return data.products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: p.image_url,
      company: p.brand || p.manufacturer,
      price: p.price,
      dimensions: { width: p.width, height: p.height, depth: p.depth },
      category: p.category || "Furniture",
      metadata: { material: p.material, style: p.style, stock: p.stock }
    }));
  } catch (err) {
    console.error("Furniture fetch failed:", err);
    return [];
  }
}