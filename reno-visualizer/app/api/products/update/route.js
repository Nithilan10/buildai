import { NextResponse } from "next/server";
import { Pool } from "pg";

if (!process.env.LANGFLOW_API_KEY) {
  throw new Error("LANGFLOW_API_KEY environment variable not found.");
}

const LANGFLOW_AGENT_ID = "c3a36151-8043-4aa9-a06c-5fa7bcf2f377";
const LANGFLOW_BASE_URL = "http://localhost:7860/api/v1/run";

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_EzvYHcSsZ78X@ep-withered-tooth-aapp46eb-pooler.westus3.azure.neon.tech/neondb?sslmode=require&channel_binding=require',
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function fetchProductsFromLangFlow(query) {
  const payload = {
    "output_type": "text",
    "input_type": "text",
    "input_value": `Find products for query: "${query}", category: "all", style: "all", maxPrice: "2000"`,
    "session_id": "user_1"
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "x-api-key": process.env.LANGFLOW_API_KEY
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(`${LANGFLOW_BASE_URL}/${LANGFLOW_AGENT_ID}`, options);
    const text = await response.text();
    const rawData = JSON.parse(text);
    
    // Parse the nested response structure
    let message = rawData?.outputs?.["0"]?.outputs?.["0"]?.outputs?.message?.message;
    if (!message) return [];
    
    let messageData = JSON.parse(message);
    let textData = JSON.parse(messageData.text);
    
    return Array.isArray(textData.results) ? textData.results : [];
  } catch (error) {
    console.error(`Error fetching products for query "${query}":`, error);
    return [];
  }
}

async function insertProduct(client, product) {
  const query = `
    INSERT INTO products (
      product_id, name, brand, category, material, finish, colorway,
      dimensions, coverage_per_case_sq_ft, price, rating, review_count,
      image_url, product_url, sku_or_model, in_stock
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (product_id) DO UPDATE SET
      name = EXCLUDED.name,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      material = EXCLUDED.material,
      finish = EXCLUDED.finish,
      colorway = EXCLUDED.colorway,
      dimensions = EXCLUDED.dimensions,
      coverage_per_case_sq_ft = EXCLUDED.coverage_per_case_sq_ft,
      price = EXCLUDED.price,
      rating = EXCLUDED.rating,
      review_count = EXCLUDED.review_count,
      image_url = EXCLUDED.image_url,
      product_url = EXCLUDED.product_url,
      sku_or_model = EXCLUDED.sku_or_model,
      in_stock = EXCLUDED.in_stock,
      updated_at = CURRENT_TIMESTAMP
  `;

  const values = [
    product.id,
    product.name,
    product.brand || null,
    product.category || null,
    product.material || null,
    product.finish || null,
    product.colorway || null,
    product.dimensions ? JSON.stringify(product.dimensions) : null,
    product.coverage_per_case_sq_ft || null,
    product.price ? JSON.stringify(product.price) : null,
    product.rating || null,
    product.review_count || null,
    product.image_url || null,
    product.product_url || null,
    product.sku_or_model || null,
    product.in_stock || null
  ];

  await client.query(query, values);
}

export async function POST(req) {
  try {
    const { searchQuery = "tile" } = await req.json();
    
    console.log(`🔄 Updating catalog with query: "${searchQuery}"`);
    
    // Fetch products from LangFlow
    const products = await fetchProductsFromLangFlow(searchQuery);
    
    if (products.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No products found from LangFlow agent",
        productsAdded: 0 
      });
    }
    
    // Insert products into database
    const client = await pool.connect();
    let productsAdded = 0;
    
    try {
      for (const product of products) {
        try {
          await insertProduct(client, product);
          productsAdded++;
          console.log(`  ✅ Added: ${product.name} (${product.brand})`);
        } catch (insertError) {
          console.error(`  ❌ Failed to insert ${product.name}:`, insertError.message);
        }
      }
      
      console.log(`🎉 Catalog update complete! Added ${productsAdded} products`);
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully added ${productsAdded} products to catalog`,
        productsAdded,
        totalProducts: products.length
      });
      
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error("POST /api/products/update error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update catalog",
      message: err.message 
    }, { status: 500 });
  }
}
