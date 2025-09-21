import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl, roomType = 'bathroom' } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log(`Received image for AI room analysis: ${imageUrl}, type: ${roomType}`);

    // Try OpenAI Vision API for AI-powered room analysis, fallback to mock data
    let analysis;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        console.log('Attempting OpenAI Vision API analysis...');
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this ${roomType} image and provide detailed room layout information. Focus on:

1. ROOM SHAPE: Determine if the room is rectangular, square, or irregular
2. WALL IDENTIFICATION: Identify each wall (back, left, right, front) and their materials/colors
3. FLOOR IDENTIFICATION: Identify floor material, color, and pattern
4. DIMENSIONS: Estimate realistic room dimensions in feet

Return a JSON response with this structure:
{
  "roomType": "bathroom|bedroom|living_room|kitchen",
  "roomShape": "rectangular|square|irregular",
  "dimensions": {
    "width": number,
    "depth": number,
    "height": 8
  },
  "walls": {
    "back": {
      "material": "tile|paint|wallpaper|wood",
      "color": "#hex_color",
      "texture": "smooth|textured|patterned"
    },
    "left": {
      "material": "tile|paint|wallpaper|wood", 
      "color": "#hex_color",
      "texture": "smooth|textured|patterned"
    },
    "right": {
      "material": "tile|paint|wallpaper|wood",
      "color": "#hex_color", 
      "texture": "smooth|textured|patterned"
    },
    "front": {
      "material": "tile|paint|wallpaper|wood",
      "color": "#hex_color",
      "texture": "smooth|textured|patterned"
    }
  },
  "floor": {
    "material": "tile|wood|carpet|vinyl|concrete",
    "color": "#hex_color",
    "pattern": "solid|checkered|striped|mosaic"
  },
  "elements": [
    {
      "type": "vanity|toilet|bathtub|shower|sink|mirror|cabinet|door|window",
      "id": "unique_id",
      "position": {"x": number, "y": number, "z": number},
      "dimensions": {"width": number, "height": number, "depth": number},
      "material": "tile|wood|glass|metal|porcelain|marble|granite",
      "color": "#hex_color"
    }
  ],
  "camera": {
    "position": [x, y, z],
    "fov": 60
  }
}

IMPORTANT: 
- If the room appears rectangular, set roomShape to "rectangular"
- Estimate dimensions based on standard room sizes (bathrooms: 5x8 to 10x12 feet)
- Identify wall materials and colors accurately
- Focus on the floor material and pattern`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${imageUrl}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 2000
          })
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const aiAnalysis = openaiData.choices[0].message.content;

          console.log('AI Analysis Response:', aiAnalysis);

          // Parse the AI response
          try {
            // Extract JSON from the response (it might be wrapped in markdown)
            const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed AI analysis');
            } else {
              throw new Error('No JSON found in AI response');
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            throw new Error('AI response parsing failed');
          }
        } else {
          console.error('OpenAI API error:', await openaiResponse.text());
          throw new Error('OpenAI API request failed');
        }
      } catch (aiError) {
        console.error('OpenAI analysis failed, using fallback:', aiError);
        // Fall through to mock data
      }
    } else {
      console.log('No OpenAI API key configured, using mock data');
    }
    
    // Fallback to mock data if AI analysis failed or no API key
    if (!analysis) {
      analysis = {
        roomType: roomType,
        roomShape: 'rectangular',
        dimensions: {
          width: 8,
          depth: 6,
          height: 8
        },
        walls: {
          back: {
            material: 'paint',
            color: '#f0f0f0',
            texture: 'smooth'
          },
          left: {
            material: 'paint',
            color: '#f0f0f0',
            texture: 'smooth'
          },
          right: {
            material: 'paint',
            color: '#f0f0f0',
            texture: 'smooth'
          },
          front: {
            material: 'paint',
            color: '#f0f0f0',
            texture: 'smooth'
          }
        },
        floor: {
          material: 'tile',
          color: '#e2e8f0',
          pattern: 'solid'
        },
        elements: [
          {
            type: 'vanity',
            id: 'vanity-1',
            position: { x: 0, y: 0, z: -2 },
            dimensions: { width: 3, height: 2.5, depth: 1.5 },
            material: 'wood',
            color: '#8b4513'
          }
        ],
        camera: {
          position: [0, 2, 5],
          fov: 60
        }
      };
    }

    console.log('Final analysis:', analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Room analysis API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}