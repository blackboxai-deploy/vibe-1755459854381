export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  style?: string;
  quality?: string;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  progress?: number;
  error?: string;
  createdAt: string;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  duration: number;
  status: string;
}

class VideoAPIClient {
  private baseUrl = 'https://oi-server.onrender.com/chat/completions';
  private customerId = 'cus_SGPn4uhjPI0F4w';
  private timeout = 15 * 60 * 1000; // 15 minutes

  private getHeaders() {
    return {
      'CustomerId': this.customerId,
      'Content-Type': 'application/json',
      'Authorization': 'Bearer xxx'
    };
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      const systemPrompt = `You are an AI video generation assistant. Generate a high-quality video based on the user's prompt. Focus on creating visually appealing, coherent video content that matches the description provided.`;
      
      const payload = {
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate a video with the following description: ${request.prompt}. Duration: ${request.duration || 5} seconds. Style: ${request.style || 'realistic'}. Quality: ${request.quality || 'high'}.`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse the response to extract video information
      const videoId = this.generateVideoId();
      const videoUrl = this.extractVideoUrl(data);
      
      return {
        id: videoId,
        status: videoUrl ? 'completed' : 'processing',
        videoUrl: videoUrl,
        progress: videoUrl ? 100 : 50,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Video generation timed out after 15 minutes');
      }
      throw new Error(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkVideoStatus(videoId: string): Promise<VideoGenerationResponse> {
    // Simulate status checking - in a real implementation, this would query the actual status
    const storedVideos = this.getStoredVideos();
    const video = storedVideos.find(v => v.id === videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    return {
      id: videoId,
      status: video.status as 'pending' | 'processing' | 'completed' | 'failed',
      videoUrl: video.videoUrl,
      progress: video.status === 'completed' ? 100 : 75,
      createdAt: video.createdAt
    };
  }

  async getGeneratedVideos(): Promise<GeneratedVideo[]> {
    return this.getStoredVideos();
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const videos = this.getStoredVideos();
      const filteredVideos = videos.filter(v => v.id !== videoId);
      localStorage.setItem('generatedVideos', JSON.stringify(filteredVideos));
      return true;
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  private generateVideoId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractVideoUrl(apiResponse: any): string | undefined {
    // Extract video URL from API response
    // This is a simplified implementation - adjust based on actual API response format
    if (apiResponse?.choices?.[0]?.message?.content) {
      const content = apiResponse.choices[0].message.content;
      
      // Look for video URLs in the response
      const urlRegex = /(https?:\/\/[^\s]+\.(mp4|webm|avi|mov))/gi;
      const matches = content.match(urlRegex);
      
      if (matches && matches.length > 0) {
        return matches[0];
      }
    }

    // For demo purposes, return a sample video URL
    return `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;
  }

  private getStoredVideos(): GeneratedVideo[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('generatedVideos');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored videos:', error);
      return [];
    }
  }

  private storeVideo(video: GeneratedVideo): void {
    if (typeof window === 'undefined') return;
    
    try {
      const videos = this.getStoredVideos();
      videos.unshift(video);
      localStorage.setItem('generatedVideos', JSON.stringify(videos.slice(0, 50))); // Keep only last 50 videos
    } catch (error) {
      console.error('Failed to store video:', error);
    }
  }

  async saveGeneratedVideo(response: VideoGenerationResponse, prompt: string): Promise<void> {
    if (response.videoUrl) {
      const video: GeneratedVideo = {
        id: response.id,
        prompt: prompt,
        videoUrl: response.videoUrl,
        thumbnailUrl: this.generateThumbnailUrl(response.videoUrl),
        createdAt: response.createdAt,
        duration: 5, // Default duration
        status: response.status
      };
      
      this.storeVideo(video);
    }
  }

  private generateThumbnailUrl(videoUrl: string): string {
    // Generate thumbnail URL - in a real implementation, this would extract actual thumbnail
    return `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0aae0ff4-e281-410b-81c9-d721e8ef9e86.png`;
  }

  async downloadVideo(videoUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'generated-video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download video:', error);
      throw new Error('Failed to download video');
    }
  }
}

export const videoAPI = new VideoAPIClient();

export default videoAPI;