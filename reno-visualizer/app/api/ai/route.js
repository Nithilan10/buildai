import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { saveModel, modelExists } from "@/lib/models";
import { calculateTileUsage } from "@/lib/tiles";
import { logError } from "@/lib/logger";

// Fallback recommendation function
function generateFallbackRecommendations(preferences, room) {
  const { mood, color_preference, room_type, budget_range, style_preference } = preferences;
  
  // Base recommendations based on preferences
  const recommendations = [];
  
  // Mood-based recommendations
  if (mood === 'calm') {
    recommendations.push({
      name: "Serene Blue Mosaic Tile",
      description: "Soft blue tones create a peaceful, spa-like atmosphere",
      category: "Tile",
      price: 8.50,
      image: "/uploads/blue-mosaic.jpg",
      recommendation_reason: "The calming blue color and mosaic pattern create a serene, relaxing environment perfect for unwinding."
    });
  } else if (mood === 'energetic') {
    recommendations.push({
      name: "Vibrant Patterned Cement Tile",
      description: "Bold geometric patterns add energy and visual interest",
      category: "Tile",
      price: 12.00,
      image: "/uploads/patterned-cement.jpg",
      recommendation_reason: "The bold patterns and vibrant colors create an energetic, dynamic space that inspires creativity."
    });
  } else if (mood === 'elegant') {
    recommendations.push({
      name: "Luxury Gray Marble Tile",
      description: "Sophisticated marble with elegant veining",
      category: "Tile",
      price: 25.00,
      image: "/uploads/gray-marble.jpg",
      recommendation_reason: "The natural marble veining and sophisticated gray tones create an elegant, luxurious atmosphere."
    });
  }
  
  // Color preference recommendations
  if (color_preference === 'neutral') {
    recommendations.push({
      name: "Classic Travertine Tile",
      description: "Natural beige tones with subtle texture",
      category: "Tile",
      price: 15.00,
      image: "/uploads/travertine.jpg",
      recommendation_reason: "The neutral beige color provides a timeless foundation that works with any decor style."
    });
  } else if (color_preference === 'cool') {
    recommendations.push({
      name: "Glass Backsplash Tile",
      description: "Reflective glass in cool blue-green tones",
      category: "Tile",
      price: 18.00,
      image: "/uploads/glass-backsplash.jpg",
      recommendation_reason: "The cool glass finish and blue-green tones create a refreshing, modern look."
    });
  }
  
  // Room type specific recommendations
  if (room_type === 'bathroom') {
    recommendations.push({
      name: "Waterproof Vinyl Plank Tile",
      description: "Moisture-resistant with wood-like appearance",
      category: "Tile",
      price: 6.50,
      image: "/uploads/vinyl-plank.jpg",
      recommendation_reason: "Perfect for bathrooms - waterproof, slip-resistant, and easy to maintain in wet conditions."
    });
  }
  
  // Budget-based recommendations
  if (budget_range === 'budget') {
    recommendations.push({
      name: "Affordable Ceramic Tile",
      description: "Durable ceramic in classic white",
      category: "Tile",
      price: 3.50,
      image: "/uploads/ceramic-tile.jpg",
      recommendation_reason: "Excellent value - durable, easy to clean, and timeless white color that never goes out of style."
    });
  }
  
  // Style preference recommendations
  if (style_preference === 'modern') {
    recommendations.push({
      name: "Sleek Large Format Tile",
      description: "Minimalist large format for clean lines",
      category: "Tile",
      price: 20.00,
      image: "/uploads/large-format.jpg",
      recommendation_reason: "Large format tiles create fewer grout lines for a clean, modern aesthetic."
    });
  }
  
  // Ensure we have at least 3 recommendations
  while (recommendations.length < 3) {
    recommendations.push({
      name: "Versatile Subway Tile",
      description: "Classic 3x6 inch subway tile in white",
      category: "Tile",
      price: 5.00,
      image: "/uploads/subway-tile.jpg",
      recommendation_reason: "A timeless classic that works in any room and with any style - versatile and always in style."
    });
  }
  
  return recommendations.slice(0, 6); // Return up to 6 recommendations
}

const LANGFLOW_3D_MODEL_ID = "ab140c7b-dc85-4a7d-afd5-307f7371a79e";
const LANGFLOW_RECOMMENDATION_ID = "b2d6a0df-d0c2-444a-a686-d4b244dce36c";
const LANGFLOW_BASE_URL = "http://localhost:7860/api/v1/run";
const LANGFLOW_KEY = process.env.LANGFLOW_API_KEY;

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, room, products, preferences } = body;

    if (action === "3d-model") {
      console.log('3D model generation requested for products:', products);
      
      // Call LangFlow 3D model agent
      const modelUrls = await Promise.all(
        products.map(async (p) => {
          // Generate a unique ID if not present
          const productId = p.id || `${p.name?.replace(/\s+/g, '_')}_${Date.now()}`;
          const filename = `${productId}.glb`;

          console.log(`Processing product: ${p.name} with ID: ${productId}`);

          // Check if model already exists
          if (await modelExists(filename)) {
            console.log(`Model already exists: ${filename}`);
            return `/models/${filename}`;
          }

          console.log(`Generating 3D model for: ${p.name}`);
          
          try {
            const res = await fetch(`${LANGFLOW_BASE_URL}/${LANGFLOW_3D_MODEL_ID}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
                "x-api-key": LANGFLOW_KEY,
              },
              body: JSON.stringify({
                output_type: "text",
                input_type: "text",
                input_value: JSON.stringify({ 
                  products: [{
                    ...p,
                    id: productId
                  }], 
                  room 
                }),
                session_id: "user_1"
              }),
            });

            if (!res.ok) {
              console.error(`LangFlow 3D agent failed for product ${productId}:`, res.status, res.statusText);
              throw new Error(`LangFlow 3D agent failed for product ${productId}`);
            }

                    // Check if the response is JSON (text) or binary GLB
                    const contentType = res.headers.get('content-type');
                    console.log(`Response content-type: ${contentType}`);
                    
                    if (contentType && contentType.includes('application/json')) {
                      // Handle JSON response from LangFlow
                      const jsonData = await res.json();
                      console.log(`LangFlow returned JSON for ${productId}:`, jsonData);
                      
                      // The LangFlow 3D model generator is returning JSON scene data instead of GLB files
                      // For now, we'll use 2D fallback until we can configure it to return actual GLB files
                      console.log(`LangFlow 3D generator returned scene data instead of GLB for ${productId}, using 2D fallback`);
                      return null;
                    } else {
                      // Handle binary GLB response
          const modelBuffer = await res.arrayBuffer();
                      const modelUrl = await saveModel(filename, Buffer.from(modelBuffer));
                      console.log(`3D model saved: ${modelUrl}`);
                      return modelUrl;
                    }
          } catch (error) {
            console.error(`Failed to generate 3D model for ${productId}:`, error);
            return null; // Return null for failed models
          }
        })
      );

      // Filter out null results (failed models)
      const validModels = modelUrls.filter(url => url !== null);
      console.log(`Generated ${validModels.length} valid models out of ${products.length} products`);
      
      return NextResponse.json({ models: validModels });
    }

    if (action === "recommend") {
      console.log('Recommendation request:', { preferences, room });

      // Use LangFlow agent for recommendations
      const res = await fetch(`${LANGFLOW_BASE_URL}/${LANGFLOW_RECOMMENDATION_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LANGFLOW_KEY,
        },
        body: JSON.stringify({
          output_type: "text",
          input_type: "text",
          input_value: JSON.stringify({ 
            preferences, 
            room,
            request_type: "personalized_recommendations"
          }),
          session_id: "user_1"
        }),
      });

      if (!res.ok) throw new Error("LangFlow recommender agent failed");

      const responseData = await res.json();
      
      // Parse the nested response structure
      let nestedMessage = responseData?.outputs?.["0"]?.outputs?.["0"]?.outputs?.message?.message || 
                         responseData?.outputs?.["0"]?.outputs?.message?.message || 
                         responseData?.outputs?.message?.message || 
                         responseData?.messages?.[0]?.message;
      
      let nestedData;
      try {
        nestedData = JSON.parse(nestedMessage);
      } catch (e) {
        console.error("Failed to parse recommendation response:", nestedMessage);
        nestedData = {};
      }
      
      // Extract design options (the agent returns "design_options" or the response itself)
      let recommendedProducts = [];
      
      if (Array.isArray(nestedData.design_options)) {
        recommendedProducts = nestedData.design_options;
      } else if (Array.isArray(nestedData)) {
        recommendedProducts = nestedData;
      } else if (nestedData.products && Array.isArray(nestedData.products)) {
        recommendedProducts = nestedData.products;
      }

      // If no products from LangFlow, generate fallback recommendations
      if (recommendedProducts.length === 0) {
        console.log('No products from LangFlow, using fallback recommendations');
        recommendedProducts = generateFallbackRecommendations(preferences, room);
      }
    
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
