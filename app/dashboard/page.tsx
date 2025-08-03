'use client';

import React from 'react';
import { Type, Image, Video, Menu, Info, LucideProps } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Platform {
  name: string;
  icon: string;
}

interface PostType {
  id: string;
  title: string;
  icon: React.ComponentType<LucideProps>;
  href: string;
  platforms: Platform[];
}

const SocialPostDashboard = () => {
  const router = useRouter();

  const postTypes: PostType[] = [
    {
      id: 'text',
      title: 'Text Post',
      icon: Type,
      href: '/dashboard/create/text',
      platforms: [
        { name: 'Facebook', icon: '📘' },
        { name: 'Bluesky', icon: '🦋' },
        { name: 'LinkedIn', icon: '💼' },
        { name: 'Threads', icon: '🧵' },
        { name: 'Twitter', icon: '🐦' }
      ]
    },
    {
      id: 'image',
      title: 'Image Post',
      icon: Image,
      href: '/dashboard/create/image',
      platforms: [
        { name: 'Facebook', icon: '📘' },
        { name: 'Bluesky', icon: '🦋' },
        { name: 'LinkedIn', icon: '💼' },
        { name: 'Threads', icon: '🧵' },
        { name: 'Twitter', icon: '🐦' },
        { name: 'Instagram', icon: '📸' },
        { name: 'Pinterest', icon: '📌' },
        { name: 'TikTok', icon: '🎵' }
      ]
    },
    {
      id: 'video',
      title: 'Video Post',
      icon: Video,
      href: '/dashboard/create/video',
      platforms: [
        { name: 'Facebook', icon: '📘' },
        { name: 'LinkedIn', icon: '💼' },
        { name: 'Threads', icon: '🧵' },
        { name: 'Twitter', icon: '🐦' },
        { name: 'Instagram', icon: '📸' },
        { name: 'Pinterest', icon: '📌' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'YouTube', icon: '📺' }
      ]
    }
  ];

  const handlePostTypeClick = (href: string) => {
    router.push(href);
  };

  const handleConnectionsClick = () => {
    router.push('/dashboard/connections');
  };

  const handleMenuClick = () => {
    // Add your sidebar toggle logic here
    console.log('Toggle sidebar');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mb-6" 
          aria-label="Open sidebar"
          onClick={handleMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="w-full h-full flex flex-col gap-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create a new post</h1>
          
          <div className="space-y-6">
            {/* Post Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {postTypes.map((postType) => {
                const IconComponent = postType.icon;
                return (
                  <div
                    key={postType.id}
                    className="card transition-all border-2 duration-300 group bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 border-dashed hover:border-solid rounded-lg cursor-pointer"
                    onClick={() => handlePostTypeClick(postType.href)}
                  >
                    <div className="card-body gap-12 pt-16 p-6">
                      <div className="flex flex-col items-center text-center gap-4">
                        <IconComponent className="size-16 stroke-gray-300 dark:stroke-gray-600 group-hover:stroke-blue-500 dark:group-hover:stroke-blue-400 transition-colors duration-300" strokeWidth={2} />
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white group-hover:font-bold">
                          {postType.title}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap justify-start gap-2 w-full">
                        {postType.platforms.map((platform) => (
                          <div
                            key={platform.name}
                            className="w-5 h-5 flex items-center justify-center text-xs opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                            title={platform.name}
                          >
                            {platform.icon}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Connection Info */}
            <div className="flex items-center gap-2 text-blue-600/70 dark:text-blue-400/70">
              <Info className="w-4 h-4" />
              <span className="text-sm">
                You can connect more accounts{' '}
                <button 
                  className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={handleConnectionsClick}
                >
                  here
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPostDashboard;