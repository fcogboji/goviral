# Free Trial Payment Flow - Implementation Summary

## Problem
When users signed up or clicked "Free Trial," they were not asked to enter their card details. This meant there was no way to automatically charge them after the 7-day trial period ended.

## Solution
Implemented a complete trial payment flow that:
1. Collects card details upfront (authorizes ₦1 to save the card)
2. Stores the payment authorization code securely
3. Automatically charges the card when the trial ends

---

## Changes Made

### 1. **Updated Trial Signup Page** (`src/app/trial-signup/page.tsx`)
- Changed from calling `/api/subscriptions/create` to `/api/trial/start-with-card`
- Now redirects users to Paystack payment page to authorize their card
- Users enter card details before trial starts

### 2. **Created Trial Callback Page** (`src/app/payment/trial-callback/page.tsx`)
- New page that handles the Paystack redirect after card authorization
- Verifies the payment and displays success/error messages
- Shows trial details and next billing date
- Automatically redirects to dashboard after success

### 3. **Updated Payment Verification** (`src/app/api/payment/verify/route.ts`)
- Enhanced to detect trial payments vs. regular payments
- Extracts and stores authorization code from Paystack
- Saves card details (last 4 digits, brand, expiry)
- Creates trial subscription with 7-day trial period
- Sets next billing date to 7 days from activation

### 4. **Updated Pricing Page** (`src/app/pricing/page.tsx`)
- Changed all "Start Free Trial" buttons to redirect to `/trial-signup` instead of `/signup`
- Ensures consistent user flow from pricing page

### 5. **Existing Cron Job** (`src/app/api/cron/process-trials/route.ts`)
- Already exists and configured in `vercel.json`
- Runs daily at 1:00 AM (UTC)
- Automatically charges users when their 7-day trial ends
- Updates subscription status to "active" on successful payment
- Marks as "past_due" if payment fails
- Sends notifications to users about payment status

---

## How It Works

### Trial Signup Flow:
```
1. User visits pricing page → clicks "Start Free Trial"
2. Redirected to /trial-signup → selects plan
3. User signs in with Clerk (if not already signed in)
4. Clicks "Start Free Trial" button
5. Backend calls Paystack to initialize ₦1 authorization
6. User redirected to Paystack payment page
7. User enters card details → Paystack authorizes card
8. Paystack redirects to /payment/trial-callback
9. Backend verifies payment and saves authorization code
10. Trial subscription created (7 days, status: "trial")
11. User redirected to dashboard
```

### Automatic Billing Flow:
```
1. Cron job runs daily at 1:00 AM
2. Finds all trials where trialEndsAt <= now
3. For each expired trial:
   - Charges saved card using authorization code
   - On success: Updates status to "active", sets next billing date
   - On failure: Updates status to "past_due", notifies user
4. Creates payment record for all charges
```

---

## Environment Variables Required

Add this to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # Your Paystack secret key
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx   # Your Paystack public key

# App URL for callbacks
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # Or http://localhost:3000 for development

# Cron Job Security
CRON_SECRET=your-random-secret-string-here  # Generate a random string for cron job authentication
```

### Generating CRON_SECRET:
```bash
# Run this command to generate a secure random string:
openssl rand -base64 32
```

---

## Database Fields Used

The following fields in the `Subscription` model store payment information:

- `paystackAuthCode` - Authorization code for recurring charges
- `cardLast4` - Last 4 digits of card (for display)
- `cardBrand` - Card brand (Visa, Mastercard, etc.)
- `cardExpMonth` - Card expiry month
- `cardExpYear` - Card expiry year
- `trialEndsAt` - When the trial period ends
- `nextBillingDate` - Next billing date
- `status` - Subscription status (trial, active, past_due, cancelled)

---

## Testing the Implementation

### Local Testing:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the trial signup flow:**
   - Go to `/pricing`
   - Click "Start Free Trial"
   - Sign up/sign in
   - Select a plan
   - Click "Start Free Trial"
   - You'll be redirected to Paystack
   - Use Paystack test card: `4084084084084081`
   - Complete the authorization
   - Verify you're redirected to the callback page
   - Check that trial is created in database

3. **Test the cron job manually:**
   ```bash
   # Generate your CRON_SECRET first
   export CRON_SECRET=$(openssl rand -base64 32)

   # Call the cron endpoint
   curl -X GET http://localhost:3000/api/cron/process-trials \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

### Production Testing:

1. **Deploy to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Test with real Paystack account (or test mode)**
4. **Cron job will run automatically at 1:00 AM daily**

---

## Paystack Test Cards

For testing in Paystack test mode:

| Card Number         | Scenario        |
|---------------------|-----------------|
| 4084084084084081    | Successful auth |
| 5060666666666666666 | Successful auth |
| 507850785078507812  | Failed auth     |

---

## Monitoring

### Check Trial Status:
```sql
-- Find all active trials
SELECT
  u.email,
  s.planType,
  s.status,
  s.trialEndsAt,
  s.nextBillingDate,
  s.cardLast4
FROM subscriptions s
JOIN users u ON s.userId = u.id
WHERE s.status = 'trial';
```

### Check Failed Payments:
```sql
-- Find subscriptions with past_due status
SELECT
  u.email,
  s.planType,
  s.status,
  s.trialEndsAt
FROM subscriptions s
JOIN users u ON s.userId = u.id
WHERE s.status = 'past_due';
```

---

## Important Notes

1. **Card Authorization Amount**: The system charges ₦1 (100 kobo) to authorize the card. This is not refunded but ensures the card is valid.

2. **Trial Duration**: Currently set to 7 days. Can be modified in `/api/payment/verify/route.ts` (line 65).

3. **Cron Job Schedule**: Runs daily at 1:00 AM UTC. Configured in `vercel.json`.

4. **Security**: The cron endpoint requires a Bearer token (CRON_SECRET) to prevent unauthorized access.

5. **Notifications**: Users are notified via in-app notifications when:
   - Payment is successful
   - Payment fails

6. **Failed Payments**: If a payment fails, the subscription is marked as "past_due" and the user is notified. They can update their payment method in settings.

---

## Next Steps (Optional Enhancements)

1. **Email Notifications**: Add email notifications for trial ending reminders and payment confirmations
2. **Retry Logic**: Implement automatic retry for failed payments (e.g., retry after 3 days)
3. **Grace Period**: Add a grace period before downgrading past_due subscriptions
4. **Payment Method Update**: Add UI for users to update their payment method
5. **Cancellation Flow**: Add UI for users to cancel before trial ends
6. **Analytics**: Track trial conversion rates and payment success rates

---

## Support

If you encounter any issues:

1. Check Vercel logs for cron job execution
2. Check Paystack dashboard for payment attempts
3. Check database for subscription status
4. Verify all environment variables are set correctly
5. Ensure CRON_SECRET is configured in Vercel

---

## Summary

The free trial flow now:
✅ Collects card details before trial starts
✅ Authorizes ₦1 to verify card is valid
✅ Saves authorization code for future charges
✅ Automatically charges after 7 days
✅ Handles payment failures gracefully
✅ Notifies users of payment status
✅ Works with Paystack payment gateway
✅ Runs automated billing via cron job
