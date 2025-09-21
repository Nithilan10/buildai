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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "tile";
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const maxPrice = searchParams.get("maxPrice");

    // Build SQL query based on parameters
    let sqlQuery = 'SELECT * FROM products WHERE image_url IS NOT NULL';
    const queryParams = [];
    let paramCount = 0;

    // Add category filter
    if (category && category !== 'all') {
      paramCount++;
      sqlQuery += ` AND category ILIKE $${paramCount}`;
      queryParams.push(`%${category}%`);
    }

    // Add search query filter
    if (query && query !== 'all') {
      paramCount++;
      sqlQuery += ` AND (name ILIKE $${paramCount} OR brand ILIKE $${paramCount} OR category ILIKE $${paramCount})`;
      queryParams.push(`%${query}%`);
    }

    // Add price filter
    if (maxPrice && maxPrice !== 'any') {
      paramCount++;
      sqlQuery += ` AND (price->>'range' IS NULL OR (price->'range'->>0)::numeric <= $${paramCount})`;
      queryParams.push(parseFloat(maxPrice));
    }

    sqlQuery += ' ORDER BY created_at DESC LIMIT 50';

    // Fetch from database
    const client = await pool.connect();
    try {
      const result = await client.query(sqlQuery, queryParams);
      
      // Transform database rows to match expected format
      const products = result.rows.map(row => {
        // Extract price from range or use a default
        let price = 0;
        if (row.price && row.price.range && Array.isArray(row.price.range)) {
          price = row.price.range[0] || 0;
        } else if (row.price && typeof row.price === 'number') {
          price = row.price;
        }

        return {
          id: row.product_id,
          name: row.name,
          brand: row.brand,
          category: row.category,
          material: row.material,
          finish: row.finish,
          colorway: row.colorway,
          dimensions: row.dimensions,
          coverage_per_case_sq_ft: row.coverage_per_case_sq_ft,
          price: price,
          rating: parseFloat(row.rating) || 0,
          reviewCount: parseInt(row.review_count) || 0,
          image: row.image_url, // Map image_url to image
          product_url: row.product_url,
          sku_or_model: row.sku_or_model,
          in_stock: row.in_stock,
          model_url: row.model_url, // Include pre-generated model URL
          // Keep original fields for compatibility
          image_url: row.image_url,
          review_count: row.review_count,
          originalPrice: null,
          features: [],
          isNew: false,
          discount: 0
        };
      });

      return NextResponse.json({ products });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
