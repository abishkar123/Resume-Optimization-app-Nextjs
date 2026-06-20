export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getAuthenticatedUserId } from '@/lib/auth';
import { connectDB, Resume, OptimizationResult } from '@/lib/mongodb';
import { deleteFromS3 } from '@/lib/s3';
import {
  successResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/utils/response';

// GET /api/resume/[id] - Fetch single resume + its optimization results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    await connectDB();

    const resume = await Resume.findById(id);

    if (!resume) {
      return notFoundResponse('Resume not found');
    }

    if (resume.userId !== userId) {
      return forbiddenResponse('You do not have permission to access this resume');
    }

    const optimizations = await OptimizationResult.find({ resumeId: id });

    return successResponse({ resume, optimizations });
  } catch (error) {
    console.error('GET /api/resume/[id] error:', error);
    return serverErrorResponse();
  }
}

// PUT /api/resume/[id] - Update resume metadata (filename only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    await connectDB();

    const resume = await Resume.findById(id);

    if (!resume) {
      return notFoundResponse('Resume not found');
    }

    if (resume.userId !== userId) {
      return forbiddenResponse('You do not have permission to update this resume');
    }

    const body = await request.json();

    // Only allow updating filename — prevent userId/s3Key changes
    const allowedUpdates: { filename?: string } = {};
    if (typeof body.filename === 'string') {
      allowedUpdates.filename = body.filename;
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    return successResponse({ resume: updatedResume });
  } catch (error) {
    console.error('PUT /api/resume/[id] error:', error);
    return serverErrorResponse();
  }
}

// DELETE /api/resume/[id] - Delete resume + its optimizations
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    await connectDB();

    const resume = await Resume.findById(id);

    if (!resume) {
      return notFoundResponse('Resume not found');
    }

    if (resume.userId !== userId) {
      return forbiddenResponse('You do not have permission to delete this resume');
    }

    if (resume.s3Key) {
      try {
        await deleteFromS3(resume.s3Key);
      } catch (s3Err) {
        console.error('DELETE /api/resume/[id] S3 delete failed (continuing):', s3Err);
      }
    }

    await OptimizationResult.deleteMany({ resumeId: id });
    await Resume.findByIdAndDelete(id);

    return successResponse({ message: 'Resume and associated optimizations deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/resume/[id] error:', error);
    return serverErrorResponse();
  }
}
