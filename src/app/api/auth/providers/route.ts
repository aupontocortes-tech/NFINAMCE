import { NextResponse } from 'next/server';

/**
 * Indica quais provedores de login social estão configurados (Google, Facebook, Twitter).
 * A página de login usa isso para mostrar só os botões que funcionam e evitar "Server error".
 */
export async function GET() {
  return NextResponse.json({
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: !!(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
    twitter: !!(process.env.AUTH_TWITTER_ID && process.env.AUTH_TWITTER_SECRET),
  });
}
