import type { NextConfig } from "next";

const config: NextConfig = {
  // The SDK ships as TypeScript source; the app compiles it with its own code.
  transpilePackages: ["motion-sdk", "@motion-sdk/core"],
};

export default config;
