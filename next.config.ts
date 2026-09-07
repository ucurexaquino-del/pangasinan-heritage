import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  output: "export",

  basePath:
    process.env.NODE_ENV === "production"
      ? "/pangasinan-heritage"
      : "",

  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "/pangasinan-heritage-main/"
      : "",

  images: {
    unoptimized: true,
  },

};

export default nextConfig;
