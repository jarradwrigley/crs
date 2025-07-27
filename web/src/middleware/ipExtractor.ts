// src/middleware/ipExtractor.ts

import { NextRequest } from "next/server";

/**
 * Extract client IP address from request headers
 */
export function extractClientIP(request: NextRequest): string {
  // Try different headers in order of preference
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "true-client-ip", // Cloudflare Enterprise
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      const ip = value.split(",")[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Try to get from client-sent headers
  const clientIP =
    request.headers.get("x-client-ip") || request.headers.get("x-real-ip");

  if (clientIP && isValidIP(clientIP)) {
    return clientIP;
  }

  // Fallback to 'unknown' if no valid IP found
  return "unknown";
}

/**
 * Validate IP address format
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Middleware to add IP to request context
 */
export async function withClientIP<T>(
  request: NextRequest,
  handler: (request: NextRequest & { clientIP: string }) => Promise<T>
): Promise<T> {
  const clientIP = extractClientIP(request);

  // Add IP to request object
  (request as any).clientIP = clientIP;

  return handler(request as NextRequest & { clientIP: string });
}

/**
 * Extract IP from FormData or JSON body
 */
export async function extractIPFromBody(
  request: NextRequest
): Promise<string | null> {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const clientIP = formData.get("clientIP");
      return clientIP ? String(clientIP) : null;
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      return body.clientIP || null;
    }
  } catch (error) {
    console.warn("Failed to extract IP from request body:", error);
  }

  return null;
}

/**
 * Get the most reliable IP address from request
 */
export async function getBestClientIP(request: NextRequest): Promise<string> {
  // First try to get from headers
  const headerIP = extractClientIP(request);

  if (headerIP !== "unknown") {
    return headerIP;
  }

  // Then try to get from request body
  const bodyIP = await extractIPFromBody(request);

  if (bodyIP && isValidIP(bodyIP)) {
    return bodyIP;
  }

  return "unknown";
}
