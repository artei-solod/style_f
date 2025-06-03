"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, ArrowLeft, Plus, Search, Heart, Share, Calendar, Wand2, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

interface Outfit {
  _id: string
  name: string
  occasion: string
  items: Array<{
    _id: string
    name: string
    category: string
  }>
  imageId: string
  liked: boolean
  createdAt: string
  weather: string
}

interface OutfitStats {
  total: number
  favorites: number
  thisWeek: number
  occasions: Array<{
    name: string
    count: number
  }>
}

export default function OutfitsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [outfitStats, setOutfitStats] = useState<OutfitStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch outfits data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchOutfitsData()
    }
  }, [session])

  const fetchOutfitsData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiClient.getOutfits()
      setOutfits(response.outfits || [])
      setOutfitStats(response.stats || null)
    } catch (error) {
      console.error("Error fetching outfits:", error)
      setError("Failed to load outfits. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleLike = async (outfitId: string) => {
    try {
      await apiClient.request(`/api/outfits/${outfitId}/like`, {
        method: "POST",
      })

      // Update local state
      setOutfits((prevOutfits) =>
        prevOutfits.map((outfit) => (outfit._id === outfitId ? { ...outfit, liked: !outfit.liked } : outfit)),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
      setError("Failed to update outfit. Please try again.")
    }
  }

  const OutfitCard = ({ outfit }: { outfit: Outfit }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-[3/4] overflow-hidden relative flex items-center justify-center">
          <Image
            src={apiClient.getImageUrl(outfit.imageId) || "/placeholder.svg"}
            alt={outfit.name}
            width={300}
            height={400}
            className="object-contain w-full h-full"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = "/placeholder.svg?height=400&width=300"
            }}
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              size="sm"
              variant={outfit.liked ? "default" : "secondary"}
              className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                handleToggleLike(outfit._id)
              }}
            >
              <Heart className={`h-4 w-4 ${outfit.liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
              <Share className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {outfit.occasion}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{outfit.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {outfit.items.length} items • {new Date(outfit.createdAt).toLocaleDateString()}
          </p>
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <Calendar className="h-3 w-3 mr-1" />
            {outfit.weather}
          </div>
          <div className="flex flex-wrap gap-1">
            {outfit.items.slice(0, 2).map((item) => (
              <Badge key={item._id} variant="outline" className="text-xs">
                {item.name}
              </Badge>
            ))}
            {outfit.items.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{outfit.items.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your outfits...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  // Fallback stats in case API fails
  const stats = outfitStats || {
    total: outfits.length,
    favorites: outfits.filter((o) => o.liked).length,
    thisWeek: 0,
    occasions: [],
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
                <Sparkles className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Outfits</h1>
              </div>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Wand2 className="h-4 w-4 mr-2" />
              Generate New Outfit
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your outfits..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Occasion
            </Button>
            <Button variant="outline">
              <Heart className="h-4 w-4 mr-2" />
              Favorites Only
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-green-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wand2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Generate AI Outfit</h3>
              <p className="text-sm text-gray-600">Let AI create a new outfit from your wardrobe</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-blue-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Create Manual Outfit</h3>
              <p className="text-sm text-gray-600">Manually select items to create an outfit</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-purple-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Plan Weekly Outfits</h3>
              <p className="text-sm text-gray-600">Plan your outfits for the entire week</p>
            </CardContent>
          </Card>
        </div>

        {/* Outfits Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Outfits ({outfits.length})</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <select className="border rounded px-2 py-1">
                <option>Most Recent</option>
                <option>Most Liked</option>
                <option>Occasion</option>
                <option>Season</option>
              </select>
            </div>
          </div>

          {outfits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {outfits.map((outfit) => (
                <OutfitCard key={outfit._id} outfit={outfit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No outfits yet</h3>
              <p className="text-gray-600 mb-4">Start by generating your first outfit</p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate First Outfit
              </Button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Outfit Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Outfits</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Favorites</span>
                  <span className="font-medium">{stats.favorites}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-medium">{stats.thisWeek}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Popular Occasions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.occasions.length > 0 ? (
                  stats.occasions.map((occasion) => (
                    <div key={occasion.name} className="flex justify-between">
                      <span className="text-sm text-gray-600">{occasion.name}</span>
                      <Badge variant="secondary">{occasion.count}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No occasion data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                {outfits.length > 0
                  ? "You have great casual outfits! Consider adding more formal options for business events."
                  : "Start creating outfits to get personalized recommendations."}
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Get Suggestions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
