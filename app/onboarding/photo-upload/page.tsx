"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function PhotoUploadPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      // Redirect to budget selection
      window.location.href = "/onboarding/budget-selection"
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Let's Analyze Your Body Type</CardTitle>
          <CardDescription className="text-lg">
            Upload a full-body photo so our AI can provide personalized style recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadedImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-purple-400 transition-colors">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload your photo</p>
                    <p className="text-gray-600">Click to browse or drag and drop</p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative mx-auto w-64 h-80 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={uploadedImage || "/placeholder.svg"}
                  alt="Uploaded photo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Body Type <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Tips for the best results:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Stand straight with arms at your sides</li>
              <li>• Wear fitted clothing or form-fitting attire</li>
              <li>• Ensure good lighting and clear visibility</li>
              <li>• Take the photo from about 6 feet away</li>
            </ul>
          </div>

          <div className="text-center">
            <Link href="/onboarding/budget-selection" className="text-purple-600 hover:underline">
              Skip for now and continue
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
