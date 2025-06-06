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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shirt, ArrowLeft, Plus, Search, Filter, Grid3X3, List, Upload, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { apiClient } from "@/lib/api"

interface ClothesItem {
  cloth_id: string
  name: string
  color: string
  brand: string
  category: string
  tags: string[]
  added_ts: number
  user_id_created: string
  picture_b64?: string
}

interface ClothesData {
  data: ClothesItem[]
}

export default function WardrobePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [clothesData, setClothesData] = useState<ClothesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentOffset, setCurrentOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const LIMIT = 20

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch clothes data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchClothesData(currentOffset)
    }
  }, [session, currentOffset])

  const fetchClothesData = async (offset = 0) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${apiClient["baseURL"]}/api/v1/get_my_clothes?offset=${offset}&limit=${LIMIT}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const totalCountHeader = response.headers.get("X-Total-Count")

      setClothesData(data)
      setTotalCount(Number.parseInt(totalCountHeader || "0"))
    } catch (error) {
      console.error("Error fetching clothes:", error)
      setError("Failed to load wardrobe items. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async (clothId: string) => {
    try {
      await apiClient.deleteClothes(clothId)
      // Refresh clothes data
      fetchClothesData(currentOffset)
    } catch (error) {
      console.error("Error deleting item:", error)
      setError("Failed to delete item. Please try again.")
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setError("")

      await apiClient.uploadClothes(file)
      setUploadDialogOpen(false)
      // Refresh clothes data
      fetchClothesData(currentOffset)
    } catch (error: any) {
      console.error("Error uploading clothes:", error)
      if (error.message.includes("423")) {
        setError("Maximum number of uploaded clothes reached")
      } else {
        setError("Failed to upload clothes. Please try again.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Group items by category
  const groupedItems = {
    all: clothesData?.data || [],
    upperBody: clothesData?.data.filter((item) => item.category.toLowerCase().includes("upper")) || [],
    lowerBody: clothesData?.data.filter((item) => item.category.toLowerCase().includes("lower")) || [],
    shoes: clothesData?.data.filter((item) => item.category.toLowerCase().includes("shoe")) || [],
    accessories: clothesData?.data.filter((item) => item.category.toLowerCase().includes("accessory")) || [],
  }

  const ItemCard = ({ item }: { item: ClothesItem }) => (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
          {item.picture_b64 ? (
            <Image
              src={apiClient.getImageFromBase64(item.picture_b64) || "/placeholder.svg"}
              alt={item.name}
              width={150}
              height={200}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Shirt className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                onClick={() => handleDeleteItem(item.cloth_id)}
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

  const AddItemCard = () => (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogTrigger asChild>
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 text-center">Add new item</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Clothing Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="hidden"
              id="clothes-upload"
              disabled={isUploading}
            />
            <label htmlFor="clothes-upload" className="cursor-pointer">
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
                    {isUploading ? "Uploading..." : "Upload your photo"}
                  </p>
                  <p className="text-gray-600">Click to browse or drag and drop</p>
                </div>
              </div>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
                <Shirt className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setUploadDialogOpen(true)}>
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
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
            <TabsTrigger value="upperBody">Upper Body ({groupedItems.upperBody.length})</TabsTrigger>
            <TabsTrigger value="lowerBody">Lower Body ({groupedItems.lowerBody.length})</TabsTrigger>
            <TabsTrigger value="shoes">Shoes ({groupedItems.shoes.length})</TabsTrigger>
            <TabsTrigger value="accessories">Accessories ({groupedItems.accessories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedItems.all.map((item) => (
                <ItemCard key={item.cloth_id} item={item} />
              ))}
              <AddItemCard />
            </div>
          </TabsContent>

          <TabsContent value="upperBody">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedItems.upperBody.map((item) => (
                <ItemCard key={item.cloth_id} item={item} />
              ))}
              <AddItemCard />
            </div>
          </TabsContent>

          <TabsContent value="lowerBody">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedItems.lowerBody.map((item) => (
                <ItemCard key={item.cloth_id} item={item} />
              ))}
              <AddItemCard />
            </div>
          </TabsContent>

          <TabsContent value="shoes">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedItems.shoes.map((item) => (
                <ItemCard key={item.cloth_id} item={item} />
              ))}
              <AddItemCard />
            </div>
          </TabsContent>

          <TabsContent value="accessories">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groupedItems.accessories.map((item) => (
                <ItemCard key={item.cloth_id} item={item} />
              ))}
              <AddItemCard />
            </div>
          </TabsContent>
        </Tabs>

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
      </div>
    </div>
  )
}
