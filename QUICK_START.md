# GoViral - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup (2 min)

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your keys (minimum required for local testing)
DATABASE_URL="your-neon-connection-string"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 2: Database Setup (2 min)

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# Seed with Nigerian pricing plans
npm run seed
```

### Step 3: Run Development Server (1 min)

```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 📱 What You Can Do Now

### 1. Sign Up
- Create account with email
- Get 7-day free trial

### 2. View Pricing
- See plans in Nigerian Naira (₦)
- Starter: ₦5,000/month
- Creator: ₦15,000/month
- Agency: ₦45,000/month

### 3. Dashboard
- View dashboard at `/dashboard`
- Create posts
- Schedule posts

---

## 🔌 Adding Social Media Connections

To actually post to social media, you'll need API credentials:

### Quick Setup (Test Mode):

1. **Facebook/Instagram** (20 min)
   - [developers.facebook.com](https://developers.facebook.com)
   - Create app → Get test page
   - See SETUP_GUIDE.md → Facebook section

2. **Twitter/X** (15 min)
   - [developer.twitter.com](https://developer.twitter.com)
   - Apply for elevated access
   - See SETUP_GUIDE.md → Twitter section

3. **WhatsApp** (30 min)
   - Use Facebook Developer account
   - Add WhatsApp product
   - See SETUP_GUIDE.md → WhatsApp section

**OR Skip for now** and test the UI/UX without real posting.

---

## 💳 Testing Payments

### Paystack Test Cards:

**Success:**
- Card: 4084084084084081
- CVV: 408
- Expiry: Any future date

**Decline:**
- Card: 5060666666666666666

---

## 🧪 Testing the App

### Without Social Media APIs:

You can still test:
- ✅ Sign up / Sign in
- ✅ View pricing plans (in Naira)
- ✅ Navigate dashboard
- ✅ Create posts
- ✅ Schedule posts
- ✅ View Nigerian hashtag suggestions
- ❌ Actual posting (needs API credentials)

### With Social Media APIs:

Once you add credentials:
- ✅ Connect platforms
- ✅ Publish to real platforms
- ✅ Schedule automated posts
- ✅ View post results

---

## 📖 Full Documentation

- **SETUP_GUIDE.md** - Complete API setup for all platforms
- **DEPLOYMENT.md** - Production deployment guide
- **IMPLEMENTATION_SUMMARY.md** - What was built

---

## 🆘 Common Issues

### "Database connection failed"
```bash
# Check your DATABASE_URL in .env.local
# Make sure it includes ?sslmode=require
```

### "Clerk authentication not working"
```bash
# Verify keys in .env.local
# Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has NEXT_PUBLIC_ prefix
```

### "Build errors"
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 🎯 Recommended Path

### Day 1: Local Setup ✅
- [x] Environment variables
- [x] Database setup
- [x] Run dev server
- [x] Explore UI

### Day 2: Social Media
- [ ] Set up Facebook API
- [ ] Test posting to Facebook
- [ ] Add Instagram connection

### Day 3: Payment
- [ ] Set up Paystack
- [ ] Test payment flow
- [ ] Verify subscriptions work

### Day 4: Polish
- [ ] Add remaining platforms
- [ ] Test scheduled posts
- [ ] Review Nigerian features

### Day 5: Deploy
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Set up custom domain

---

## 💡 Quick Tips

1. **Start with Facebook** - Easiest to set up, also gives you Instagram
2. **Use test accounts** - All platforms offer test/sandbox modes
3. **Check SETUP_GUIDE.md** - Step-by-step for each platform
4. **Test locally first** - Before deploying to production
5. **One platform at a time** - Don't try to set up all at once

---

## 🚀 Ready to Launch?

Once everything works locally:

```bash
# Commit your changes
git add .
git commit -m "Ready for production"
git push origin main

# Deploy to Vercel
vercel --prod
```

See **DEPLOYMENT.md** for complete launch checklist.

---

## 📞 Need Help?

1. Check error messages in terminal
2. Review relevant section in SETUP_GUIDE.md
3. Check Prisma Studio: `npx prisma studio`
4. Verify environment variables

---

**You're all set! Start building the best social media management tool for Nigeria! 🇳🇬**
