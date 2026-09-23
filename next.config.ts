import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "Test-001-app-web-";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

