'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Calendar, Clock, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
];

export default function CreateVideoPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/platforms/integrate')
      .then((r) => r.json())
      .then((d) => {
        const connected = (d.platforms || [])
          .filter((p: { isConnected: boolean }) => p.isConnected)
          .map((p: { name: string }) => p.name.toLowerCase());
        setConnectedPlatforms(connected);
      })
      .catch(() => {});
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        toast.warning('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    } else if (file) {
      toast.warning('Please select a valid video file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        toast.warning('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    } else {
      toast.warning('Please drop a valid video file');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlatform = (platformId: string) => {
    if (!connectedPlatforms.includes(platformId)) return;
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.warning('Please select a video file');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.warning('Please select at least one platform');
      return;
    }
    if (scheduleType === 'later' && (!scheduleDate || !scheduleTime)) {
      toast.warning('Please select date and time');
      return;
    }

    setIsUploading(true);
    try {
      const scheduledFor =
        scheduleType === 'later' && scheduleDate && scheduleTime
          ? new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
          : null;

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: caption.trim() || `Shared a video: ${selectedFile.name}`,
          videoUrl: null,
          platforms: selectedPlatforms,
          scheduledFor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }
        throw new Error(data.error || 'Failed to create post');
      }

      if (scheduleType === 'now') {
        const publishRes = await fetch('/api/posts/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: data.id, publishNow: true }),
        });
        if (!publishRes.ok) {
          const err = await publishRes.json();
          throw new Error(err.error || 'Failed to publish');
        }
        toast.success('Post published successfully!');
      } else {
        toast.success('Video post scheduled successfully!');
      }

      router.push('/dashboard/posts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canSubmit =
    selectedFile &&
    selectedPlatforms.length > 0 &&
    (scheduleType === 'now' || (scheduleDate && scheduleTime));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Video Post</h1>
        <p className="text-gray-600 mt-2">Upload and schedule your video content across multiple platforms.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video *</label>
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your video here, or click to browse</p>
                <p className="text-sm text-gray-400">MP4, MOV, AVI, WebM (Max 100MB)</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button onClick={removeFile} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {selectedFile.type.startsWith('video/') && (
                  <div className="mt-3">
                    <video src={URL.createObjectURL(selectedFile)} controls className="w-full max-h-64 rounded-lg" />
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Write your video caption..."
            />
            <p className="text-sm text-gray-400 mt-1">{caption.length}/2200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLATFORMS.map((platform) => {
                const connected = connectedPlatforms.includes(platform.id);
                return (
                  <label
                    key={platform.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : connected
                          ? 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      disabled={!connected}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-xl">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                    {!connected && (
                      <Link href="/dashboard/platforms" className="text-xs text-blue-600 ml-auto" onClick={(e) => e.stopPropagation()}>
                        Connect
                      </Link>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Schedule</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={() => setScheduleType('now')}
                  className="w-4 h-4 text-blue-600"
                />
                <Send className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Post now</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="later"
                  checked={scheduleType === 'later'}
                  onChange={() => setScheduleType('later')}
                  className="w-4 h-4 text-blue-600"
                />
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Schedule for later</span>
              </label>
            </div>
            {scheduleType === 'later' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                </>
              ) : (
                <span>{scheduleType === 'now' ? 'Post Now' : 'Schedule Post'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
