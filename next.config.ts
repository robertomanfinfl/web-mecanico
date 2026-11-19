import type { NextConfig } from "next";

const config: NextConfig = {
  agentRules: false,
  devIndicators: false,
  experimental: { serverActions: { bodySizeLimit: "22mb" } },
};

export default config;
