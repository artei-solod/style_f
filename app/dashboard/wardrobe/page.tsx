"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shirt, ArrowLeft, Plus, Search, Filter, Grid3X3, List, Upload, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

interface WardrobeItem {
  _id: string
  name: string
  color: string
  brand: string
  category: "upperBody" | "lowerBody" | "shoes" | "accessories"
  imageId: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface WardrobeData {
  upperBody: WardrobeItem[]
  lowerBody: WardrobeItem[]
  shoes: WardrobeItem[]
  accessories: WardrobeItem[]
}

export default function WardrobePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeData>({
    upperBody: [],
    lowerBody: [],
    shoes: [],
    accessories: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch wardrobe data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchWardrobeData()
    }
  }, [session])

  const fetchWardrobeData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiClient.getWardrobe()

      // Group items by category
      const groupedItems: WardrobeData = {
        upperBody: [],
        lowerBody: [],
        shoes: [],
        accessories: [],
      }

      response.items.forEach((item: WardrobeItem) => {
        if (groupedItems[item.category]) {
          groupedItems[item.category].push(item)
        }
      })

      setWardrobeItems(groupedItems)
    } catch (error) {
      console.error("Error fetching wardrobe:", error)
      setError("Failed to load wardrobe items. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await apiClient.deleteWardrobeItem(itemId)
      // Refresh wardrobe data
      fetchWardrobeData()
    } catch (error) {
      console.error("Error deleting item:", error)
      setError("Failed to delete item. Please try again.")
    }
  }

  const ItemCard = ({ item }: { item: WardrobeItem }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
          <Image
            src={apiClient.getImageUrl(item.imageId) || "/placeholder.svg"}
            alt={item.name}
            width={150}
            height={200}
            className="object-contain w-full h-full"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.src = "/placeholder.svg?height=200&width=150"
            }}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={() => handleDeleteItem(item._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <h3 className="font-medium text-sm mb-1">{item.name}</h3>
        <p className="text-xs text-gray-600 mb-2">
          {item.brand} • {item.color}
        </p>
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const AddItemCard = ({ category }: { category: string }) => (
    <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
      <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 text-center">Add new {category} item</p>
      </CardContent>
    </Card>
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your wardrobe...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
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
                <Shirt className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
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
              placeholder="Search your wardrobe..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Wardrobe Categories */}
        <Tabs defaultValue="upperBody" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upperBody">Upper Body ({wardrobeItems.upperBody.length})</TabsTrigger>
            <TabsTrigger value="lowerBody">Lower Body ({wardrobeItems.lowerBody.length})</TabsTrigger>
            <TabsTrigger value="shoes">Shoes ({wardrobeItems.shoes.length})</TabsTrigger>
            <TabsTrigger value="accessories">Accessories ({wardrobeItems.accessories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upperBody">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wardrobeItems.upperBody.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
              <AddItemCard category="upper body" />
            </div>
          </TabsContent>

          <TabsContent value="lowerBody">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wardrobeItems.lowerBody.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
              <AddItemCard category="lower body" />
            </div>
          </TabsContent>

          <TabsContent value="shoes">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wardrobeItems.shoes.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
              <AddItemCard category="shoes" />
            </div>
          </TabsContent>

          <TabsContent value="accessories">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wardrobeItems.accessories.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
              <AddItemCard category="accessories" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
