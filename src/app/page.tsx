'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Download, Loader2, Video, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedVideo {
  id: string
  prompt: string
  videoUrl: string
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
}

interface GenerationStatus {
  status: 'idle' | 'processing' | 'completed' | 'failed'
  progress: number
  message: string
  videoUrl?: string
}

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  })
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const savedVideos = localStorage.getItem('generatedVideos')
    if (savedVideos) {
      setGeneratedVideos(JSON.parse(savedVideos))
    }
  }, [])

  const saveVideoToStorage = (video: GeneratedVideo) => {
    const updatedVideos = [video, ...generatedVideos]
    setGeneratedVideos(updatedVideos)
    localStorage.setItem('generatedVideos', JSON.stringify(updatedVideos))
  }

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt')
      return
    }

    setIsGenerating(true)
    setGenerationStatus({
      status: 'processing',
      progress: 10,
      message: 'Initializing video generation...'
    })

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const data = await response.json()

      if (data.success && data.videoUrl) {
        setGenerationStatus({
          status: 'completed',
          progress: 100,
          message: 'Video generated successfully!',
          videoUrl: data.videoUrl
        })

        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          prompt,
          videoUrl: data.videoUrl,
          createdAt: new Date().toISOString(),
          status: 'completed'
        }

        saveVideoToStorage(newVideo)
        toast.success('Video generated successfully!')
        setPrompt('')
      } else {
        throw new Error(data.error || 'Video generation failed')
      }
    } catch (error) {
      console.error('Video generation error:', error)
      setGenerationStatus({
        status: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : 'Video generation failed'
      })
      toast.error('Failed to generate video')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadVideo = async (videoUrl: string, prompt: string) => {
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `ai-video-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Video download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download video')
    }
  }

  const resetGeneration = () => {
    setGenerationStatus({
      status: 'idle',
      progress: 0,
      message: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Video Generator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into stunning videos using advanced AI technology. 
            Simply describe what you want to see, and watch it come to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Generation Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Create Your Video
                </CardTitle>
                <CardDescription>
                  Describe the video you want to generate. Be specific about scenes, actions, and visual elements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Video Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A serene sunset over a calm lake with mountains in the background, birds flying across the sky, gentle waves rippling on the water surface..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                    maxLength={500}
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Be descriptive for better results</span>
                    <span>{prompt.length}/500</span>
                  </div>
                </div>

                {/* Generation Status */}
                {generationStatus.status !== 'idle' && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Generation Status</span>
                        <Badge variant={
                          generationStatus.status === 'completed' ? 'default' :
                          generationStatus.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {generationStatus.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {generationStatus.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {generationStatus.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {generationStatus.status}
                        </Badge>
                      </div>
                      
                      {generationStatus.status === 'processing' && (
                        <div className="space-y-2">
                          <Progress value={generationStatus.progress} className="h-2" />
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {generationStatus.message}
                          </div>
                        </div>
                      )}

                      {generationStatus.status === 'completed' && generationStatus.videoUrl && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            {generationStatus.message} Your video is ready for download.
                          </AlertDescription>
                        </Alert>
                      )}

                      {generationStatus.status === 'failed' && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            {generationStatus.message}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={generateVideo} 
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        Generate Video
                      </>
                    )}
                  </Button>
                  
                  {generationStatus.status !== 'idle' && (
                    <Button 
                      variant="outline" 
                      onClick={resetGeneration}
                      size="lg"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Gallery */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  Generated Videos
                </CardTitle>
                <CardDescription>
                  Your recent video generations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedVideos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos generated yet</p>
                    <p className="text-sm">Create your first video to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedVideos.slice(0, 5).map((video) => (
                      <div key={video.id} className="border rounded-lg p-4 space-y-3">
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                          <video
                            src={video.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium line-clamp-2">
                            {video.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadVideo(video.videoUrl, video.prompt)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {generatedVideos.length > 5 && (
                      <p className="text-center text-sm text-muted-foreground">
                        And {generatedVideos.length - 5} more videos...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">AI-Powered</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced AI models generate high-quality videos from your text descriptions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold">Fast Generation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get your videos ready in minutes with real-time progress tracking
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold">Easy Download</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Download your generated videos instantly in high quality
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}