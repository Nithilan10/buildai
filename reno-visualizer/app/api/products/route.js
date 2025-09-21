import { NextResponse } from "next/server";

if (!process.env.LANGFLOW_API_KEY) {
  throw new Error("LANGFLOW_API_KEY environment variable not found.");
}

const LANGFLOW_AGENT_ID = "ab140c7b-dc85-4a7d-afd5-307f7371a79e";
const LANGFLOW_BASE_URL = "http://localhost:7860/api/v1/run";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "floor tile";
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const maxPrice = searchParams.get("maxPrice");

    const payload = {
      output_type: "text",
      input_type: "text",
      input_value: `Find products for query: "${query}", category: "${category || "any"}", style: "${style || "any"}", maxPrice: "${maxPrice || "any"}"`,
      session_id: "user_1",
    };

    const response = await fetch(`${LANGFLOW_BASE_URL}/${LANGFLOW_AGENT_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.LANGFLOW_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    // Parse the raw text as JSON (the nested object)
    let rawData;
    try {
      rawData = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse LangFlow response:", text);
      return NextResponse.json({ products: [] });
    }

    // Navigate to the nested message string
    let nestedMessage = rawData?.outputs?.message?.message || rawData?.messages?.[0]?.message;
    if (!nestedMessage) nestedMessage = "{}";

    // Parse the nested JSON string
    let nestedData;
    try {
      nestedData = JSON.parse(nestedMessage);
    } catch (e) {
      console.error("Failed to parse nested LangFlow message:", nestedMessage);
      nestedData = {};
    }

    // Extract products array
    const products = Array.isArray(nestedData.products) ? nestedData.products : [];

    return NextResponse.json({ products });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
