import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { roomDimensions, placedTiles } = await req.json();

    if (!roomDimensions || !placedTiles || placedTiles.length === 0) {
      return NextResponse.json({ error: "Room dimensions and placed tiles are required" }, { status: 400 });
    }

    console.log('Calculating wastage for:', { roomDimensions, placedTiles });

    // Prepare the prompt for OpenAI
    const prompt = `
You are a professional tile installation expert. Calculate the exact tile wastage for a room renovation project.

ROOM DIMENSIONS:
- Width: ${roomDimensions.width} feet
- Depth: ${roomDimensions.depth} feet  
- Height: ${roomDimensions.height} feet

PLACED TILES:
${placedTiles.map((tile, index) => `
${index + 1}. ${tile.name}
   - Tile Size: ${tile.dimensions?.width || 'Unknown'} x ${tile.dimensions?.height || 'Unknown'} inches
   - Surface: ${tile.surface} (${tile.surface === 'floor' ? 'Floor' : tile.surface + ' Wall'})
   - Coverage: ${tile.surface === 'floor' ? `${roomDimensions.width} x ${roomDimensions.depth}` : 
     tile.surface === 'back' || tile.surface === 'front' ? `${roomDimensions.width} x ${roomDimensions.height}` :
     `${roomDimensions.depth} x ${roomDimensions.height}`} feet
`).join('')}

CALCULATION REQUIREMENTS:
1. Calculate tiles needed for each surface (floor, walls)
2. Account for standard installation practices:
   - 10% wastage for straight cuts
   - 15% wastage for complex patterns
   - 5% wastage for simple rectangular layouts
3. Consider tile orientation and pattern matching
4. Account for grout lines (typically 1/8" to 1/4")
5. Factor in doorways, windows, and obstacles
6. Include extra tiles for future repairs

Please provide a detailed breakdown in JSON format:
{
  "totalWastage": {
    "percentage": number,
    "reasoning": "string"
  },
  "surfaces": [
    {
      "surface": "floor|back|left|right|front",
      "dimensions": "width x height",
      "tileSize": "width x height inches",
      "tilesNeeded": number,
      "wastagePercentage": number,
      "wastageReasoning": "string",
      "totalTilesWithWastage": number,
      "costEstimate": number
    }
  ],
  "recommendations": [
    "string"
  ],
  "installationTips": [
    "string"
  ]
}

Be precise and professional in your calculations.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional tile installation expert with 20+ years of experience. You provide accurate wastage calculations and installation advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    console.log('OpenAI wastage calculation response:', responseText);

    // Parse the JSON response
    let wastageData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        wastageData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      
      // Fallback to basic calculation
      wastageData = calculateBasicWastage(roomDimensions, placedTiles);
    }

    return NextResponse.json({
      success: true,
      wastageData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Wastage calculation error:', error);
    
    // Fallback to basic calculation if OpenAI fails
    try {
      const { roomDimensions, placedTiles } = await req.json();
      const wastageData = calculateBasicWastage(roomDimensions, placedTiles);
      
      return NextResponse.json({
        success: true,
        wastageData,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      return NextResponse.json({ 
        error: "Failed to calculate wastage", 
        details: error.message 
      }, { status: 500 });
    }
  }
}

// Fallback calculation function
function calculateBasicWastage(roomDimensions, placedTiles) {
  const surfaces = [];
  let totalTiles = 0;
  let totalCost = 0;

  placedTiles.forEach(tile => {
    const surface = tile.surface;
    let surfaceArea = 0;
    let surfaceName = '';

    // Calculate surface area based on which surface
    if (surface === 'floor') {
      surfaceArea = roomDimensions.width * roomDimensions.depth;
      surfaceName = 'Floor';
    } else if (surface === 'back' || surface === 'front') {
      surfaceArea = roomDimensions.width * roomDimensions.height;
      surfaceName = `${surface.charAt(0).toUpperCase() + surface.slice(1)} Wall`;
    } else if (surface === 'left' || surface === 'right') {
      surfaceArea = roomDimensions.depth * roomDimensions.height;
      surfaceName = `${surface.charAt(0).toUpperCase() + surface.slice(1)} Wall`;
    }

    // Convert to square inches
    const surfaceAreaSqIn = surfaceArea * 144; // 1 sq ft = 144 sq in
    
    // Get tile dimensions (assume 12x12 if not specified)
    const tileWidth = tile.dimensions?.width || 12;
    const tileHeight = tile.dimensions?.height || 12;
    const tileAreaSqIn = tileWidth * tileHeight;
    
    // Calculate tiles needed
    const tilesNeeded = Math.ceil(surfaceAreaSqIn / tileAreaSqIn);
    
    // Add 10% wastage
    const wastagePercentage = 10;
    const tilesWithWastage = Math.ceil(tilesNeeded * 1.1);
    
    // Estimate cost (assume $5 per tile)
    const costEstimate = tilesWithWastage * 5;

    surfaces.push({
      surface,
      dimensions: `${roomDimensions.width} x ${roomDimensions.depth} ft`,
      tileSize: `${tileWidth} x ${tileHeight} inches`,
      tilesNeeded,
      wastagePercentage,
      wastageReasoning: "Standard 10% wastage for cuts and breakage",
      totalTilesWithWastage: tilesWithWastage,
      costEstimate
    });

    totalTiles += tilesWithWastage;
    totalCost += costEstimate;
  });

  return {
    totalWastage: {
      percentage: 10,
      reasoning: "Standard wastage calculation with 10% buffer for cuts and breakage"
    },
    surfaces,
    recommendations: [
      "Order 10% extra tiles for cuts and breakage",
      "Consider tile pattern and orientation for optimal usage",
      "Account for doorways and obstacles in your calculations"
    ],
    installationTips: [
      "Start from the center and work outward for best results",
      "Use tile spacers for consistent grout lines",
      "Keep extra tiles for future repairs"
    ],
    summary: {
      totalTiles,
      totalCost,
      totalWastagePercentage: 10
    }
  };
}
