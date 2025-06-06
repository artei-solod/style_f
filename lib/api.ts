import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
const API_PREFIX = "/api/v1"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthHeaders() {
    const session = await getSession()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${API_PREFIX}${endpoint}`
    const headers = await this.getAuthHeaders()

    const config: RequestInit = {
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        if (response.status === 401) {
          // Handle token refresh or redirect to login
          throw new Error("Unauthorized")
        }
        if (response.status === 423) {
          const data = await response.json()
          throw new Error(`Queue number: ${data.detail}`)
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth methods
  async signup(userData: {
    username: string // Email or phone
    password: string
  }) {
    return this.request("/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: {
    username: string // Email, phone, or telegram_id
    password: string
  }) {
    // Use form data for OAuth2PasswordRequestForm
    const formData = new FormData()
    formData.append("username", credentials.username)
    formData.append("password", credentials.password)

    return fetch(`${this.baseURL}${API_PREFIX}/token`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
  }

  async refreshToken(refreshToken: string) {
    return this.request("/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  }

  async googleAuth(token: string) {
    return this.request("/google_auth", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  }

  // User methods
  async getUserProfile() {
    return this.request("/me")
  }

  async updateUserProfile(profileData: any) {
    return this.request("/anketa", {
      method: "POST",
      body: JSON.stringify(profileData),
    })
  }

  // Clothes/Wardrobe methods
  async uploadClothes(file: File) {
    const session = await getSession()
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`
    }

    return fetch(`${this.baseURL}${API_PREFIX}/get_card_wardrobe`, {
      method: "POST",
      headers,
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
  }

  async getMyClothes(offset = 0, limit = 20) {
    return this.request(`/get_my_clothes?offset=${offset}&limit=${limit}`)
  }

  async getMyDraftClothes(offset = 0, limit = 20) {
    return this.request(`/get_my_draft_clothes?offset=${offset}&limit=${limit}`)
  }

  async getCommonClothes(offset = 0, limit = 20) {
    return this.request(`/get_common_clothes?offset=${offset}&limit=${limit}`)
  }

  async getAvailableClothes(offset = 0, limit = 20) {
    return this.request(`/get_available_clothes?offset=${offset}&limit=${limit}`)
  }

  async getRecentClothes() {
    return this.request("/get_recent_clothes")
  }

  async updateClothes(clothId: string, clothData: any) {
    return this.request(`/change_card/${clothId}`, {
      method: "POST",
      body: JSON.stringify(clothData),
    })
  }

  async deleteClothes(clothId: string) {
    return this.request(`/delete_card/${clothId}`, {
      method: "DELETE",
    })
  }

  async addToWardrobe(clothId: string) {
    return this.request(`/add_to_my_wardrobe/${clothId}`, {
      method: "POST",
    })
  }

  async viewCard(clothId: string) {
    return this.request(`/view_card/${clothId}`)
  }

  // Outfits methods
  async createOutfit(outfitData: {
    clothes_ids: string[]
    occasion?: string
    weather?: string
    style_preferences?: string[]
    description?: string
  }) {
    return this.request("/create_outfit", {
      method: "POST",
      body: JSON.stringify(outfitData),
    })
  }

  async getOutfits(offset = 0, limit = 20) {
    return this.request(`/get_outfits?offset=${offset}&limit=${limit}`)
  }

  async deleteOutfit(outfitId: string) {
    return this.request(`/delete_outfit/${outfitId}`, {
      method: "DELETE",
    })
  }

  // Outfit rating methods
  async rateOutfit(file: File) {
    const session = await getSession()
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`
    }

    return fetch(`${this.baseURL}${API_PREFIX}/rate_outfit`, {
      method: "POST",
      headers,
      body: formData,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
  }

  async getRatedOutfits(offset = 0, limit = 20) {
    return this.request(`/get_rated_outfits?offset=${offset}&limit=${limit}`)
  }

  async getRatedOutfitById(ratedOutfitId: string) {
    return this.request(`/get_rated_outfit_by_id/${ratedOutfitId}`)
  }

  async deleteRatedOutfit(ratedOutfitId: string) {
    return this.request(`/delete_rated_outfit/${ratedOutfitId}`, {
      method: "DELETE",
    })
  }

  // Dashboard method (fallback if not implemented)
  async getDashboard() {
    try {
      // Try to get real dashboard data
      const [clothesRes, outfitsRes] = await Promise.all([this.getMyClothes(0, 1), this.getOutfits(0, 1)])

      // Calculate stats from available data
      const totalClothes = Number.parseInt(clothesRes.headers?.get("X-Total-Count") || "0")
      const totalOutfits = Number.parseInt(outfitsRes.headers?.get("X-Total-Count") || "0")

      return {
        wardrobe: {
          totalItems: totalClothes,
          upperBody: 0, // Would need category-specific endpoints
          lowerBody: 0,
          shoes: 0,
          accessories: 0,
        },
        outfits: {
          total: totalOutfits,
          recent: outfitsRes.data?.slice(0, 3) || [],
        },
        recommendations: { count: 0 },
        activities: [],
      }
    } catch (error) {
      console.warn("Dashboard data not available, using fallback")
      return {
        wardrobe: { totalItems: 0, upperBody: 0, lowerBody: 0, shoes: 0, accessories: 0 },
        outfits: { total: 0, recent: [] },
        recommendations: { count: 0 },
        activities: [],
      }
    }
  }

  // Shopping methods (fallback if not implemented)
  async getShoppingRecommendations() {
    try {
      return this.request("/shopping")
    } catch (error) {
      console.warn("Shopping endpoint not implemented, using fallback data")
      return {
        suggestions: [],
        trending: [],
        wishlist: [],
        wardrobeAnalysis: { missingFormalPieces: 0, possibleNewOutfits: 0, wardrobeUtilization: 0 },
      }
    }
  }

  // Image methods
  getImageUrl(imageId: string) {
    if (!imageId) return null
    return `${this.baseURL}/downloads/${imageId}`
  }

  // Convert base64 to blob URL for display
  getImageFromBase64(base64Data: string) {
    if (!base64Data) return null
    return `data:image/jpeg;base64,${base64Data}`
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
