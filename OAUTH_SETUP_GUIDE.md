# OAuth Setup Guide for Social Media Platforms

This guide will walk you through setting up OAuth applications for each social media platform supported by GoViral.

## Prerequisites

- A deployed application with HTTPS (required for OAuth callbacks)
- Access to developer portals for each platform
- Environment variables configured in `.env.local`

## Platform Setup Instructions

### 1. Instagram (Facebook/Meta)

Instagram uses the Facebook Graph API. You'll need to create a Facebook App.

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Instagram Basic Display" product to your app
4. Configure OAuth redirect URIs:
   - Add: `https://yourdomain.com/api/auth/instagram`
5. Get your credentials:
   - **Client ID**: Found in App Settings → Basic
   - **Client Secret**: Found in App Settings → Basic

**Environment Variables:**
```env
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
```

**Required Permissions:**
- `user_profile`
- `user_media`

**Notes:**
- Instagram Basic Display API only works with personal accounts
- For business accounts, use Facebook Pages OAuth with Instagram integration
- Follower count requires Instagram Business Account

---

### 2. Facebook Pages

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app (select "Business" type)
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs:
   - Add: `https://yourdomain.com/api/auth/facebook`
5. Get your credentials from App Settings → Basic

**Environment Variables:**
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

**Required Permissions:**
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`

**Notes:**
- Users must have a Facebook Page to connect
- The app will select the first available page
- To get more pages, request advanced access in App Review

---

### 3. Twitter/X

**Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Enable OAuth 2.0
4. Add callback URL:
   - Add: `https://yourdomain.com/api/auth/twitter`
5. Get your OAuth 2.0 credentials

**Environment Variables:**
```env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
```

**Required Scopes:**
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

**Notes:**
- Requires Twitter API v2 access
- Free tier has limited requests
- Elevated access required for posting

---

### 4. LinkedIn

**Steps:**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add OAuth redirect URLs:
   - Add: `https://yourdomain.com/api/auth/linkedin`
4. Request the following products:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn"
5. Get your credentials from Auth tab

**Environment Variables:**
```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

**Required Scopes:**
- `openid`
- `profile`
- `email`
- `w_member_social`

**Notes:**
- Follower counts require organization page access
- Personal profiles have limited API access
- Posting to company pages requires additional permissions

---

### 5. YouTube (Google)

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (OAuth client ID)
5. Configure authorized redirect URIs:
   - Add: `https://yourdomain.com/api/auth/youtube`
6. Get your Client ID and Client Secret

**Environment Variables:**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Required Scopes:**
- `https://www.googleapis.com/auth/youtube`
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/userinfo.profile`

**Notes:**
- Free quota: 10,000 units/day
- Uploading videos costs 1,600 units each
- User must have a YouTube channel

---

### 6. TikTok

**Steps:**
1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Create a new app
3. Add "Login Kit" capability
4. Configure redirect URL:
   - Add: `https://yourdomain.com/api/auth/tiktok`
5. Get your Client Key and Client Secret

**Environment Variables:**
```env
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

**Required Scopes:**
- `user.info.basic`
- `video.list`
- `video.upload`

**Notes:**
- Business account required for follower counts
- Video upload has file size limits
- API is still in beta for many features

---

## Testing OAuth Flows

### Local Development

For local development, you'll need to:

1. Use a tunneling service like ngrok:
   ```bash
   ngrok http 3000
   ```

2. Update your OAuth callback URLs to use the ngrok URL:
   ```
   https://your-ngrok-url.ngrok.io/api/auth/[platform]
   ```

3. Update your `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
   ```

### Production

1. Deploy your application to Vercel/other hosting
2. Update all OAuth callback URLs to use your production domain
3. Update environment variables in production

---

## Common Issues

### "Redirect URI mismatch"
- Ensure your callback URLs match exactly in the platform's developer portal
- Check for trailing slashes
- Ensure HTTPS is used (HTTP only works for localhost)

### "Invalid client credentials"
- Double-check your Client ID and Client Secret
- Ensure environment variables are set correctly
- Restart your development server after updating .env files

### "Insufficient permissions"
- Request additional scopes/permissions in the developer portal
- Some permissions require app review/approval
- Check platform-specific requirements

### Token expiration
- Implement token refresh logic (already included for most platforms)
- Store refresh tokens securely
- Handle token expiration errors gracefully

---

## Security Best Practices

1. **Never commit credentials**:
   - Keep `.env.local` in `.gitignore`
   - Use environment variables in production

2. **Use HTTPS**:
   - Always use HTTPS in production
   - OAuth providers reject HTTP callbacks (except localhost)

3. **Validate redirect URIs**:
   - Only whitelist your actual domains
   - Don't use wildcards in production

4. **Store tokens securely**:
   - Tokens are encrypted in the database
   - Never expose access tokens to the client

5. **Implement rate limiting**:
   - Respect platform API rate limits
   - Cache data where possible
   - Use the sync endpoint to refresh data periodically

---

## Support

For platform-specific issues, refer to their official documentation:

- [Facebook for Developers](https://developers.facebook.com/docs)
- [Twitter Developer Docs](https://developer.twitter.com/en/docs)
- [LinkedIn API Docs](https://learn.microsoft.com/en-us/linkedin/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [TikTok for Developers](https://developers.tiktok.com/doc)
- [Instagram API](https://developers.facebook.com/docs/instagram)

---

## Next Steps

After setting up OAuth:

1. Test each platform connection in your dashboard
2. Verify follower/post counts are syncing correctly
3. Test the "Sync" button to refresh data
4. Set up webhooks for real-time updates (optional)
5. Monitor API usage and quotas
