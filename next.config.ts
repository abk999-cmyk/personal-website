import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
};

export default createMDX({ options: { remarkPlugins: ["remark-gfm"] } })(nextConfig);
