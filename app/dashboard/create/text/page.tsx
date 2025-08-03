'use client';

import { useState } from 'react';
import { Calendar, Clock, Send, Hash, AtSign, Bold, Italic } from 'lucide-react';

export default function CreateTextPage() {
  const [textContent, setTextContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [hashtags, setHashtags] = useState('');

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', charLimit: 63206 },
    { id: 'bluesky', name: 'Bluesky', icon: '🦋', charLimit: 300 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', charLimit: 3000 },
    { id: 'threads', name: 'Threads', icon: '🧵', charLimit: 500 },
    { id: 'twitter', name: 'Twitter', icon: '🐦', charLimit: 280 }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const insertText = (text: string) => {
    const textarea = document.getElementById('textContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textContent.substring(0, start) + text + textContent.substring(end);
      setTextContent(newText);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      }, 0);
    }
  };

  const addHashtag = () => {
    insertText('#');
  };

  const addMention = () => {
    insertText('@');
  };

  const wrapSelection = (wrapper: string) => {
    const textarea = document.getElementById('textContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textContent.substring(start, end);
      
      if (selectedText) {
        const newText = textContent.substring(0, start) + `${wrapper}${selectedText}${wrapper}` + textContent.substring(end);
        setTextContent(newText);
        
        setTimeout(() => {
          textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
          textarea.focus();
        }, 0);
      }
    }
  };

  const getCharacterCount = () => {
    return textContent.length + (hashtags ? hashtags.length + 1 : 0);
  };

  const getMinCharLimit = () => {
    if (selectedPlatforms.length === 0) return Infinity;
    return Math.min(...selectedPlatforms.map(id => {
      const platform = platforms.find(p => p.id === id);
      return platform?.charLimit || Infinity;
    }));
  };

  const handleSubmit = async () => {
    if (!textContent.trim()) {
      alert('Please enter some text content');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    const totalContent = textContent + (hashtags ? '\n\n' + hashtags : '');
    if (totalContent.length > getMinCharLimit()) {
      alert(`Content exceeds character limit for selected platforms (${getMinCharLimit()} chars max)`);
      return;
    }

    setIsPosting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Text post data:', {
        content: totalContent,
        platforms: selectedPlatforms,
        scheduleType,
        scheduleDate,
        scheduleTime
      });
      
      alert('Text post scheduled successfully!');
      
      // Reset form
      setTextContent('');
      setHashtags('');
      setSelectedPlatforms([]);
      setScheduleType('now');
      setScheduleDate('');
      setScheduleTime('');
      
    } catch (error) {
      console.error('Error posting content:', error);
      alert('Error posting content. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const minCharLimit = getMinCharLimit();
  const currentCount = getCharacterCount();
  const isOverLimit = currentCount > minCharLimit;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Text Post</h1>
        <p className="text-gray-600 mt-2">Compose and schedule your text content across multiple platforms.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Text Editor Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            
            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-50 rounded-lg border">
              <button
                onClick={() => wrapSelection('**')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => wrapSelection('*')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={addHashtag}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Add Hashtag"
              >
                <Hash className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={addMention}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Add Mention"
              >
                <AtSign className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <textarea
              id="textContent"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              rows={8}
              placeholder="What's on your mind? Start typing your post content here..."
            />
            
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm text-gray-500">
                {selectedPlatforms.length > 0 && (
                  <span>Character limit: {minCharLimit === Infinity ? '∞' : minCharLimit}</span>
                )}
              </div>
              <div className={`text-sm ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {currentCount} characters
              </div>
            </div>
          </div>

          {/* Hashtags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags (optional)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#socialmedia #marketing #content"
            />
            <p className="text-xs text-gray-400 mt-1">Separate hashtags with spaces</p>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platforms *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <label 
                  key={platform.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => togglePlatform(platform.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{platform.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{platform.charLimit} chars</span>
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

          {/* Preview Section */}
          {textContent && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm text-gray-800">
                  {textContent}
                  {hashtags && (
                    <div className="mt-2 text-blue-600">
                      {hashtags}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button 
              disabled={isPosting}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isPosting || !textContent.trim() || selectedPlatforms.length === 0 || isOverLimit}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isPosting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
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