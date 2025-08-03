'use client';

import { useState, useRef } from 'react';
import { Upload, X, Calendar, Clock, Send } from 'lucide-react';

export default function CreateVideoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'threads', name: 'Threads', icon: '🧵' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube', icon: '📺' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
    } else {
      alert('Please drop a valid video file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please select a video file');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Video post data:', {
        file: selectedFile,
        caption,
        platforms: selectedPlatforms,
        scheduleType,
        scheduleDate,
        scheduleTime
      });
      
      alert('Video post scheduled successfully!');
      
      // Reset form
      setSelectedFile(null);
      setCaption('');
      setSelectedPlatforms([]);
      setScheduleType('now');
      setScheduleDate('');
      setScheduleTime('');
      
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Video Post</h1>
        <p className="text-gray-600 mt-2">Upload and schedule your video content across multiple platforms.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Video Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Video *
            </label>
            
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop your video file here, or click to browse</p>
                <p className="text-sm text-gray-400">Supported formats: MP4, MOV, AVI, WebM (Max 100MB)</p>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎥</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {selectedFile.type.startsWith('video/') && (
                  <div className="mt-3">
                    <video 
                      src={URL.createObjectURL(selectedFile)} 
                      controls 
                      className="w-full max-h-64 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Write your video caption..."
            />
            <p className="text-sm text-gray-400 mt-1">{caption.length}/2200 characters</p>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platforms *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <label 
                  key={platform.id} 
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => togglePlatform(platform.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xl">{platform.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduling Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Schedule
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="schedule"
                  value="now"
                  checked={scheduleType === 'now'}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Send className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Post now</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="schedule"
                  value="later"
                  checked={scheduleType === 'later'}
                  onChange={(e) => setScheduleType(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Schedule for later</span>
              </label>
            </div>
            
            {scheduleType === 'later' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              disabled={isUploading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isUploading || !selectedFile || selectedPlatforms.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
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