import { next } from '@vercel/edge';

export const config = {
  matcher: ['/', '/checkout', '/parents', '/early-childhood', '/elementary', '/about'],
};

export default function middleware(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');

  if (country && country !== 'IL') {
    // We previously had a block here, but we are removing it as per user request to allow everyone.
    // However, if we want to keep the matcher working and just allow, we can simply return next()
  }

  return next();
}
