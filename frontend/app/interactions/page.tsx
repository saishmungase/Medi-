"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Shield, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Interaction {
  drugA: string
  drugB: string
  interactionType: string
  severity: "Low" | "Medium" | "High"
  description: string
}

export default function InteractionsPage() {
  const interactions: Interaction[] = [
    {
      drugA: "Paracetamol",
      drugB: "Alcohol",
      interactionType: "Hepatotoxicity Risk",
      severity: "High",
      description: "Concurrent use may increase risk of liver damage",
    },
    {
      drugA: "Amoxicillin",
      drugB: "Birth Control Pills",
      interactionType: "Reduced Effectiveness",
      severity: "Medium",
      description: "May reduce contraceptive effectiveness",
    },
    {
      drugA: "Ibuprofen",
      drugB: "Blood Pressure Medications",
      interactionType: "Reduced Effectiveness",
      severity: "Medium",
      description: "May reduce antihypertensive effects",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "High":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "Medium":
        return <Shield className="h-5 w-5 text-yellow-600" />
      default:
        return <Info className="h-5 w-5 text-green-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 hover:text-gray-900 transition-colors">Back to Dashboard</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Drug Interactions
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Drug Interactions Analysis</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Important information about potential interactions between your prescribed medicines.
          </p>
        </div>

        <div className="space-y-6">
          {interactions.map((interaction, index) => (
            <Card
              key={index}
              className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(interaction.severity)}
                    <span className="text-xl font-semibold text-gray-900">
                      {interaction.drugA} + {interaction.drugB}
                    </span>
                  </div>
                  <Badge className={`${getSeverityColor(interaction.severity)} border font-semibold`}>
                    {interaction.severity} Severity
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interaction Type</h4>
                    <p className="text-gray-600">{interaction.interactionType}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{interaction.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Safety Notice</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              This information is for educational purposes only. Always consult your healthcare provider before making
              any changes to your medication regimen or if you have concerns about drug interactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline" className="border-red-300 hover:bg-red-50">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/upload">
                <Button className="bg-gradient-to-r from-red-600 to-orange-600">Upload New Prescription</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
