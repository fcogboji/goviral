// types/index.ts

// Platform-related types
export interface PlatformData {
  id: string;
  name: string;
  connected: boolean;
  followers?: number;
  posts?: number;
  engagement?: number;
  lastSync?: Date;
  avatar?: string;
}

// Post-related types
export interface PostData {
  id: string;
  content: string;
  platforms: string[];
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
}

// User-related types
export interface UserData {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'pro' | 'enterprise';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    postPublished: boolean;
    scheduledReminders: boolean;
  };
  defaultPlatforms: string[];
}

// Analytics types
export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    posts: number;
    reach: number;
    engagement: number;
    followers: number;
  };
  platformBreakdown: Record<string, number>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface CreatePostForm {
  content: string;
  platforms: string[];
  scheduleType: 'now' | 'later';
  scheduledTime?: string;
  mediaFiles?: File[];
}

// Notification types
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}