/**
 * Validates that a string is a properly formatted email address.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates that a password meets minimum security requirements (at least 8 characters).
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Validates that resume text is non-empty and within a reasonable length (max 50,000 characters).
 */
export function validateResumeText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 50_000;
}

/**
 * Validates that a file size in bytes does not exceed a maximum size in megabytes.
 * Defaults to a 10 MB maximum if no limit is specified.
 */
export function validateFileSize(sizeBytes: number, maxMB: number = 10): boolean {
  const maxBytes = maxMB * 1024 * 1024;
  return sizeBytes > 0 && sizeBytes <= maxBytes;
}

/**
 * Validates that a MIME type is an accepted resume file format (PDF or DOCX).
 */
export function validateMimeType(mimeType: string): boolean {
  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  return acceptedTypes.includes(mimeType);
}
