"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Pause, Trash2, Calendar, Clock } from 'lucide-react';
import { VideoPlayer } from './video-player';

export interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  duration?: number;
  fileSize?: string;
  quality?: string;
}

interface VideoGalleryProps {
  videos: GeneratedVideo[];
  onDeleteVideo?: (videoId: string) => void;
  onDownloadVideo?: (video: GeneratedVideo) => void;
  className?: string;
}

export function VideoGallery({ 
  videos, 
  onDeleteVideo, 
  onDownloadVideo,
  className = "" 
}: VideoGalleryProps) {
  const [playingVideo, setPlayingVideo] = React.useState<string | null>(null);

  const handleDownload = async (video: GeneratedVideo) => {
    if (onDownloadVideo) {
      onDownloadVideo(video);
      return;
    }

    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `generated-video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'generating':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'completed':
        return 'Ready';
      case 'generating':
        return 'Generating...';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (videos.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos generated yet</h3>
        <p className="text-gray-500">Start by creating your first AI-generated video above.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Generated Videos</h2>
        <Badge variant="secondary" className="text-sm">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(video.status)} text-white`}
                >
                  {getStatusText(video.status)}
                </Badge>
                {onDeleteVideo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteVideo(video.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-sm font-medium line-clamp-2">
                {video.prompt}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {video.status === 'completed' && video.videoUrl ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <VideoPlayer
                    src={video.videoUrl}
                    poster={video.thumbnailUrl}
                    className="w-full h-full"
                    controls
                  />
                </div>
              ) : video.status === 'generating' ? (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generating video...</p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-red-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-sm text-red-600">Generation failed</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(video.createdAt)}
                </div>
                
                {video.duration && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                )}

                {video.fileSize && (
                  <div className="text-xs text-gray-500">
                    Size: {video.fileSize}
                  </div>
                )}

                {video.quality && (
                  <Badge variant="outline" className="text-xs">
                    {video.quality}
                  </Badge>
                )}
              </div>

              {video.status === 'completed' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(video)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}