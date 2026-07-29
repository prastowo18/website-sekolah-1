export const dynamic = 'force-dynamic';

const responseHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
};

function createResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: responseHeaders,
  });
}

export function GET(): Response {
  return createResponse();
}

export function HEAD(): Response {
  return createResponse();
}
