import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hbtgzrkeyjapzpqocpzv.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "keshali-design-943865899316-us-east-2-an.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
