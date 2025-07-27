// src/utils/apiClient.ts

import { getClientIP, getStoredIP } from "./ip";

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  includeIP?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private cachedIP: string | null = null;

  constructor(baseURL: string = "") {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get or fetch IP address
   */
  private async getIP(): Promise<string | null> {
    if (this.cachedIP) {
      return this.cachedIP;
    }

    // Try to get from localStorage first
    const storedIP = getStoredIP();
    if (storedIP) {
      this.cachedIP = storedIP;
      return storedIP;
    }

    // Fetch new IP
    const ip = await getClientIP();
    if (ip) {
      this.cachedIP = ip;
      localStorage.setItem("clientIP", ip);
    }

    return ip;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  /**
   * Make API request with automatic IP inclusion
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      includeIP = true,
      timeout = 60000,
    } = options;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    // Prepare headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add IP address to headers if requested
    if (includeIP) {
      const ip = await this.getIP();
      if (ip) {
        requestHeaders["X-Client-IP"] = ip;
        requestHeaders["X-Real-IP"] = ip;
      }
    }

    // Prepare body
    let requestBody: string | FormData | undefined;

    if (body instanceof FormData) {
      requestBody = body;
      // Remove Content-Type for FormData (browser will set it with boundary)
      delete requestHeaders["Content-Type"];

      // Add IP to FormData if not already present
      if (includeIP && !body.has("clientIP")) {
        const ip = await this.getIP();
        if (ip) {
          body.append("clientIP", ip);
        }
      }
    } else if (body && typeof body === "object") {
      // Add IP to JSON body
      const bodyWithIP = includeIP
        ? {
            ...body,
            clientIP: await this.getIP(),
          }
        : body;

      requestBody = JSON.stringify(bodyWithIP);
    } else if (body) {
      requestBody = body;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Read the response body once
      const contentType = response.headers.get("content-type");
      let result: any;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      // console.log('API response:', result);

      if (!response.ok) {
        // For JSON responses, use the error from the parsed result
        if (contentType && contentType.includes("application/json")) {
          throw new Error(
            result?.error || `HTTP error! status: ${response.status}`
          );
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return result as T;
    } catch (error) {
      clearTimeout(timeoutId);
      // console.log('API ERROR', error);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  // Convenience methods
  async get<T = any>(
    endpoint: string,
    options: Omit<ApiRequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  async put<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  async delete<T = any>(
    endpoint: string,
    options: Omit<ApiRequestOptions, "method"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async patch<T = any>(
    endpoint: string,
    body?: any,
    options: Omit<ApiRequestOptions, "method" | "body"> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Helper function to initialize with auth token
export const initializeApiClient = (token?: string) => {
  if (token) {
    apiClient.setAuthToken(token);
  }
  return apiClient;
};
