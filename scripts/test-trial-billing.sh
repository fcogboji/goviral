#!/bin/bash

# Script to test the trial billing cron job locally

echo "🔍 Testing Trial Billing Cron Job"
echo "=================================="
echo ""

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
    echo "⚠️  CRON_SECRET not set. Generating a temporary one..."
    export CRON_SECRET=$(openssl rand -base64 32)
    echo "📝 CRON_SECRET: $CRON_SECRET"
    echo ""
    echo "💡 Add this to your .env file:"
    echo "CRON_SECRET=$CRON_SECRET"
    echo ""
fi

# Default to localhost:3000 if APP_URL not set
APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}

echo "🚀 Calling cron endpoint at $APP_URL/api/cron/process-trials"
echo ""

# Make the request
response=$(curl -s -w "\n%{http_code}" -X GET "$APP_URL/api/cron/process-trials" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract status code and body
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "📊 Response Status: $http_code"
echo "📄 Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ Test completed successfully!"
else
    echo "❌ Test failed with status code: $http_code"
fi

echo ""
echo "💡 Tip: Make sure your development server is running with 'npm run dev'"
