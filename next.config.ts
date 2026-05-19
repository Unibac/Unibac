import type { NextConfig } from "next";

import { resolveApiProxyTarget } from "./src/lib/api/resolve-api-base-url";

const apiProxyTarget = resolveApiProxyTarget();

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) {
      return [];
    }
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
