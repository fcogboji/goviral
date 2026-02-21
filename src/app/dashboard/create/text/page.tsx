'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Send,
  Hash,
  AtSign,
  Bold,
  Italic,
  Zap,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Flame,
  ArrowRight,
  Copy,
  Check,
  BarChart3,
  Globe,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────

interface ViralAnalysis {
  score: number;
  suggestions: string[];
  optimizedContent: string;
  bestPostingTime: string;
  recommendedHashtags: string[];
  engagementPrediction: {
    likes: { min: number; max: number };
    shares: { min: number; max: number };
    comments: { min: number; max: number };
    reach: { min: number; max: number };
  };
}

interface PlatformVersion {
  platform: string;
  content: string;
  characterCount: number;
  hashtags: string[];
  estimatedEngagement: string;
}

interface AIRewriteResult {
  viralVersion: string;
  viralScore: number;
  platformVersions: PlatformVersion[];
  hooks: string[];
  hashtags: string[];
  suggestions: string[];
  tone: string;
  engagementPrediction: {
    estimatedLikes: { min: number; max: number };
    estimatedShares: { min: number; max: number };
    estimatedComments: { min: number; max: number };
    estimatedReach: { min: number; max: number };
  };
}

interface Trend {
  keyword: string;
  hashtag: string;
  mentionCount?: number;
  growthRate?: number;
  sentiment?: string;
}

// ── Component ────────────────────────────────────────────────────────────

export default function CreateTextPage() {
  const router = useRouter();
  const [textContent, setTextContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [hashtags, setHashtags] = useState('');

  // Viral analysis (existing regex-based)
  const [viralAnalysis, setViralAnalysis] = useState<ViralAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // AI rewrite (new OpenAI-powered)
  const [aiResult, setAiResult] = useState<AIRewriteResult | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  // Trending topics (Brandwatch / OpenAI)
  const [trends, setTrends] = useState<Trend[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [showTrends, setShowTrends] = useState(false);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', charLimit: 63206 },
    { id: 'bluesky', name: 'Bluesky', icon: '🦋', charLimit: 300 },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', charLimit: 3000 },
    { id: 'threads', name: 'Threads', icon: '🧵', charLimit: 500 },
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏', charLimit: 280 },
    { id: 'instagram', name: 'Instagram', icon: '📸', charLimit: 2200 },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', charLimit: 150 },
  ];

  const tones = [
    { id: 'casual', label: 'Casual', emoji: '😊' },
    { id: 'professional', label: 'Professional', emoji: '💼' },
    { id: 'humorous', label: 'Humorous', emoji: '😂' },
    { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
    { id: 'provocative', label: 'Bold/Provocative', emoji: '🔥' },
    { id: 'educational', label: 'Educational', emoji: '📚' },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId]
    );
  };

  const insertText = (text: string) => {
    const textarea = document.getElementById('textContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = textContent.substring(0, start) + text + textContent.substring(end);
      setTextContent(newText);
      setTimeout(() => {
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
      }, 0);
    }
  };

  const addHashtag = () => insertText('#');
  const addMention = () => insertText('@');

  const wrapSelection = (wrapper: string) => {
    const textarea = document.getElementById('textContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textContent.substring(start, end);
      if (selectedText) {
        const newText =
          textContent.substring(0, start) + `${wrapper}${selectedText}${wrapper}` + textContent.substring(end);
        setTextContent(newText);
        setTimeout(() => {
          textarea.setSelectionRange(start + wrapper.length, end + wrapper.length);
          textarea.focus();
        }, 0);
      }
    }
  };

  const getCharacterCount = () => textContent.length + (hashtags ? hashtags.length + 1 : 0);
  const getMinCharLimit = () => {
    if (selectedPlatforms.length === 0) return Infinity;
    return Math.min(
      ...selectedPlatforms.map((id) => {
        const platform = platforms.find((p) => p.id === id);
        return platform?.charLimit || Infinity;
      })
    );
  };

  // ── Existing regex-based viral analysis (runs on debounce) ──────────

  const analyzeContent = useCallback(async () => {
    if (textContent.length < 10) return;
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/posts/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram'],
          hasMedia: false,
          mediaType: 'text',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setViralAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [textContent, selectedPlatforms]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textContent.length >= 20) analyzeContent();
    }, 1000);
    return () => clearTimeout(timer);
  }, [textContent, analyzeContent]);

  // ── AI Rewrite (OpenAI-powered) ────────────────────────────────────

  const handleAIRewrite = async () => {
    if (textContent.length < 10) return;
    setIsRewriting(true);
    setShowAIPanel(true);
    try {
      const response = await fetch('/api/posts/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram', 'twitter'],
          tone: selectedTone || undefined,
          action: 'rewrite',
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'AI optimization failed');
      }
      const data = await response.json();
      setAiResult(data.result);
    } catch (error) {
      console.error('AI rewrite error:', error);
      toast.error(error instanceof Error ? error.message : 'AI rewrite failed');
    } finally {
      setIsRewriting(false);
    }
  };

  const applyAIVersion = (content: string) => {
    setTextContent(content);
    setAiResult(null);
    setShowAIPanel(false);
  };

  const copyToClipboard = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  // ── Trending Topics ────────────────────────────────────────────────

  const loadTrends = async () => {
    setIsLoadingTrends(true);
    setShowTrends(true);
    try {
      const response = await fetch('/api/trends?topic=social+media+viral+content&timeframe=24h');
      if (response.ok) {
        const data = await response.json();
        setTrends(data.topTrending || data.trends?.slice(0, 5) || []);
        setTrendingHashtags(data.recommendedHashtags || []);
      }
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // ── Apply helpers ──────────────────────────────────────────────────

  const applyOptimization = () => {
    if (viralAnalysis?.optimizedContent) setTextContent(viralAnalysis.optimizedContent);
  };

  const applyHashtags = () => {
    if (viralAnalysis?.recommendedHashtags) setHashtags(viralAnalysis.recommendedHashtags.join(' '));
  };

  const applyTrendingHashtag = (tag: string) => {
    setHashtags((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  // ── Submit ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!textContent.trim()) {
      toast.warning('Please enter some text content');
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.warning('Please select at least one platform');
      return;
    }

    const totalContent = textContent + (hashtags ? '\n\n' + hashtags : '');
    if (totalContent.length > getMinCharLimit()) {
      toast.warning(`Content exceeds character limit for selected platforms (${getMinCharLimit()} chars max)`);
      return;
    }

    setIsPosting(true);
    try {
      let scheduledFor = null;
      if (scheduleType === 'later' && scheduleDate && scheduleTime) {
        scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: textContent,
          platforms: selectedPlatforms,
          hashtags: hashtags
            .split(' ')
            .filter((h) => h.startsWith('#') || h.length > 0)
            .map((h) => (h.startsWith('#') ? h : `#${h}`)),
          scheduledFor,
          status: scheduleType === 'now' ? 'DRAFT' : 'SCHEDULED',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      const post = await response.json();

      if (scheduleType === 'now') {
        const publishResponse = await fetch('/api/posts/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id, publishNow: true }),
        });
        if (!publishResponse.ok) {
          const error = await publishResponse.json();
          throw new Error(error.error || 'Failed to publish post');
        }
        toast.success('Post published successfully!');
      } else {
        toast.success('Post scheduled successfully!');
      }

      router.push('/dashboard/posts');
    } catch (error) {
      console.error('Error posting content:', error);
      toast.error(error instanceof Error ? error.message : 'Error posting content. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const minCharLimit = getMinCharLimit();
  const currentCount = getCharacterCount();
  const isOverLimit = currentCount > minCharLimit;

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Text Post</h1>
        <p className="text-gray-600 mt-2">Compose, optimize with AI, and publish across all platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main Editor (2/3 width) ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-6">
              {/* Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>

                {/* Toolbar */}
                <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => wrapSelection('**')} className="p-2 hover:bg-gray-200 rounded" title="Bold">
                      <Bold className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => wrapSelection('*')} className="p-2 hover:bg-gray-200 rounded" title="Italic">
                      <Italic className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <button onClick={addHashtag} className="p-2 hover:bg-gray-200 rounded" title="Add Hashtag">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={addMention} className="p-2 hover:bg-gray-200 rounded" title="Add Mention">
                      <AtSign className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* AI Rewrite Button */}
                  <button
                    onClick={handleAIRewrite}
                    disabled={isRewriting || textContent.length < 10}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isRewriting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Rewriting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Make it Viral
                      </>
                    )}
                  </button>
                </div>

                {/* Tone selector (shows when AI panel is open) */}
                {showAIPanel && (
                  <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                    <span className="text-xs text-gray-500 shrink-0">Tone:</span>
                    {tones.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(selectedTone === tone.id ? '' : tone.id)}
                        className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full border whitespace-nowrap transition-colors ${
                          selectedTone === tone.id
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <span>{tone.emoji}</span>
                        {tone.label}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  id="textContent"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isOverLimit ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  rows={8}
                  placeholder="What's on your mind? Start typing and hit 'Make it Viral' to let AI supercharge your post..."
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

              {/* AI Rewrite Results */}
              {showAIPanel && aiResult && (
                <div className="border border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      AI-Optimized Version
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Viral Score:</span>
                      <span
                        className={`text-lg font-bold ${
                          aiResult.viralScore >= 70
                            ? 'text-green-600'
                            : aiResult.viralScore >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {aiResult.viralScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Main viral version */}
                  <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
                    <p className="text-gray-800 whitespace-pre-wrap text-sm">{aiResult.viralVersion}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => applyAIVersion(aiResult.viralVersion)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Use This Version
                      </button>
                      <button
                        onClick={() => copyToClipboard(aiResult.viralVersion, 'main')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {copiedPlatform === 'main' ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedPlatform === 'main' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Platform-specific versions */}
                  {aiResult.platformVersions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Platform-Specific Versions
                      </h4>
                      <div className="space-y-2">
                        {aiResult.platformVersions.map((pv) => (
                          <div key={pv.platform} className="bg-white rounded-lg p-3 border border-purple-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-purple-700 uppercase">{pv.platform}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{pv.characterCount} chars</span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    pv.estimatedEngagement === 'viral'
                                      ? 'bg-red-100 text-red-700'
                                      : pv.estimatedEngagement === 'high'
                                        ? 'bg-green-100 text-green-700'
                                        : pv.estimatedEngagement === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {pv.estimatedEngagement}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{pv.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => applyAIVersion(pv.content)}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Use this
                              </button>
                              <button
                                onClick={() => copyToClipboard(pv.content, pv.platform)}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              >
                                {copiedPlatform === pv.platform ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                {copiedPlatform === pv.platform ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alternative hooks */}
                  {aiResult.hooks.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        Alternative Hooks (first lines)
                      </h4>
                      <div className="space-y-1">
                        {aiResult.hooks.map((hook, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const lines = textContent.split('\n');
                              lines[0] = hook;
                              setTextContent(lines.join('\n'));
                            }}
                            className="block w-full text-left text-sm text-gray-700 px-3 py-2 bg-white rounded-lg border border-purple-100 hover:border-purple-300 transition-colors"
                          >
                            &ldquo;{hook}&rdquo;
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Hashtags */}
                  {aiResult.hashtags.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-purple-800 mb-2">AI-Recommended Hashtags</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.hashtags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => applyTrendingHashtag(tag)}
                            className="text-xs px-2 py-1 bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-100 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engagement prediction */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Likes', data: aiResult.engagementPrediction.estimatedLikes, color: 'text-pink-600' },
                      { label: 'Shares', data: aiResult.engagementPrediction.estimatedShares, color: 'text-blue-600' },
                      {
                        label: 'Comments',
                        data: aiResult.engagementPrediction.estimatedComments,
                        color: 'text-green-600',
                      },
                      { label: 'Reach', data: aiResult.engagementPrediction.estimatedReach, color: 'text-purple-600' },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-white rounded-lg p-2 text-center border border-purple-100">
                        <p className="text-xs text-gray-500">{metric.label}</p>
                        <p className={`text-sm font-bold ${metric.color}`}>
                          {metric.data.min.toLocaleString()}-{metric.data.max.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags (optional)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Platforms *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Schedule</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="schedule"
                      value="now"
                      checked={scheduleType === 'now'}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="w-4 h-4 text-blue-600"
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
                      className="w-4 h-4 text-blue-600"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  disabled={isPosting}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPosting || !textContent.trim() || selectedPlatforms.length === 0 || isOverLimit}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

        {/* ── Right Sidebar (1/3 width) ─────────────────────────────── */}
        <div className="space-y-6">
          {/* Viral Score Card */}
          {viralAnalysis && textContent.length >= 20 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Viral Score
                </h3>
                <button onClick={() => setShowSuggestions(!showSuggestions)} className="text-xs text-blue-600 hover:text-blue-700">
                  {showSuggestions ? 'Hide' : 'Show'} Tips
                </button>
              </div>

              <div className="text-center mb-4">
                <span
                  className={`text-5xl font-bold ${
                    viralAnalysis.score >= 70
                      ? 'text-green-600'
                      : viralAnalysis.score >= 50
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {viralAnalysis.score}
                </span>
                <span className="text-gray-400 text-xl">/100</span>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      viralAnalysis.score >= 70
                        ? 'bg-green-500'
                        : viralAnalysis.score >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${viralAnalysis.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick metrics */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Est. Reach</p>
                  <p className="text-sm font-semibold">
                    {viralAnalysis.engagementPrediction.reach.min.toLocaleString()}-
                    {viralAnalysis.engagementPrediction.reach.max.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Est. Likes</p>
                  <p className="text-sm font-semibold">
                    {viralAnalysis.engagementPrediction.likes.min.toLocaleString()}-
                    {viralAnalysis.engagementPrediction.likes.max.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              {showSuggestions && viralAnalysis.suggestions.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <h4 className="font-medium text-yellow-800 mb-2 text-xs flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    Tips to Improve
                  </h4>
                  <ul className="space-y-1">
                    {viralAnalysis.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-yellow-700 flex items-start gap-1">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick actions */}
              <div className="space-y-2">
                {viralAnalysis.optimizedContent !== textContent && (
                  <button
                    onClick={applyOptimization}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Apply Basic Optimization
                  </button>
                )}
                {viralAnalysis.recommendedHashtags.length > 0 && (
                  <button
                    onClick={applyHashtags}
                    className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Hash className="w-3 h-3" />
                    Add Hashtags
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Analyzing indicator */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing viral potential...
            </div>
          )}

          {/* Trending Topics Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Trending Now
              </h3>
              <button
                onClick={loadTrends}
                disabled={isLoadingTrends}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {isLoadingTrends ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                {showTrends ? 'Refresh' : 'Load Trends'}
              </button>
            </div>

            {showTrends && trends.length > 0 ? (
              <>
                <div className="space-y-2 mb-4">
                  {trends.map((trend, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">{trend.keyword}</p>
                        <p className="text-xs text-gray-500">{(trend.mentionCount ?? 0).toLocaleString()} mentions</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={`w-3 h-3 ${(trend.growthRate ?? 0) > 50 ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${(trend.growthRate ?? 0) > 50 ? 'text-green-600' : 'text-gray-500'}`}>
                          +{trend.growthRate ?? 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trending hashtags */}
                {trendingHashtags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Tap to add:</p>
                    <div className="flex flex-wrap gap-1">
                      {trendingHashtags.slice(0, 8).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => applyTrendingHashtag(tag)}
                          className="text-xs px-2 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full hover:bg-orange-100 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : showTrends && isLoadingTrends ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                Click &ldquo;Load Trends&rdquo; to discover what&apos;s trending right now
              </p>
            )}
          </div>

          {/* Preview */}
          {textContent && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Preview
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="whitespace-pre-wrap text-sm text-gray-800">{textContent}</p>
                {hashtags && <p className="mt-2 text-sm text-blue-600">{hashtags}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
