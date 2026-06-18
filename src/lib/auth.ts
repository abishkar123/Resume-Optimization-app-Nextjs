import { getAuth } from './firebase';
import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function verifyFirebaseToken(token: string): Promise<string | null> {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getUserIdFromRequest(): Promise<string | null> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  return verifyFirebaseToken(token);
}

// For use in Route Handlers — verifies the Bearer token directly from NextRequest
// instead of trusting the x-user-id header set by middleware (defense in depth).
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyFirebaseToken(token);
}

export function createAuthError(message: string) {
  return {
    status: 401,
    error: message,
  };
}

export function createValidationError(message: string) {
  return {
    status: 400,
    error: message,
  };
}

export function createServerError(message: string) {
  return {
    status: 500,
    error: message,
  };
}
