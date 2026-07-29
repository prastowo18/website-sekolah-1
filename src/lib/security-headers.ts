export type SecurityHeader = {
  key: string;
  value: string;
};

function buildContentSecurityPolicy(): string {
  const isProduction = process.env.NODE_ENV === "production";

  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...(isProduction ? [] : ["'unsafe-eval'"]),
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    [
      "frame-src",
      "'self'",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
    ].join(" "),
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

export function getSecurityHeaders(): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(),
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "payment=()",
        "usb=()",
        "serial=()",
        "browsing-topics=()",
      ].join(", "),
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    },
    {
      key: "X-DNS-Prefetch-Control",
      value: "off",
    },
    {
      key: "X-Permitted-Cross-Domain-Policies",
      value: "none",
    },
    {
      key: "X-XSS-Protection",
      value: "0",
    },
    {
      key: "Origin-Agent-Cluster",
      value: "?1",
    },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000",
    });
  }

  return headers;
}

export function getSensitiveRouteHeaders(): SecurityHeader[] {
  return [
    {
      key: "Cache-Control",
      value: "private, no-store, max-age=0, must-revalidate",
    },
    {
      key: "Pragma",
      value: "no-cache",
    },
    {
      key: "Expires",
      value: "0",
    },
    {
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive, nosnippet",
    },
  ];
}
