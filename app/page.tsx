"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Sparkles, Shirt, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">StyleAI</span>
          </div>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              {" "}
              AI Stylist
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Analyze your wardrobe, discover perfect outfits, and shop smarter with AI-powered style recommendations
            tailored just for you.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Outfit Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/outfit1.jpg"
                  alt="Casual outfit with graphic tee and jeans"
                  width={300}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Casual Chic</h3>
                <p className="text-gray-600 text-sm">Perfect for everyday wear</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/outfit2.jpg"
                  alt="Business professional suit outfit"
                  width={300}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Business Professional</h3>
                <p className="text-gray-600 text-sm">Make an impression at work</p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="aspect-[3/4] overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/outfit3.jpg"
                  alt="Summer floral dress outfit"
                  width={300}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">Summer Elegance</h3>
                <p className="text-gray-600 text-sm">Perfect for warm weather occasions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shirt className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Smart Wardrobe Analysis</h3>
            </div>
            <p className="text-gray-600">
              Upload your clothes and let AI analyze your body type and style preferences to create the perfect digital
              wardrobe.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Shopping Assistant</h3>
            </div>
            <p className="text-gray-600">
              Get personalized shopping recommendations based on your wardrobe gaps and style preferences across
              multiple brands.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
