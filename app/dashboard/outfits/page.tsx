"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sparkles, ArrowLeft, Search, Share, Calendar, Wand2, Filter, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

interface Outfit {
  _id: string
  name: string
  occasion: string
  clothes: Array<{
    _id: string
    name: string
    category: string
  }>
  image_id?: string
  created_at: string
  weather?: string
}

interface OutfitData {
  data: Outfit[]
}

export default function OutfitsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [outfitData, setOutfitData] = useState<OutfitData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentOffset, setCurrentOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [rateDialogOpen, setRateDialogOpen] = useState(false)

  const LIMIT = 20

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch outfits data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchOutfitsData(currentOffset)
    }
  }, [session, currentOffset])

  const fetchOutfitsData = async (offset = 0) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${apiClient["baseURL"]}/api/v1/get_outfits?offset=${offset}&limit=${LIMIT}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const totalCountHeader = response.headers.get("X-Total-Count")

      setOutfitData(data)
      setTotalCount(Number.parseInt(totalCountHeader || "0"))
    } catch (error) {
      console.error("Error fetching outfits:", error)
      setError("Failed to load outfits. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await apiClient.deleteOutfit(outfitId)
      // Refresh outfits data
      fetchOutfitsData(currentOffset)
    } catch (error) {
      console.error("Error deleting outfit:", error)
      setError("Failed to delete outfit. Please try again.")
    }
  }

  const handleRateOutfit = async (file: File) => {
    try {
      setIsUploading(true)
      setError("")

      await apiClient.rateOutfit(file)
      setRateDialogOpen(false)
      // Show success message or redirect to rated outfits
      setError("") // Clear any previous errors
    } catch (error) {
      console.error("Error rating outfit:", error)
      setError("Failed to rate outfit. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const OutfitCard = ({ outfit }: { outfit: Outfit }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="aspect-[3/4] overflow-hidden relative flex items-center justify-center bg-gray-100">
          {outfit.image_id ? (
            <Image
              src={apiClient.getImageUrl(outfit.image_id) || "/placeholder.svg"}
              alt={outfit.name}
              width={300}
              height={400}
              className="object-contain w-full h-full"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=300"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Sparkles className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
              <Share className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0 bg-white/80 hover:bg-red-500"
              onClick={(e) => {
                e.preventDefault()
                handleDeleteOutfit(outfit._id)
              }}
            >
              <X className="h-4 w-4 text-red-600" />
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
            {outfit.clothes.length} items • {new Date(outfit.created_at).toLocaleDateString()}
          </p>
          {outfit.weather && (
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar className="h-3 w-3 mr-1" />
              {outfit.weather}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {outfit.clothes.slice(0, 2).map((item) => (
              <Badge key={item._id} variant="outline" className="text-xs">
                {item.name}
              </Badge>
            ))}
            {outfit.clothes.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{outfit.clothes.length - 2} more
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

  const totalPages = Math.ceil(totalCount / LIMIT)
  const currentPage = Math.floor(currentOffset / LIMIT) + 1

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
            <div className="flex space-x-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate New Outfit
              </Button>
              <Button variant="outline" onClick={() => setRateDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Rate Outfit
              </Button>
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

          <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-blue-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Rate Your Outfit</h3>
                  <p className="text-sm text-gray-600">Upload a photo to get AI feedback</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate Your Outfit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleRateOutfit(file)
                    }}
                    className="hidden"
                    id="rate-outfit-upload"
                    disabled={isUploading}
                  />
                  <label htmlFor="rate-outfit-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        ) : (
                          <Upload className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {isUploading ? "Rating..." : "Upload outfit photo"}
                        </p>
                        <p className="text-gray-600">Click to browse or drag and drop</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
            <h2 className="text-xl font-semibold text-gray-900">Your Outfits ({totalCount})</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Sort by:</span>
              <select className="border rounded px-2 py-1">
                <option>Most Recent</option>
                <option>Occasion</option>
                <option>Season</option>
              </select>
            </div>
          </div>

          {outfitData && outfitData.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {outfitData.data.map((outfit) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentOffset(Math.max(0, currentOffset - LIMIT))}
                disabled={currentOffset === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentOffset(currentOffset + LIMIT)}
                disabled={currentOffset + LIMIT >= totalCount}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Outfit Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Outfits</span>
                  <span className="font-medium">{totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-medium">
                    {outfitData?.data.filter((o) => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(o.created_at) > weekAgo
                    }).length || 0}
                  </span>
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
                {outfitData?.data.length ? (
                  Object.entries(
                    outfitData.data.reduce(
                      (acc, outfit) => {
                        acc[outfit.occasion] = (acc[outfit.occasion] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .slice(0, 3)
                    .map(([occasion, count]) => (
                      <div key={occasion} className="flex justify-between">
                        <span className="text-sm text-gray-600">{occasion}</span>
                        <Badge variant="secondary">{count}</Badge>
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
                {outfitData?.data.length
                  ? "You have great outfits! Consider adding more variety for different occasions."
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
