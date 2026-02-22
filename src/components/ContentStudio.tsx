"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Type,
  ImageIcon,
  Music,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  duration: number
  tags: string[]
}

interface VideoElement {
  id: string
  type: 'text' | 'image' | 'video' | 'audio'
  content: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  duration: { start: number; end: number }
  style: {
    fontSize?: number
    color?: string
    fontFamily?: string
    opacity?: number
  }
}

export default function ContentStudio() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [elements, setElements] = useState<VideoElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/platforms/integrate')
      .then((r) => r.json())
      .then((d) => {
        const connected = (d.platforms || [])
          .filter((p: { isConnected: boolean }) => p.isConnected)
          .map((p: { name: string }) => p.name.toLowerCase())
        setConnectedPlatforms(connected)
      })
      .catch(() => {})
  }, [])

  const templates: Template[] = [
    {
      id: '1',
      name: 'Product Showcase',
      category: 'Business',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
      duration: 30,
      tags: ['product', 'business', 'showcase']
    },
    {
      id: '2',
      name: 'Story Time',
      category: 'Entertainment',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
      duration: 60,
      tags: ['story', 'entertainment', 'viral']
    },
    {
      id: '3',
      name: 'Tutorial Guide',
      category: 'Education',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
      duration: 45,
      tags: ['tutorial', 'education', 'how-to']
    },
    {
      id: '4',
      name: 'Behind the Scenes',
      category: 'Lifestyle',
      thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=200&fit=crop',
      duration: 30,
      tags: ['lifestyle', 'behind-scenes', 'authentic']
    }
  ]

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setDuration(template.duration)
    setElements([])
    setCurrentTime(0)
  }

  // Simulate playback when no real video (template uses image) - update timer dynamically
  useEffect(() => {
    if (!isPlaying || !selectedTemplate) return
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= duration) {
          setIsPlaying(false)
          return duration
        }
        return Math.min(t + 0.1, duration)
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, duration, selectedTemplate])

  const handlePlayPause = () => {
    if (videoRef.current?.tagName === 'VIDEO') {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
    if (!selectedTemplate) return
    if (isPlaying && currentTime >= duration) setCurrentTime(0)
    setIsPlaying(!isPlaying)
  }

  const addElement = (type: VideoElement['type']) => {
    const newElement: VideoElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'Add your text here' : '',
      position: { x: 50, y: 50 },
      size: { width: 200, height: 100 },
      duration: { start: currentTime, end: currentTime + 5 },
      style: {
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial',
        opacity: 1
      }
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<VideoElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const exportVideo = () => {
    toast.info('Video export coming soon. Use Save to Drafts to add your content to the library.')
  }

  const shareVideo = () => {
    toast.info('Direct share coming soon. Save to Drafts and schedule from the Content Library.')
  }

  const saveToDrafts = async () => {
    if (!selectedTemplate) {
      toast.warning('Select a template first')
      return
    }
    if (connectedPlatforms.length === 0) {
      toast.warning('Connect at least one platform before saving')
      return
    }

    setSaving(true)
    try {
      const content = elements.length > 0
        ? elements.map((e) => (e.type === 'text' ? e.content : '[Media]')).join(' | ')
        : `Content Studio: ${selectedTemplate.name} template`
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content || `Content Studio: ${selectedTemplate.name}`,
          imageUrl: selectedTemplate.thumbnail,
          platforms: connectedPlatforms,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 403 && data.redirectTo) {
          window.location.href = data.redirectTo
          return
        }
        throw new Error(data.error || 'Failed to save')
      }
      toast.success('Saved to Content Library')
      router.push('/dashboard/posts')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
        <p className="text-gray-600">Create viral videos with our proven templates</p>
        {connectedPlatforms.length === 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <Link href="/dashboard/platforms" className="text-amber-800 font-medium hover:underline">
              Connect your platforms
            </Link>
            {' '}to save drafts and schedule from the Content Library.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Canvas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Canvas Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCurrentTime(0)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="text-sm text-gray-600">
                  {Math.floor(currentTime)}s / {duration}s
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                  title={showPreview ? 'Hide preview' : 'Show preview'}
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={saveToDrafts}
                  disabled={saving || !selectedTemplate || connectedPlatforms.length === 0}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save to Drafts</span>
                </button>
                <button
                  onClick={exportVideo}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={shareVideo}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
              {selectedTemplate ? (
                <div className="w-full h-full relative">
                  {/* Background Image/Video */}
                  <Image
                    src={selectedTemplate.thumbnail}
                    alt={`${selectedTemplate.name} template background`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  />
                  
                  {/* Video Elements */}
                  {elements.map((element) => (
                    <div
                      key={element.id}
                      className={`absolute cursor-move ${
                        selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: `${element.position.x}%`,
                        top: `${element.position.y}%`,
                        width: `${element.size.width}px`,
                        height: `${element.size.height}px`,
                        opacity: element.style.opacity
                      }}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      {element.type === 'text' && (
                        <div
                          className="w-full h-full flex items-center justify-center text-white"
                          style={{
                            fontSize: element.style.fontSize,
                            color: element.style.color,
                            fontFamily: element.style.fontFamily
                          }}
                        >
                          {element.content}
                        </div>
                      )}
                      {element.type === 'image' && element.content && (
                        <Image
                          src={element.content}
                          alt="Video element content"
                          fill
                          className="object-cover"
                          sizes="200px"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎬</div>
                    <p className="text-lg">Select a template to start creating</p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Timeline</span>
                  <span className="text-xs text-gray-500">{Math.floor(currentTime)}s / {duration}s</span>
                </div>
                <div className="relative">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-1 h-2 bg-red-500 rounded-full"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`cursor-pointer rounded-lg p-3 border transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative w-full h-24 mb-2">
                    <Image
                      src={template.thumbnail}
                      alt={`${template.name} template thumbnail`}
                      fill
                      className="object-cover rounded"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{template.duration}s</span>
                    <div className="flex space-x-1">
                      {template.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Elements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Elements</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addElement('text')}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Add text"
              >
                <Type className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Text</span>
              </button>
              <button
                onClick={() => addElement('image')}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Add image"
              >
                <ImageIcon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Image</span>
              </button>
              <button
                onClick={() => addElement('video')}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Add video"
              >
                <Play className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Video</span>
              </button>
              <button
                onClick={() => addElement('audio')}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Add audio"
              >
                <Music className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-700">Audio</span>
              </button>
            </div>
          </div>

          {/* Element Properties */}
          {selectedElement && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Properties</h3>
              {(() => {
                const element = elements.find(el => el.id === selectedElement)
                if (!element) return null

                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <input
                        type="text"
                        value={element.content}
                        onChange={(e) => updateElement(element.id, { content: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">X Position</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={element.position.x}
                          onChange={(e) => updateElement(element.id, { 
                            position: { ...element.position, x: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Y Position</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={element.position.y}
                          onChange={(e) => updateElement(element.id, { 
                            position: { ...element.position, y: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {element.type === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                        <input
                          type="range"
                          min="12"
                          max="72"
                          value={element.style.fontSize}
                          onChange={(e) => updateElement(element.id, { 
                            style: { ...element.style, fontSize: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => deleteElement(element.id)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Element
                    </button>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}