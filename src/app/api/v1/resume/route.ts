export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';
import { connectDB, Resume } from '@/lib/mongodb';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from '@/utils/response';

/**
 * GET /api/resume
 * List all resumes for the authenticated user.
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  try {
    await connectDB();

    const resumes = await Resume.find({ userId }).sort({ uploadedAt: -1 }).lean();

    return successResponse(resumes);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[GET /api/resume] Error fetching resumes:', msg);
    return errorResponse('Failed to fetch resumes', 500);
  }
}

/**
 * POST /api/resume
 * Create a new resume record for the authenticated user.
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return unauthorizedResponse();
  }

  let body: { filename?: string; text?: string; s3Key?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { filename, text, s3Key } = body;

  if (!filename || !text || !s3Key) {
    return errorResponse('Missing required fields: filename, text, s3Key');
  }

  try {
    await connectDB();

    const resume = await Resume.create({ userId, filename, text, s3Key });

    return successResponse(resume, 201);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[POST /api/resume] Error creating resume:', msg);
    return errorResponse('Failed to create resume', 500);
  }
}
