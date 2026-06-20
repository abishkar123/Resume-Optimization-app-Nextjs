export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';
import { optimizeResume, DEFAULT_MODEL } from '@/lib/openai';
import { connectDB, Resume, OptimizationResult } from '@/lib/mongodb';
import { checkRate, RateLimitError } from '@/lib/rateLimit';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/utils/response';

/**
 * POST /api/optimize
 * Body: { resumeId: string, targetRole?: string, jobDescriptions?: string[] }
 * Returns: { optimizationId, originalText, optimizedText, targetRole, jobDescriptions }
 */
export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  try {
    checkRate(userId, 'ai');
  } catch (err) {
    if (err instanceof RateLimitError) {
      return errorResponse(err.message, 429);
    }
    throw err;
  }

  let body: {
    resumeId?: string;
    targetRole?: string;
    jobDescriptions?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { resumeId } = body;
  const targetRole = body.targetRole?.trim() || 'General Professional';
  const jobDescriptions = Array.isArray(body.jobDescriptions)
    ? body.jobDescriptions.map((s) => s.trim()).filter(Boolean)
    : [];

  if (!resumeId) {
    return errorResponse('resumeId is required');
  }

  try {
    await connectDB();

    const resume = await Resume.findById(resumeId);
    if (!resume) return notFoundResponse('Resume not found');
    if (resume.userId !== userId) {
      return forbiddenResponse('You do not have permission to optimize this resume');
    }

    const optimizedText = await optimizeResume(
      resume.text,
      targetRole,
      jobDescriptions
    );

    const record = await OptimizationResult.create({
      userId,
      resumeId: resume._id,
      originalText: resume.text,
      optimizedText,
      targetRole,
      jobDescriptions,
      model: DEFAULT_MODEL,
      createdAt: new Date(),
    });

    return successResponse({
      optimizationId: record._id,
      originalText: resume.text,
      optimizedText,
      targetRole,
      jobDescriptions,
    });
  } catch (error) {
    console.error('[POST /api/optimize] Error optimizing resume:', error);
    return serverErrorResponse('Failed to optimize resume');
  }
}
