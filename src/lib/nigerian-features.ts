// Nigerian-focused features for GoViral

/**
 * Nigerian trending hashtags by category
 */
export const NIGERIAN_TRENDING_HASHTAGS = {
  business: [
    '#NaijaEntrepreneur',
    '#NigeriaBusiness',
    '#LagosBusiness',
    '#MadeInNigeria',
    '#NaijaMarket',
    '#NigerianBusinesses',
    '#SupportNaijaBusinesses',
  ],
  entertainment: [
    '#Naija',
    '#NigeriaEntertainment',
    '#AfroBeats',
    '#Nollywood',
    '#NaijaMusic',
    '#LagosCityVibes',
    '#NigeriaToTheWorld',
    '#DettyDecember',
  ],
  lifestyle: [
    '#NaijaLifestyle',
    '#LagosBabes',
    '#LagosLife',
    '#AbujaLife',
    '#NigerianWedding',
    '#JollofRice',
    '#NaijaFashion',
    '#BellaNaija',
  ],
  tech: [
    '#NaijaTech',
    '#TechInNigeria',
    '#NigerianStartup',
    '#LagosTech',
    '#NaijaInnovation',
    '#TechLagos',
  ],
  finance: [
    '#NaijaFinance',
    '#InvestInNigeria',
    '#NigerianYouth',
    '#FinancialFreedom',
    '#NairaInvestment',
    '#CryptoNaija',
  ],
};

/**
 * Get suggested hashtags based on content
 */
export function getSuggestedHashtags(content: string, category?: string): string[] {
  const suggestions: string[] = [];

  // If category provided, use those hashtags
  if (category && category in NIGERIAN_TRENDING_HASHTAGS) {
    const categoryTags = NIGERIAN_TRENDING_HASHTAGS[category as keyof typeof NIGERIAN_TRENDING_HASHTAGS];
    suggestions.push(...categoryTags.slice(0, 5));
    return suggestions;
  }

  // Auto-detect category from content
  const lowerContent = content.toLowerCase();

  if (lowerContent.match(/business|entrepreneur|market|sell|buy|shop/)) {
    suggestions.push(...NIGERIAN_TRENDING_HASHTAGS.business.slice(0, 3));
  }

  if (lowerContent.match(/music|entertainment|movie|film|celebrity|artist/)) {
    suggestions.push(...NIGERIAN_TRENDING_HASHTAGS.entertainment.slice(0, 3));
  }

  if (lowerContent.match(/tech|startup|software|app|digital|innovation/)) {
    suggestions.push(...NIGERIAN_TRENDING_HASHTAGS.tech.slice(0, 3));
  }

  if (lowerContent.match(/fashion|style|lifestyle|wedding|food|jollof/)) {
    suggestions.push(...NIGERIAN_TRENDING_HASHTAGS.lifestyle.slice(0, 3));
  }

  if (lowerContent.match(/money|invest|finance|crypto|naira|payment/)) {
    suggestions.push(...NIGERIAN_TRENDING_HASHTAGS.finance.slice(0, 3));
  }

  // Default to general Nigerian hashtags
  if (suggestions.length === 0) {
    suggestions.push('#Naija', '#Nigeria', '#NigeriaToTheWorld');
  }

  return [...new Set(suggestions)]; // Remove duplicates
}

/**
 * Nigerian public holidays for content calendar
 */
export const NIGERIAN_HOLIDAYS = [
  { date: '01-01', name: "New Year's Day" },
  { date: '04-07', name: "Good Friday" },
  { date: '04-10', name: "Easter Monday" },
  { date: '05-01', name: "Workers' Day" },
  { date: '05-29', name: "Democracy Day" },
  { date: '06-12', name: "Eid al-Adha" },
  { date: '10-01', name: "Independence Day" },
  { date: '12-25', name: "Christmas Day" },
  { date: '12-26', name: "Boxing Day" },
];

/**
 * Best posting times for Nigerian audience (West Africa Time - WAT)
 */
export const OPTIMAL_POSTING_TIMES = {
  weekday: [
    { hour: 7, minute: 0, label: '7:00 AM - Morning commute' },
    { hour: 12, minute: 0, label: '12:00 PM - Lunch break' },
    { hour: 17, minute: 0, label: '5:00 PM - Evening commute' },
    { hour: 21, minute: 0, label: '9:00 PM - Night browsing' },
  ],
  weekend: [
    { hour: 10, minute: 0, label: '10:00 AM - Late morning' },
    { hour: 14, minute: 0, label: '2:00 PM - Afternoon' },
    { hour: 20, minute: 0, label: '8:00 PM - Prime time' },
  ],
};

/**
 * Get next optimal posting time
 */
export function getNextOptimalPostingTime(isWeekend: boolean = false): Date {
  const now = new Date();
  const times = isWeekend ? OPTIMAL_POSTING_TIMES.weekend : OPTIMAL_POSTING_TIMES.weekday;

  // Convert current time to WAT (UTC+1)
  const watTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const currentHour = watTime.getHours();

  // Find next optimal time
  for (const time of times) {
    if (time.hour > currentHour) {
      const nextTime = new Date(watTime);
      nextTime.setHours(time.hour, time.minute, 0, 0);
      return nextTime;
    }
  }

  // If no time found today, return first time tomorrow
  const tomorrow = new Date(watTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(times[0].hour, times[0].minute, 0, 0);
  return tomorrow;
}

/**
 * Format Naira currency
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format phone number to Nigerian format
 */
export function formatNigerianPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 234, ensure it has +
  if (cleaned.startsWith('234')) {
    return '+' + cleaned;
  }

  // If starts with 0, replace with +234
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+234' + cleaned.substring(1);
  }

  // If 10 digits, add +234
  if (cleaned.length === 10) {
    return '+234' + cleaned;
  }

  return phone; // Return original if can't format
}

/**
 * Validate Nigerian phone number
 */
export function isValidNigerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid 11-digit Nigerian number starting with 0
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const validPrefixes = ['070', '080', '081', '090', '091', '070', '071'];
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }

  // Check if it's a valid international format
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return true;
  }

  return false;
}

/**
 * Nigerian business hours (WAT)
 */
export const NIGERIAN_BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
};

/**
 * Check if current time is within Nigerian business hours
 */
export function isNigerianBusinessHours(): boolean {
  const watTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  const hour = watTime.getHours();
  const day = watTime.getDay();

  // Check if it's a weekday (Monday-Friday)
  if (day === 0 || day === 6) return false;

  // Check if within business hours
  return hour >= NIGERIAN_BUSINESS_HOURS.start && hour < NIGERIAN_BUSINESS_HOURS.end;
}

/**
 * Nigerian states for location targeting
 */
export const NIGERIAN_STATES = [
  'Lagos',
  'Abuja',
  'Kano',
  'Ibadan',
  'Port Harcourt',
  'Benin City',
  'Kaduna',
  'Enugu',
  'Aba',
  'Ilorin',
  'Jos',
  'Warri',
  'Calabar',
  'Abeokuta',
  'Akure',
  'Owerri',
  'Uyo',
  'Maiduguri',
  'Onitsha',
  'Asaba',
];

/**
 * Major Nigerian cities for targeting
 */
export const MAJOR_CITIES = [
  'Lagos',
  'Abuja',
  'Port Harcourt',
  'Ibadan',
  'Kano',
  'Benin City',
  'Enugu',
];

/**
 * Content templates for Nigerian businesses
 */
export const CONTENT_TEMPLATES = {
  product_launch: `🚀 New Product Alert! 🇳🇬

[Product Name] is now available!

[Brief description]

✅ [Benefit 1]
✅ [Benefit 2]
✅ [Benefit 3]

📍 Available in [Location]
📞 Contact: [Phone Number]

#NaijaMarket #MadeInNigeria #SupportNaijaBusiness`,

  sale_announcement: `🔥 MEGA SALE! 🔥

Get up to [X]% OFF on [Product/Service]!

⏰ Limited time only!
📍 [Location/Online]
📞 Order now: [Phone Number]

Don't miss out! 🛍️

#NaijaBusiness #LagosMarket #NigeriaDeals`,

  customer_testimonial: `💯 Customer Love!

"[Customer Testimonial]" - [Customer Name]

Thank you for trusting us! 🙏🏾

We're committed to delivering excellence to all our Nigerian customers.

📞 [Phone Number]
📍 [Location]

#CustomerSatisfaction #NaijaBusinesses #QualityService`,

  business_update: `📢 Business Update 🇳🇬

[Your update message]

We're growing with you, Nigeria! 💪🏾

Follow us for more updates.

#NaijaEntrepreneur #BusinessGrowth #NigeriaToTheWorld`,
};

/**
 * SMS notification service (using Termii or similar Nigerian SMS gateway)
 */
export interface SMSNotification {
  to: string;
  message: string;
  senderId?: string;
}

/**
 * Send SMS notification (integrate with Termii, AfricasTalking, or similar)
 */
export async function sendSMSNotification(notification: SMSNotification): Promise<boolean> {
  // This should be integrated with a Nigerian SMS provider like:
  // - Termii (https://termii.com)
  // - Africa's Talking
  // - Bulk SMS Nigeria

  const API_KEY = process.env.SMS_API_KEY;
  const SENDER_ID = notification.senderId || 'GoViral';

  if (!API_KEY) {
    console.error('SMS API Key not configured');
    return false;
  }

  try {
    // Example using Termii API
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formatNigerianPhone(notification.to),
        from: SENDER_ID,
        sms: notification.message,
        type: 'plain',
        channel: 'generic',
        api_key: API_KEY,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
}
