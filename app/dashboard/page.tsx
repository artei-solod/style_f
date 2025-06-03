"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shirt, ShoppingBag, Sparkles, Plus, Search, User, Settings, Bell, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

interface DashboardStats {
  wardrobe: {
    totalItems: number
    upperBody: number
    lowerBody: number
    shoes: number
    accessories: number
  }
  outfits: {
    total: number
    recent: Array<{
      id: string
      name: string
      items: number
      imageId: string
    }>
  }
  recommendations: {
    count: number
  }
  activities: Array<{
    id: string
    description: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch dashboard data when component mounts
  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await apiClient.request("/api/dashboard")
      setDashboardData(response)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  // Fallback data in case API fails
  const fallbackData = {
    wardrobe: {
      totalItems: 0,
      upperBody: 0,
      lowerBody: 0,
      shoes: 0,
      accessories: 0,
    },
    outfits: {
      total: 0,
      recent: [],
    },
    recommendations: {
      count: 0,
    },
    activities: [],
  }

  const data = dashboardData || fallbackData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">StyleAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name || "Stylist"}!</h1>
          <p className="text-gray-600">Ready to discover your perfect style today?</p>
        </div>

        {/* Main Folders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Wardrobe Folder */}
          <Link href="/dashboard/wardrobe">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shirt className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Wardrobe</CardTitle>
                    <CardDescription>Your digital closet</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <Badge variant="secondary">{data.wardrobe.totalItems}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upper Body</span>
                      <span className="font-medium">{data.wardrobe.upperBody}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lower Body</span>
                      <span className="font-medium">{data.wardrobe.lowerBody}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shoes</span>
                      <span className="font-medium">{data.wardrobe.shoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accessories</span>
                      <span className="font-medium">{data.wardrobe.accessories}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Outfits Folder */}
          <Link href="/dashboard/outfits">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Sparkles className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Outfits</CardTitle>
                    <CardDescription>AI-generated combinations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Generated Outfits</span>
                    <Badge variant="secondary">{data.outfits.total}</Badge>
                  </div>
                  <div className="flex -space-x-2">
                    {data.outfits.recent.slice(0, 3).map((outfit) => (
                      <div
                        key={outfit.id}
                        className="w-8 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded border-2 border-white"
                      />
                    ))}
                    <div className="w-8 h-10 bg-gray-100 rounded border-2 border-white flex items-center justify-center">
                      <Plus className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {data.outfits.recent.length > 0
                      ? `${data.outfits.recent.length} new outfits this week`
                      : "No new outfits this week"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Shopping Folder */}
          <Link href="/dashboard/shopping">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ShoppingBag className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Shopping</CardTitle>
                    <CardDescription>Smart recommendations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Suggestions</span>
                    <Badge variant="secondary">{data.recommendations.count}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">AI Shopping Assistant</span>
                    </div>
                    <p className="text-xs text-gray-500">Find items to complete your wardrobe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Add New Item to Wardrobe
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Outfit
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Find Missing Pieces
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {data.activities.length > 0 ? (
                  data.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <span className="text-sm">{activity.description}</span>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
