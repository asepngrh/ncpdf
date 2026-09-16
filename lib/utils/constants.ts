// Global size limits and constants for ncpdf

export const MAX_FILE_SIZE_CLIENT = 50 * 1024 * 1024; // 50 MB for browser client-side operations
export const MAX_FILE_SIZE_SERVER = 20 * 1024 * 1024; // 20 MB for server-assisted conversions (Gotenberg)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images/watermarks/signatures

export const RATE_LIMIT_REQUESTS_PER_MINUTE = 15;
