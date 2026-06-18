import { NextResponse } from 'next/server';

/**
 * Returns a successful JSON response with the provided data.
 * Defaults to HTTP 200.
 */
export function successResponse(data: unknown, status: number = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Returns an error JSON response with the provided message.
 * Defaults to HTTP 400.
 */
export function errorResponse(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Returns an HTTP 401 Unauthorized response.
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

/**
 * Returns an HTTP 403 Forbidden response.
 */
export function forbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

/**
 * Returns an HTTP 404 Not Found response.
 */
export function notFoundResponse(message: string = 'Not found'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

/**
 * Returns an HTTP 500 Internal Server Error response.
 */
export function serverErrorResponse(message: string = 'Internal server error'): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
