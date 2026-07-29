const securityCheckHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

function createSecurityCheckResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: securityCheckHeaders,
  });
}

export function GET(): Response {
  return createSecurityCheckResponse();
}

export function HEAD(): Response {
  return createSecurityCheckResponse();
}
