import { next } from '@vercel/edge';

export const config = {
  matcher: ['/checkout', '/api/make-payment'],
};

export default function middleware(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');

  if (country && country !== 'IL') {
    // Redirect to a "not available" page or return a block message
    return new Response(
      JSON.stringify({ 
        error: 'This service is only available in Israel.',
        message: 'Currently, TEAMIND pedagogical kits are only available for delivery within Israel.'
      }),
      { 
        status: 403, 
        headers: { 'content-type': 'application/json' } 
      }
    );
  }

  return next();
}
