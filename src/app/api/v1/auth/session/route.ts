export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { errorResponse } from '@/utils/response';

const SESSION_COOKIE = 'session';
const SESSION_MAX_AGE = 60 * 60; // 1 hour — matches Firebase ID token lifetime

export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { token } = body;
  if (!token) return errorResponse('token is required');

  const uid = await verifyFirebaseToken(token);
  if (!uid) return errorResponse('Invalid token', 401);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
