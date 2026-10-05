import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    // The site used to sit behind a password page here.
    return [{ source: "/coming-soon", destination: "/", permanent: false }];
  },
};

export default nextConfig;
