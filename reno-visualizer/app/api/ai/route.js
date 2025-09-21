import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { saveModel, modelExists } from "@/lib/models";
import { calculateTileUsage } from "@/lib/tiles";
import { logError } from "@/lib/logger";

const LANGFLOW_FLOW_URL = process.env.LANGFLOW_FLOW_URL;
const LANGFLOW_KEY = process.env.LANGFLOW_KEY;

export async function POST(req) {
  try {
    const { action, room, products } = await req.json();

    if (action === "3d-model") {
      // Call LangFlow 3D model agent
      const modelUrls = await Promise.all(
        products.map(async (p) => {
          const filename = `${p.id}.glb`;

          if (await modelExists(filename)) return `/models/${filename}`;

          const res = await fetch(`${LANGFLOW_FLOW_URL}/agents/3d-model-builder/run`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LANGFLOW_KEY}`,
            },
            body: JSON.stringify({ products: [p], room }), // pass room if needed
          });

          if (!res.ok) throw new Error(`LangFlow 3D agent failed for product ${p.id}`);

          const modelBuffer = await res.arrayBuffer();
          return await saveModel(filename, Buffer.from(modelBuffer));
        })
      );

      return NextResponse.json({ models: modelUrls });
    }

    if (action === "recommend") {
      // Use LangFlow agent for recommendations
      const res = await fetch(`${LANGFLOW_FLOW_URL}/agents/recommender/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LANGFLOW_KEY}`,
        },
        body: JSON.stringify({ products, room }),
      });

      if (!res.ok) throw new Error("LangFlow recommender agent failed");

      const recommendedProducts = await res.json();

    
      const finalProducts = recommendedProducts.map((p) => {
        if (p.category === "Tile") {
          const usage = calculateTileUsage(room, p.dimensions);
          return { ...p, tilesNeeded: usage.tilesNeeded, wastage: usage.wastage };
        }
        return p;
      });

      return NextResponse.json({ products: finalProducts });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logError("POST /api/ai", err);
    return NextResponse.json({ error: err.message || "AI route failed" }, { status: 500 });
  }
}
