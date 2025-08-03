/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow SVG images to be processed
    dangerouslyAllowSVG: true,
    // Optional: Add content security policy for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // If you're using external domains, add them here
    // domains: ['example.com'],
  },
  // Other config options...
};

module.exports = nextConfig;