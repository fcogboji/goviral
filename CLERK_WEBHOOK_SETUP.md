# Clerk Webhook Setup Guide

This guide will help you configure Clerk webhooks to sync user data to your database.

## Problem

When users sign up via Clerk, their data is stored in Clerk's servers but not automatically synced to your PostgreSQL database. This causes the admin panel to show 0 users even though users can log in successfully.

## Solution

Set up a webhook that automatically syncs Clerk user events (create, update, delete) to your database.

---

## Step 1: Sync Existing Users

First, import any users that already signed up:

```bash
npm run sync-users
```

This will fetch all existing Clerk users and create records in your database.

---

## Step 2: Configure Webhook in Clerk Dashboard

### 2.1 Get Your Webhook URL

Your webhook endpoint is:
- **Local development**: `http://localhost:3000/api/webhooks/clerk`
- **Production**: `https://yourdomain.com/api/webhooks/clerk`

For local development, you'll need to expose your localhost using a tunnel service like:
- [ngrok](https://ngrok.com/): `ngrok http 3000`
- [Clerk's built-in tunneling](https://clerk.com/docs/integrations/webhooks/sync-data#testing-webhooks-locally)

### 2.2 Create Webhook in Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **+ Add Endpoint**
5. Enter your webhook URL (e.g., `https://your-ngrok-url.ngrok.io/api/webhooks/clerk`)
6. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click **Create**

### 2.3 Get the Signing Secret

After creating the webhook:

1. Click on the webhook endpoint you just created
2. Click **Signing Secret** tab
3. Copy the signing secret (starts with `whsec_...`)
4. Add it to your `.env.local` file:

```bash
CLERK_WEBHOOK_SECRET=whsec_your_secret_here
```

5. Restart your development server:

```bash
npm run dev
```

---

## Step 3: Test the Webhook

### Option 1: Create a New User

1. Sign up with a new email address
2. Check your terminal logs for webhook confirmation
3. Check the admin panel - the new user should appear

### Option 2: Use Clerk's Test Feature

1. In Clerk Dashboard, go to your webhook endpoint
2. Click **Testing** tab
3. Send a test `user.created` event
4. Check terminal logs for success

---

## Verification

### Check Database

```bash
# Connect to your database
psql $DATABASE_URL

# Check users
SELECT id, email, "firstName", "lastName", "clerkId", "createdAt" FROM users;
```

### Check Logs

Successful webhook processing will show:
```
✅ Webhook verified: user.created user_xxxxx
Creating user: user_xxxxx
✅ User created/updated successfully: user_xxxxx
```

Failed webhook will show:
```
❌ Webhook verification failed: ...
```

---

## Troubleshooting

### Issue: "Missing svix headers"

**Cause**: Webhook request is not coming from Clerk or headers are missing.

**Solution**: Make sure you're using the correct webhook URL in Clerk dashboard.

---

### Issue: "Webhook verification failed"

**Cause**: `CLERK_WEBHOOK_SECRET` is incorrect or not set.

**Solution**:
1. Double-check the secret in Clerk dashboard
2. Make sure it's set in `.env.local`
3. Restart your dev server

---

### Issue: Users still not showing in admin panel

**Cause**: Old users weren't synced, or webhook isn't configured.

**Solution**:
1. Run `npm run sync-users` to sync existing users
2. Verify webhook is configured in Clerk dashboard
3. Test with a new signup

---

### Issue: Local webhook not receiving events

**Cause**: Localhost is not accessible from Clerk's servers.

**Solution**:
1. Use ngrok or similar: `ngrok http 3000`
2. Update webhook URL in Clerk dashboard with ngrok URL
3. For production, use your actual domain

---

## Production Deployment

For production (Vercel/Railway/etc):

1. Set the webhook URL to your production domain:
   ```
   https://yourdomain.com/api/webhooks/clerk
   ```

2. Add `CLERK_WEBHOOK_SECRET` to your production environment variables

3. Deploy and test with a new signup

---

## Security Notes

- The webhook now verifies Clerk's signature using the `svix` library
- Only requests with valid signatures are processed
- Keep your `CLERK_WEBHOOK_SECRET` private and never commit it to Git

---

## Need Help?

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks/overview)
- [Clerk Sync Data Guide](https://clerk.com/docs/integrations/webhooks/sync-data)
