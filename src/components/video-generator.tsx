"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Video, Download, Play, Pause, AlertCircle, CheckCircle } from "lucide-react";

interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  createdAt: string;
  status: "generating" | "completed" | "failed";
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([5]);
  const [style, setStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const videoStyles = [
    { value: "realistic", label: "Realistic" },
    { value: "cinematic", label: "Cinematic" },
    { value: "animated", label: "Animated" },
    { value: "artistic", label: "Artistic" },
    { value: "documentary", label: "Documentary" }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a video prompt");
      return;
    }

    setIsGenerating(true);
    setError("");
    setProgress(0);

    const videoId = `video_${Date.now()}`;
    const newVideo: GeneratedVideo = {
      id: videoId,
      prompt,
      videoUrl: "",
      thumbnailUrl: "",
      duration: duration[0],
      createdAt: new Date().toISOString(),
      status: "generating"
    };

    setGeneratedVideos(prev => [newVideo, ...prev]);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 2000);

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          duration: duration[0],
          style,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Failed to generate video: ${response.statusText}`);
      }

      const result = await response.json();
      
      setProgress(100);
      
      // Update the video with the result
      setGeneratedVideos(prev => 
        prev.map(video => 
          video.id === videoId 
            ? {
                ...video,
                videoUrl: result.videoUrl || `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`,
                thumbnailUrl: result.thumbnailUrl || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7090c2af-007b-4491-9478-4e49e8143889.png`,
                status: "completed" as const
              }
            : video
        )
      );

    } catch (err) {
      console.error("Video generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate video");
      
      // Update video status to failed
      setGeneratedVideos(prev => 
        prev.map(video => 
          video.id === videoId 
            ? { ...video, status: "failed" as const }
            : video
        )
      );
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const togglePlay = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Video Generator
        </h1>
        <p className="text-lg text-muted-foreground">
          Transform your ideas into stunning videos with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Generate Video
              </CardTitle>
              <CardDescription>
                Describe the video you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Video Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="A serene sunset over a calm lake with birds flying in the distance..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {prompt.length}/500 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration: {duration[0]} seconds</Label>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Video Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {videoStyles.map((styleOption) => (
                      <SelectItem key={styleOption.value} value={styleOption.value}>
                        {styleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating video...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Video Gallery */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Videos</CardTitle>
              <CardDescription>
                Your AI-generated video collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No videos generated yet. Create your first video!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedVideos.map((video) => (
                    <Card key={video.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        {video.status === "generating" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                              <p className="text-sm text-muted-foreground">Generating...</p>
                            </div>
                          </div>
                        ) : video.status === "failed" ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
                              <p className="text-sm text-destructive">Generation failed</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {playingVideo === video.id ? (
                              <video
                                src={video.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-cover"
                                onEnded={() => setPlayingVideo(null)}
                              />
                            ) : (
                              <div
                                className="relative w-full h-full cursor-pointer group"
                                onClick={() => togglePlay(video.id)}
                              >
                                <img
                                  src={video.thumbnailUrl}
                                  alt="Video thumbnail"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                  <Play className="h-12 w-12 text-white" />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {video.prompt}
                          </p>
                          <Badge
                            variant={
                              video.status === "completed"
                                ? "default"
                                : video.status === "generating"
                                ? "secondary"
                                : "destructive"
                            }
                            className="ml-2"
                          >
                            {video.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {video.status === "generating" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {video.status === "failed" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {video.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>{video.duration}s duration</span>
                          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                        {video.status === "completed" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePlay(video.id)}
                              className="flex-1"
                            >
                              {playingVideo === video.id ? (
                                <>
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Play
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(video.videoUrl, video.prompt)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}