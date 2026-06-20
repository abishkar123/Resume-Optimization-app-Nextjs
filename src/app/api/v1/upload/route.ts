export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { getAuthenticatedUserId } from '@/lib/auth';
import { parseFormData } from '@/lib/form-parser';
import { uploadToS3 } from '@/lib/s3';
import { connectDB, Resume } from '@/lib/mongodb';
import { checkRate, RateLimitError } from '@/lib/rateLimit';
import { validateFileSize, validateMimeType } from '@/utils/validation';
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/utils/response';

const MAX_FILE_SIZE_MB = 10;

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function resolveFileType(filename: string, mimetype: string): string {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  return MIME_BY_EXT[ext] ?? mimetype;
}

async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }
  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error(`Unsupported mimetype: ${mimetype}`);
}

export async function POST(req: NextRequest): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return unauthorizedResponse('Missing user ID');

  try {
    checkRate(userId, 'upload');
  } catch (err) {
    if (err instanceof RateLimitError) {
      return errorResponse(err.message, 429);
    }
    throw err;
  }

  let files: Awaited<ReturnType<typeof parseFormData>>['files'];
  try {
    const parsed = await parseFormData(req);
    files = parsed.files;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse form data';
    return errorResponse(message, 400);
  }

  if (!files || files.length === 0) {
    return errorResponse('No file uploaded', 400);
  }

  const file = files[0];
  const resolvedMime = resolveFileType(file.filename, file.mimetype);

  if (!validateMimeType(resolvedMime)) {
    return errorResponse('Invalid file type. Only PDF and DOCX files are accepted.', 415);
  }
  if (!validateFileSize(file.buffer.length, MAX_FILE_SIZE_MB)) {
    return errorResponse(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`, 413);
  }

  const timestamp = Date.now();
  const safeFilename = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const s3Key = `resumes/${userId}/${timestamp}-${safeFilename}`;

  try {
    await uploadToS3(s3Key, file.buffer, resolvedMime);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/v1/upload] S3 upload error:', msg);
    return serverErrorResponse('Failed to upload file to storage');
  }

  let text: string;
  try {
    text = await extractText(file.buffer, resolvedMime);
  } catch (err) {
    console.error('Text extraction error:', err);
    return errorResponse('Failed to extract text from file', 422);
  }

  if (!text || !text.trim()) {
    return errorResponse('Could not extract any text from the document.', 422);
  }

  let resume: typeof Resume.prototype;
  try {
    await connectDB();
    resume = await Resume.create({
      userId,
      filename: file.filename,
      text,
      s3Key,
      uploadedAt: new Date(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[POST /api/v1/upload] MongoDB error:', msg);
    return serverErrorResponse('Failed to save resume record');
  }

  return successResponse({ resumeId: resume._id, filename: resume.filename }, 201);
}
