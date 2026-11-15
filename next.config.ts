import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Blog photos uploaded from the admin are stored in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
