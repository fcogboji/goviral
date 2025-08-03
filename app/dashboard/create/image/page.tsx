'use client';

import { useState, useRef } from 'react';
import { Upload, X, Calendar, Clock, Send, ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function CreateImagePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
    { id: 'twitter', name: 'Twitter/X', color: 'bg-black' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
    { id: 'tiktok', name: 'TikTok', color: 'bg-black' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, 10)); // Max 10 images
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, 10));
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePost = async () => {
    if (selectedFiles.length === 0 || selectedPlatforms.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reset form
    setSelectedFiles([]);
    setCaption('');
    setSelectedPlatforms([]);
    setScheduleType('now');
    setScheduleDate('');
    setScheduleTime('');
    setIsUploading(false);
    
    alert('Post scheduled successfully!');
  };

  const canPost = selectedFiles.length > 0 && selectedPlatforms.length > 0 && 
    (scheduleType === 'now' || (scheduleDate && scheduleTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ImageIcon className="w-8 h-8" />
              Create Image Post
            </h1>
            <p className="text-blue-100 mt-2">Upload images and schedule your social media posts</p>
          </div>

          <div className="p-6 space-y-8">
            {/* File Upload Area */}
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
                <p className="text-sm text-gray-400">Support for JPG, PNG, GIF (Max 10 images)</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Selected Files Preview */}
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
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Caption</h2>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here... #hashtags"
                className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="text-right text-sm text-gray-500">
                {caption.length}/2200 characters
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Platforms</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${platform.color} mx-auto mb-2`}></div>
                    <div className="font-medium text-gray-800">{platform.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Schedule</h2>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setScheduleType('now')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'now'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Send className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Post Now</div>
                </button>
                
                <button
                  onClick={() => setScheduleType('later')}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    scheduleType === 'later'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">Schedule</div>
                </button>
              </div>

              {scheduleType === 'later' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handlePost}
                disabled={!canPost || isUploading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                  canPost && !isUploading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </div>
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