"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, Video } from "lucide-react";

interface GenerationProgressProps {
  isGenerating: boolean;
  status: "idle" | "starting" | "processing" | "completed" | "failed";
  progress: number;
  estimatedTime?: number;
  elapsedTime: number;
  onCancel?: () => void;
  onRetry?: () => void;
  error?: string;
  videoUrl?: string;
}

export function GenerationProgress({
  isGenerating,
  status,
  progress,
  estimatedTime,
  elapsedTime,
  onCancel,
  onRetry,
  error,
  videoUrl
}: GenerationProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isGenerating && status === "processing") {
      const interval = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 1, progress);
          }
          return prev;
        });
      }, 100);

      return () => clearInterval(interval);
    } else if (status === "completed") {
      setDisplayProgress(100);
    } else if (status === "idle") {
      setDisplayProgress(0);
    }
  }, [isGenerating, status, progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case "starting":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "processing":
        return <Video className="h-4 w-4 animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "starting":
        return "Initializing video generation...";
      case "processing":
        return "Generating your video...";
      case "completed":
        return "Video generation completed!";
      case "failed":
        return "Video generation failed";
      default:
        return "Ready to generate";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "starting":
        return "bg-blue-500";
      case "processing":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isGenerating && status === "idle") {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Video Generation Progress
          <Badge variant="outline" className={`ml-auto ${getStatusColor()} text-white`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{getStatusText()}</span>
            <span>{displayProgress}%</span>
          </div>
          <Progress 
            value={displayProgress} 
            className="h-2"
            style={{
              background: status === "failed" ? "#fee2e2" : undefined
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Elapsed:</span>
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
          {estimatedTime && status === "processing" && (
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Est. Total:</span>
              <span className="font-mono">{formatTime(estimatedTime)}</span>
            </div>
          )}
        </div>

        {status === "processing" && (
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="mb-1">🎬 AI is analyzing your prompt and generating frames...</p>
            <p className="mb-1">⚡ This process typically takes 5-15 minutes for high-quality videos</p>
            <p>🎯 Progress updates every 30 seconds</p>
          </div>
        )}

        {error && status === "failed" && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="font-medium mb-1">Generation Error:</p>
            <p>{error}</p>
          </div>
        )}

        {status === "completed" && videoUrl && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="font-medium mb-1">✅ Success!</p>
            <p>Your video has been generated and is ready for download.</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {(status === "starting" || status === "processing") && onCancel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel Generation
            </Button>
          )}
          
          {status === "failed" && onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex-1"
            >
              Retry Generation
            </Button>
          )}

          {status === "completed" && videoUrl && (
            <Button 
              size="sm" 
              onClick={() => window.open(videoUrl, '_blank')}
              className="flex-1"
            >
              View Video
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}