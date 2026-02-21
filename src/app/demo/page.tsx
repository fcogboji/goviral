'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ScheduleDemoModal from '@/components/ScheduleDemoModal';

interface DemoVideo {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  order: number;
}

export default function Demo() {
  const router = useRouter();
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<DemoVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDemoVideos();
  }, []);

  const fetchDemoVideos = async () => {
    try {
      const response = await fetch('/api/demo/videos');
      const data = await response.json();

      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setCurrentVideo(data.videos[0]);
      }
    } catch (error) {
      console.error('Error fetching demo videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    // Handle various YouTube URL formats
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

  const handleStartTrial = () => {
    router.push('/trial-signup');
  };

  const handleScheduleDemo = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">
            {currentVideo?.title || 'Product Demo'}
          </h1>
          <p className="text-xl mb-8 text-white/80">
            {currentVideo?.description || 'See how GoViral can transform your social media presence'}
          </p>

          {/* Video Player */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden aspect-video mb-8">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-white/80">Loading demo video...</p>
                </div>
              </div>
            ) : currentVideo ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${extractYouTubeId(currentVideo.youtubeUrl)}`}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-white/80 mb-4">No demo video available at the moment</p>
                  <p className="text-white/60 text-sm">
                    But you can still schedule a live demo with our team!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Multiple Videos Selector */}
          {videos.length > 1 && (
            <div className="mb-8">
              <div className="flex gap-2 justify-center flex-wrap">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setCurrentVideo(video)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentVideo?.id === video.id
                        ? 'bg-white text-purple-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {video.title.length > 30 ? `${video.title.substring(0, 30)}...` : video.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartTrial}
              className="bg-white text-purple-900 font-semibold py-3 px-8 rounded-lg hover:bg-white/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
            <button
              onClick={handleScheduleDemo}
              className="border-2 border-white/30 text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Schedule Live Demo
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold mb-2">Quick Setup</h3>
              <p className="text-sm text-white/70">
                Get started in minutes with our intuitive interface
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold mb-2">Multi-Platform</h3>
              <p className="text-sm text-white/70">
                Connect all your social media accounts in one place
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-white/70">
                Track your performance with detailed insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Demo Modal */}
      <ScheduleDemoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
