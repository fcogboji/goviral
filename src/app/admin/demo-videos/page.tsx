'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface DemoVideo {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function DemoVideosPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<DemoVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/demo-videos');
      const data = await response.json();

      if (data.videos) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = '/api/admin/demo-videos';
      const method = editingVideo ? 'PATCH' : 'POST';
      const body = editingVideo
        ? { id: editingVideo.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save video');
      }

      // Reset form and refresh list
      resetForm();
      fetchVideos();
      toast.success(editingVideo ? 'Video updated successfully' : 'Video created successfully');
    } catch (error) {
      console.error('Error saving video:', error);
      toast.error('Failed to save video');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video: DemoVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtubeUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      isActive: video.isActive,
      order: video.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/demo-videos?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      fetchVideos();
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      thumbnailUrl: '',
      isActive: true,
      order: 0,
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Demo Videos Management</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {showForm ? 'Cancel' : 'Add New Video'}
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Demo Video Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the demo video"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  YouTube URL *
                </label>
                <Input
                  required
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or video ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full YouTube URL or just the video ID
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Thumbnail URL (Optional)
                </label>
                <Input
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order
                  </label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower numbers appear first
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active (visible to users)
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Saving...' : editingVideo ? 'Update Video' : 'Create Video'}
                </Button>
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Videos List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No demo videos yet. Create your first one!</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {videos.map((video) => (
              <Card key={video.id} className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail Preview */}
                  <div className="flex-shrink-0">
                    {video.youtubeUrl && extractYouTubeId(video.youtubeUrl) ? (
                      <Image
                        src={`https://img.youtube.com/vi/${extractYouTubeId(video.youtubeUrl)}/mqdefault.jpg`}
                        alt={video.title}
                        width={192}
                        height={112}
                        className="w-48 h-28 object-cover rounded"
                      />
                    ) : (
                      <div className="w-48 h-28 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400">No preview</span>
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Order: {video.order}</span>
                          <span className={video.isActive ? 'text-green-600' : 'text-red-600'}>
                            {video.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span>Created: {new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(video)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(video.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
