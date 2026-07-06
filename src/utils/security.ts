// Secure client/server input sanitization, validation, and vulnerability detection tools
import { SecurityAuditLog } from '../types';

/**
 * Sanitizes HTML to protect against Cross-Site Scripting (XSS).
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether a file name is safe and does not contain Path Traversal elements.
 */
export function isSafeFileName(fileName: string): boolean {
  if (!fileName) return false;
  // Prevent directory traversal (e.g., ../, ..\, /)
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }
  // Check for safe characters only (letters, numbers, underscores, dashes, dots)
  const safeRegex = /^[a-zA-Z0-9_\-\.]+$/;
  return safeRegex.test(fileName);
}

/**
 * Validates and limits uploaded file types.
 */
export function validateUploadedFile(
  fileName: string,
  fileSize: number,
  allowedExtensions: string[] = ['pdf', 'docx', 'pptx', 'xlsx', 'csv', 'txt', 'md', 'png', 'jpg', 'jpeg', 'zip'],
  maxSizeMB: number = 20
): { isValid: boolean; error?: string } {
  if (!isSafeFileName(fileName)) {
    return { isValid: false, error: 'Suspicious or invalid file name detected' };
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    return { isValid: false, error: `File type .${ext || 'unknown'} is not allowed. Allowed types: ${allowedExtensions.join(', ')}` };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (fileSize > maxBytes) {
    return { isValid: false, error: `File size exceeds the limit of ${maxSizeMB}MB` };
  }

  return { isValid: true };
}

/**
 * Threat scanner to audit incoming inputs for injection payloads
 */
export function detectSecurityThreat(input: string): { hasThreat: boolean; details?: string; threatType?: string } {
  if (!input) return { hasThreat: false };

  // 1. SQL Injection Signatures
  const sqlSignatures = [
    /UNION\s+SELECT/i,
    /OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i,
    /['"]\s*OR\s*['"]/i,
    /SELECT\s+.*\s+FROM/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /delete\s+from/i,
    /--/
  ];

  for (const regex of sqlSignatures) {
    if (regex.test(input)) {
      return { hasThreat: true, threatType: 'SQL Injection', details: `Payload matched regex: ${regex.toString()}` };
    }
  }

  // 2. XSS Signatures
  const xssSignatures = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /alert\(/i,
    /document\.cookie/i,
    /eval\(/i
  ];

  for (const regex of xssSignatures) {
    if (regex.test(input)) {
      return { hasThreat: true, threatType: 'Cross-Site Scripting (XSS)', details: `Payload matched regex: ${regex.toString()}` };
    }
  }

  // 3. Path Traversal & File Inclusion
  const pathTraversalSignatures = [
    /\.\.\//,
    /\.\.\\/,
    /\/etc\/passwd/i,
    /c:\\windows/i,
    /boot\.ini/i
  ];

  for (const regex of pathTraversalSignatures) {
    if (regex.test(input)) {
      return { hasThreat: true, threatType: 'Path Traversal / File Inclusion', details: `Payload matched regex: ${regex.toString()}` };
    }
  }

  // 4. Command Injection & RCE
  const rceSignatures = [
    /;\s*rm\s+-rf/i,
    /;\s*cat\s+/i,
    /;\s*sh\s+/i,
    /;\s*bash\s+/i,
    /\|\s*bash/i,
    /&&\s*/,
    /`.*`/
  ];

  for (const regex of rceSignatures) {
    if (regex.test(input)) {
      return { hasThreat: true, threatType: 'Remote Code Execution / Command Injection', details: `Payload matched regex: ${regex.toString()}` };
    }
  }

  return { hasThreat: false };
}

/**
 * Validates and sanitizes a URL to prevent Server-Side Request Forgery (SSRF).
 */
export function isSafeUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    // Prevent SSRF to local interfaces / private IPs
    const unsafeHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '169.254.169.254', // AWS metadata endpoint
      'metadata.google.internal' // GCP metadata endpoint
    ];

    if (unsafeHosts.includes(host)) {
      return false;
    }

    // Block private IP ranges (10.x, 172.16.x - 172.31.x, 192.168.x)
    const privateIpRegex = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)$/;
    if (privateIpRegex.test(host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Generate standard Security Audit log entry helper
 */
export function createAuditLog(action: string, ip: string, status: 'SUCCESS' | 'WARNING' | 'BLOCKED', details: string): SecurityAuditLog {
  return {
    id: `audit-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    action,
    ip,
    status,
    details
  };
}
