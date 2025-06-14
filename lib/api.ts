import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
const API_PREFIX = "/api/v1"

class ApiClient {
  public baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthHeaders() {
    // Only get session on client side
    if (typeof window === "undefined") {
      return {
        "Content-Type": "application/json",
      }
    }

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
    username: string
    password: string
  }) {
    return this.request("/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: {
    username: string
    password: string
  }) {
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
    if (typeof window === "undefined") {
      throw new Error("File upload only available on client side")
    }

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
    if (typeof window === "undefined") {
      throw new Error("File upload only available on client side")
    }

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

  // Image methods
  getImageUrl(imageId: string) {
    if (!imageId) return null
    return `${this.baseURL}/downloads/${imageId}`
  }

  getImageFromBase64(base64Data: string) {
    if (!base64Data) return null
    return `data:image/jpeg;base64,${base64Data}`
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
