'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Calendar, Clock, Send, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter/X', color: 'bg-black' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
];

export default function CreateImagePage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 10));
  };

  const togglePlatform = (platformId: string) => {
    if (!connectedPlatforms.includes(platformId)) return;
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const getImageUrl = () => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/api/placeholder/800/600`;
  };

  const handlePost = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Please select at least one image');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.warning('Please select at least one platform');
      return;
    }
    if (scheduleType === 'later' && (!scheduleDate || !scheduleTime)) {
      toast.warning('Please select date and time for scheduling');
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
          content: caption.trim() || 'Shared an image',
          imageUrl: getImageUrl(),
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
        toast.success('Post scheduled successfully!');
      }

      router.push('/dashboard/posts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsUploading(false);
    }
  };

  const canPost =
    selectedFiles.length > 0 &&
    selectedPlatforms.length > 0 &&
    (scheduleType === 'now' || (scheduleDate && scheduleTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ImageIcon className="w-8 h-8" />
              Create Image Post
            </h1>
            <p className="text-blue-100 mt-2">Upload images and schedule your social media posts</p>
          </div>

          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Upload Images</h2>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop images here, or <span className="text-blue-600 font-medium">click to browse</span>
                </p>
                <p className="text-sm text-gray-400">JPG, PNG, GIF (Max 10 images)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        width={200}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Caption</h2>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here... #hashtags"
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="text-right text-sm text-gray-500">{caption.length}/2200</div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Platforms</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PLATFORMS.map((platform) => {
                  const connected = connectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      disabled={!connected}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-blue-500 bg-blue-50'
                          : connected
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${platform.color} mb-2`} />
                      <div className="font-medium text-gray-800">{platform.name}</div>
                      {!connected && (
                        <Link
                          href="/dashboard/platforms"
                          className="text-xs text-blue-600 hover:underline mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Connect
                        </Link>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setScheduleType('now')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'now' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Send className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Post Now</div>
                </button>
                <button
                  onClick={() => setScheduleType('later')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'later' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Schedule</div>
                </button>
              </div>
              {scheduleType === 'later' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handlePost}
                disabled={!canPost || isUploading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  canPost && !isUploading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {scheduleType === 'now' ? 'Publishing...' : 'Scheduling...'}
                  </>
                ) : scheduleType === 'now' ? (
                  'Post Now'
                ) : (
                  'Schedule Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
