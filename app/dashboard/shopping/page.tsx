"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ShoppingBag,
  ArrowLeft,
  Search,
  Filter,
  Star,
  Heart,
  ExternalLink,
  TrendingUp,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

interface Product {
  _id: string
  name: string
  brand: string
  price: string
  originalPrice?: string
  imageId: string
  rating: number
  reviews?: number
  reason?: string
  discount?: string
  inStock: boolean
  sizes: string[]
  trending?: boolean
}

interface WardrobeAnalysis {
  missingFormalPieces: number
  possibleNewOutfits: number
  wardrobeUtilization: number
}

export default function ShoppingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [trendingItems, setTrendingItems] = useState<Product[]>([])
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [wardrobeAnalysis, setWardrobeAnalysis] = useState<WardrobeAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch shopping data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchShoppingData()
    }
  }, [session])

  const fetchShoppingData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiClient.request("/api/shopping")
      setSuggestions(response.suggestions || [])
      setTrendingItems(response.trending || [])
      setWishlistItems(response.wishlist || [])
      setWardrobeAnalysis(response.wardrobeAnalysis || null)
    } catch (error) {
      console.error("Error fetching shopping data:", error)
      setError("Failed to load shopping recommendations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleWishlist = async (productId: string) => {
    try {
      await apiClient.request(`/api/shopping/wishlist/${productId}`, {
        method: "POST",
      })

      // Update local state
      fetchShoppingData()
    } catch (error) {
      console.error("Error updating wishlist:", error)
      setError("Failed to update wishlist. Please try again.")
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      setError("")

      const response = await apiClient.request(`/api/shopping/search?q=${encodeURIComponent(searchQuery)}`)
      setSuggestions(response.results || [])
    } catch (error) {
      console.error("Error searching products:", error)
      setError("Failed to search products. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const ProductCard = ({ item, showReason = false }: { item: Product; showReason?: boolean }) => {
    const isWishlisted = wishlistItems.some((wishlistItem) => wishlistItem._id === item._id)

    return (
      <Card className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
            <Image
              src={apiClient.getImageUrl(item.imageId) || "/placeholder.svg"}
              alt={item.name}
              width={150}
              height={200}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = "/placeholder.svg?height=200&width=150"
              }}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant={isWishlisted ? "default" : "secondary"}
                className="h-8 w-8 p-0"
                onClick={() => handleToggleWishlist(item._id)}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
            {item.discount && (
              <div className="absolute top-2 left-2">
                <Badge variant="destructive" className="text-xs">
                  {item.discount}
                </Badge>
              </div>
            )}
            {item.trending && (
              <div className="absolute top-2 left-2">
                <Badge className="text-xs bg-orange-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
            )}
            {!item.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
            <p className="text-xs text-gray-600">{item.brand}</p>

            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
              </div>
              {item.reviews && <span className="text-xs text-gray-500">({item.reviews})</span>}
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">{item.price}</span>
              {item.originalPrice && <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>}
            </div>

            {showReason && item.reason && (
              <div className="flex items-center space-x-1 p-2 bg-blue-50 rounded text-xs">
                <Target className="h-3 w-3 text-blue-600" />
                <span className="text-blue-700">{item.reason}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <Button size="sm" className="flex-1 text-xs" disabled={!item.inStock}>
                Add to Cart
              </Button>
              <Button size="sm" variant="outline" className="px-2">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shopping recommendations...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  // Fallback analysis in case API fails
  const analysis = wardrobeAnalysis || {
    missingFormalPieces: 0,
    possibleNewOutfits: 0,
    wardrobeUtilization: 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Smart Shopping</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* AI Search Bar */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">AI Shopping Assistant</h2>
                <p className="text-sm text-gray-600">Describe what you're looking for in natural language</p>
              </div>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="e.g., 'I need a formal dress for a wedding' or 'casual shoes for summer'"
                className="pl-10 pr-20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-2 bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Shopping Tabs */}
        <Tabs defaultValue="suggestions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">AI Suggestions ({suggestions.length})</TabsTrigger>
            <TabsTrigger value="trending">Trending Now ({trendingItems.length})</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist ({wishlistItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personalized for You</h2>
                  <p className="text-gray-600">Based on your wardrobe gaps and style preferences</p>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {suggestions.map((item) => (
                    <ProductCard key={item._id} item={item} showReason={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions yet</h3>
                  <p className="text-gray-600 mb-4">Add more items to your wardrobe to get personalized suggestions</p>
                  <Link href="/dashboard/wardrobe">
                    <Button>Go to Wardrobe</Button>
                  </Link>
                </div>
              )}

              {/* Wardrobe Analysis */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Wardrobe Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analysis.missingFormalPieces}</div>
                      <div className="text-sm text-gray-600">Missing formal pieces</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analysis.possibleNewOutfits}</div>
                      <div className="text-sm text-gray-600">Possible new outfits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{analysis.wardrobeUtilization}%</div>
                      <div className="text-sm text-gray-600">Wardrobe utilization</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Trending This Week</h2>
                  <p className="text-gray-600">Popular items across all fashion categories</p>
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {trendingItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {trendingItems.map((item) => (
                    <ProductCard key={item._id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending items available</h3>
                  <p className="text-gray-600 mb-4">Check back soon for the latest fashion trends</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            {wishlistItems.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Your Wishlist</h2>
                    <p className="text-gray-600">Items you've saved for later</p>
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistItems.map((item) => (
                    <ProductCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-4">Start adding items you love to keep track of them</p>
                <Button>Browse Suggestions</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
