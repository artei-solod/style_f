// ai-stylist-app/lib/api.ts

import { getSession } from "next-auth/react";

// The Next.js environment variable for client‐side use must start with NEXT_PUBLIC_
// In your .env.local, set:
// NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean; // if true, do not attach Authorization header
}

class ApiClient {
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await getSession();
    if (session?.accessToken) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      };
    }
    return { "Content-Type": "application/json" };
  }

  private async request(
    path: string,
    options: RequestOptions = {}
  ): Promise<any> {
    const headers: Record<string, string> = options.skipAuth
      ? { "Content-Type": "application/json" }
      : await this.getAuthHeaders();

    const response = await fetch(this.baseURL + path, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `API error (${response.status}): ${text || response.statusText}`
      );
    }

    // If there's no content (204), return null
    if (response.status === 204) return null;

    return response.json();
  }

  // =====================
  // AUTH / USER
  // =====================

  // Example: if you added a /api/v1/signup route in the backend, you can call:
  async signup(email: string, password: string, name: string) {
    return this.request("/api/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  // get current user
  async getCurrentUser() {
    return this.request("/api/v1/me");
  }

  // =====================
  // WARDROBE
  // =====================

  async getWardrobe() {
    return this.request("/api/v1/wardrobe");
  }

  // Upload a wardrobe item (multipart/form-data)
  async uploadWardrobeItem(formData: FormData) {
    // When sending FormData, do NOT set Content-Type manually (browser will do it).
    // We do a “skipAuth: true” so we can let the browser set boundary headers.
    return this.request("/api/v1/wardrobe", {
      method: "POST",
      body: formData,
      skipAuth: true,
    });
  }

  // =====================
  // OUTFITS
  // =====================

  async getOutfits() {
    return this.request("/api/v1/outfits");
  }

  // =====================
  // SHOPPING
  // =====================

  async searchProducts(query: string) {
    return this.request(
      `/api/v1/shopping/search?query=${encodeURIComponent(query)}`
    );
  }

  async addToWishlist(productId: string) {
    return this.request(`/api/v1/shopping/wishlist/${productId}`, {
      method: "POST",
    });
  }

  // =====================
  // IMAGE URL (for serving uploaded images)
  // =====================

  getImageUrl(imageId: string) {
    return `${this.baseURL}/api/v1/images/${imageId}`;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
