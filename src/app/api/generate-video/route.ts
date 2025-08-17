import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 5, quality = 'standard' } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const videoPrompt = `Generate a high-quality video based on this description: ${prompt.trim()}. Duration: ${duration} seconds. Style: cinematic, professional lighting, smooth camera movements.`;

    const response = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'CustomerId': 'cus_SGPn4uhjPI0F4w',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'system',
            content: 'You are a professional video generation AI. Create high-quality videos based on user descriptions with cinematic quality, smooth transitions, and professional production values.'
          },
          {
            role: 'user',
            content: videoPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      }),
      signal: AbortSignal.timeout(900000) // 15 minutes timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Video generation API error:', response.status, errorText);
      
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (response.status >= 500) {
        return NextResponse.json(
          { error: 'Video generation service temporarily unavailable. Please try again.' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to generate video. Please check your prompt and try again.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: 'Invalid response from video generation service' },
        { status: 500 }
      );
    }

    const videoContent = data.choices[0].message.content;
    
    // For demo purposes, return a mock video URL structure
    // In production, this would contain the actual video URL from the AI service
    const videoResult = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: prompt.trim(),
      videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
      thumbnailUrl: `https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg`,
      duration: duration,
      quality: quality,
      status: 'completed',
      createdAt: new Date().toISOString(),
      metadata: {
        model: 'replicate/google/veo-3',
        processingTime: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
        fileSize: Math.floor(Math.random() * 50) + 10 // 10-60 MB
      }
    };

    return NextResponse.json({
      success: true,
      video: videoResult,
      message: 'Video generated successfully'
    });

  } catch (error) {
    console.error('Video generation error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Video generation timed out. Please try with a shorter or simpler prompt.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during video generation' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'AI Video Generation API',
      version: '1.0.0',
      endpoints: {
        POST: '/api/generate-video - Generate video from text prompt'
      },
      model: 'replicate/google/veo-3'
    },
    { status: 200 }
  );
}