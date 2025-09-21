import { NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { imageUrl, roomAnalysis } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    console.log(`AI-powered room image segmentation: ${imageUrl}`);

    // Get the full image URL
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${imageUrl}`;
    
    // Download the image
    const imageResponse = await fetch(fullImageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const image = sharp(Buffer.from(imageBuffer));
    
    // Get image metadata
    const metadata = await image.metadata();
    const { width: imgWidth, height: imgHeight } = metadata;
    
    console.log(`Image dimensions: ${imgWidth}x${imgHeight}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'segments');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate unique filename base
    const timestamp = Date.now();
    const baseFilename = `room_segment_${timestamp}`;
    
    // Use AI to identify floor and wall regions
    let aiSegmentation = null;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      try {
        console.log('Using AI to identify floor and wall regions...');
        
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
                    text: `Analyze this room image and identify the exact pixel coordinates for:

1. FLOOR: The floor area (ground surface)
2. BACK WALL: The back wall (wall opposite the camera)
3. LEFT WALL: The left wall (wall to the left of the camera)
4. RIGHT WALL: The wall to the right of the camera
5. FRONT WALL: The front wall (wall closest to the camera, if visible)

Return a JSON response with this exact structure:
{
  "floor": {
    "x": number,
    "y": number, 
    "width": number,
    "height": number
  },
  "backWall": {
    "x": number,
    "y": number,
    "width": number, 
    "height": number
  },
  "leftWall": {
    "x": number,
    "y": number,
    "width": number,
    "height": number
  },
  "rightWall": {
    "x": number,
    "y": number,
    "width": number,
    "height": number
  },
  "frontWall": {
    "x": number,
    "y": number,
    "width": number,
    "height": number
  }
}

IMPORTANT:
- Use pixel coordinates (0,0 is top-left corner)
- Only identify areas that are actually visible in the image
- Floor should be the ground surface area
- Walls should be the vertical wall surfaces
- If a wall is not visible, set its coordinates to null
- Be precise with the boundaries`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: fullImageUrl
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000
          })
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const aiAnalysis = openaiData.choices[0].message.content;
          
          console.log('AI Segmentation Response:', aiAnalysis);
          
          // Parse the AI response
          try {
            const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiSegmentation = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed AI segmentation');
            } else {
              throw new Error('No JSON found in AI response');
            }
          } catch (parseError) {
            console.error('Failed to parse AI segmentation response:', parseError);
            throw new Error('AI segmentation parsing failed');
          }
        } else {
          console.error('OpenAI API error:', await openaiResponse.text());
          throw new Error('OpenAI API request failed');
        }
      } catch (aiError) {
        console.error('AI segmentation failed, using fallback:', aiError);
        // Fall through to fallback segmentation
      }
    } else {
      console.log('No OpenAI API key configured, using fallback segmentation');
    }
    
    // Fallback segmentation if AI fails
    if (!aiSegmentation) {
      console.log('Using fallback segmentation based on typical room composition');
      aiSegmentation = {
        floor: {
          x: 0,
          y: Math.floor(imgHeight * 0.6),
          width: imgWidth,
          height: Math.floor(imgHeight * 0.4)
        },
        backWall: {
          x: 0,
          y: 0,
          width: imgWidth,
          height: Math.floor(imgHeight * 0.6)
        },
        leftWall: {
          x: 0,
          y: 0,
          width: Math.floor(imgWidth * 0.3),
          height: Math.floor(imgHeight * 0.6)
        },
        rightWall: {
          x: Math.floor(imgWidth * 0.7),
          y: 0,
          width: Math.floor(imgWidth * 0.3),
          height: Math.floor(imgHeight * 0.6)
        },
        frontWall: {
          x: Math.floor(imgWidth * 0.3),
          y: 0,
          width: Math.floor(imgWidth * 0.4),
          height: Math.floor(imgHeight * 0.6)
        }
      };
    }
    
    // Create segmented images using AI-identified regions
    const segments = {};
    
    for (const [segmentName, region] of Object.entries(aiSegmentation)) {
      if (region && region.x !== null && region.y !== null) {
        try {
          const filename = `${baseFilename}_${segmentName}.jpg`;
          const filepath = path.join(uploadsDir, filename);
          
          // Validate region coordinates
          const x = Math.max(0, Math.min(region.x, imgWidth - 1));
          const y = Math.max(0, Math.min(region.y, imgHeight - 1));
          const width = Math.max(1, Math.min(region.width, imgWidth - x));
          const height = Math.max(1, Math.min(region.height, imgHeight - y));
          
          console.log(`Extracting ${segmentName}: x=${x}, y=${y}, w=${width}, h=${height}`);
          
          // Extract and save the segment
          await image
            .extract({
              left: x,
              top: y,
              width: width,
              height: height
            })
            .jpeg({ quality: 90 })
            .toFile(filepath);
          
          // Create URL for the segment
          const segmentUrl = `/uploads/segments/${filename}`;
          segments[segmentName] = {
            url: segmentUrl,
            region: { x, y, width, height }
          };
          
          console.log(`Created ${segmentName} segment: ${segmentUrl}`);
        } catch (error) {
          console.error(`Failed to create ${segmentName} segment:`, error);
          // Fallback to original image for this segment
          segments[segmentName] = { url: imageUrl };
        }
      } else {
        console.log(`${segmentName} not visible in image, skipping`);
        // Use original image if region not identified
        segments[segmentName] = { url: imageUrl };
      }
    }

    console.log('Generated AI-powered room segments:', segments);

    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Room segmentation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
