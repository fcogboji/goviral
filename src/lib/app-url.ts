/**
 * Get the app's base URL for redirects (Stripe, OAuth, etc.)
 * On Vercel: uses VERCEL_URL when NEXT_PUBLIC_APP_URL is not set
 */
export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
