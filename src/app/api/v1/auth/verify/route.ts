export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth';
import { getAuth as getAdminAuth } from '@/lib/firebase';
import { connectDB, User } from '@/lib/mongodb';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/utils/response';

/**
 * POST /api/auth/verify
 * Verify a Firebase ID token and upsert the User doc.
 * Body: { token: string }
 */
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

  try {
    const firebaseUser = await getAdminAuth().getUser(uid);

    await connectDB();
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        firebaseUid: uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
        photoURL: firebaseUser.photoURL ?? '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse({
      userId: uid,
      valid: true,
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    console.error('[POST /api/auth/verify] Failed to upsert user:', err);
    return serverErrorResponse('Failed to verify user');
  }
}
