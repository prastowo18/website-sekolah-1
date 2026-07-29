import type { NextConfig } from "next";

import {
  getSecurityHeaders,
  getSensitiveRouteHeaders,
} from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    const securityHeaders = getSecurityHeaders();

    const sensitiveRouteHeaders = getSensitiveRouteHeaders();

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/konsol-8m4q7x2k9v6d/:path*",
        headers: sensitiveRouteHeaders,
      },
      {
        source: "/login",
        headers: sensitiveRouteHeaders,
      },
      {
        source: "/ubah-password",
        headers: sensitiveRouteHeaders,
      },
      {
        source: "/api/:path*",
        headers: sensitiveRouteHeaders,
      },
    ];
  },

  /* config options here */
};

export default nextConfig;
