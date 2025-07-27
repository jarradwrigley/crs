// src/utils/ip.ts

/**
 * Get client IP address from various sources
 */
export const getClientIP = async (): Promise<string | null> => {
  try {
    // Try multiple IP services for reliability
    const ipServices = [
      "https://api.ipify.org?format=json",
      "https://ipapi.co/json/",
      "https://api.ip.sb/jsonip",
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service);
        const data = await response.json();

        // Different services return IP in different fields
        const ip = data.ip || data.query || data.clientIP;
        if (ip && isValidIP(ip)) {
          return ip;
        }
      } catch (error) {
        console.warn(`Failed to get IP from ${service}:`, error);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get client IP:", error);
    return null;
  }
};

/**
 * Validate IP address format
 */
export const isValidIP = (ip: string): boolean => {
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Get IP from server-side (Next.js API routes)
 */
export const getServerSideIP = (request: Request): string => {
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

  // Fallback to connection remote address (if available)
  return "unknown";
};

/**
 * Store IP in localStorage for client-side access
 */
export const storeClientIP = async (): Promise<string | null> => {
  try {
    const ip = await getClientIP();
    if (ip) {
      localStorage.setItem("clientIP", ip);
      return ip;
    }
  } catch (error) {
    console.error("Failed to store client IP:", error);
  }
  return null;
};

/**
 * Get stored IP from localStorage
 */
export const getStoredIP = (): string | null => {
  try {
    return localStorage.getItem("clientIP");
  } catch (error) {
    return null;
  }
};
