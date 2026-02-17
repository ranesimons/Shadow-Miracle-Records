import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // This 'source' is the URL TikTok will see
        source: '/tiktok-assets/:path*',
        // This 'destination' is where the file actually lives
        destination: 'https://smr.blob.core.windows.net/:path*',
      },
    ]
  },
}

module.exports = nextConfig

// const nextConfig: NextConfig = {
//   /* config options here */
//   api: {
//     bodyParser: {
//       sizeLimit: '500mb', // Adjust this value as needed
//     },
//   }
// };

// export const config = {
//   api: {
//     bodyParser: {
//       sizeLimit: '500mb',
//     }
//   }
// };

// export default nextConfig;
