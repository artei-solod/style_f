"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, DollarSign, ArrowRight } from "lucide-react"

export default function BudgetSelectionPage() {
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)

  const budgetOptions = [
    {
      id: "budget",
      title: "Budget Conscious",
      description: "Great style on a budget",
      range: "$0 - $100/month",
      features: ["Affordable brand recommendations", "Thrift store finds", "Mix & match basics"],
    },
    {
      id: "mid-range",
      title: "Mid-Range",
      description: "Quality meets affordability",
      range: "$100 - $500/month",
      features: ["Quality brand recommendations", "Seasonal updates", "Investment pieces"],
    },
    {
      id: "premium",
      title: "Premium",
      description: "Luxury and designer pieces",
      range: "$500+/month",
      features: ["Designer recommendations", "Exclusive collections", "Personal styling"],
    },
  ]

  const handleContinue = () => {
    if (selectedBudget) {
      // Save budget preference and redirect to dashboard
      console.log("Selected budget:", selectedBudget)
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Choose Your Budget Category</CardTitle>
          <CardDescription className="text-lg">
            Help us tailor recommendations to your spending preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budgetOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBudget === option.id ? "ring-2 ring-purple-500 bg-purple-50" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedBudget(option.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                    {selectedBudget === option.id && (
                      <div className="p-1 bg-purple-500 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-2">{option.description}</p>
                  <p className="text-lg font-medium text-purple-600 mb-4">{option.range}</p>
                  <ul className="space-y-2">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedBudget}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Continue to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Don't worry, you can change this anytime in your settings
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
