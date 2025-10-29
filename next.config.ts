import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Adjust this value as needed
    },
  }
};

export default nextConfig;
