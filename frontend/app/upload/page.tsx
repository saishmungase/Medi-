"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Upload, ImageIcon, X, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Mock detected medicines
    const detectedMeds = ["paracetamol", "amoxicillin", "ibuprofen"]

    setIsAnalyzing(false)
    router.push(`/dashboard?meds=${detectedMeds.join(",")}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id="file-upload" />
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-gray-600 hover:text-gray-900 transition-colors">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Upload Prescription
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Upload Your Prescription</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a clear image of your prescription and our AI will analyze it to provide detailed medicine
            information.
          </p>
        </div>

        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-6 w-6" />
              <span>Prescription Image</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`p-6 rounded-full transition-all duration-300 ${
                      isDragOver ? "bg-blue-100 scale-110" : "bg-gray-100"
                    }`}
                  >
                    <Upload
                      className={`h-12 w-12 transition-colors duration-300 ${
                        isDragOver ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-900 mb-2">Drop your prescription here</p>
                    <p className="text-gray-600 mb-6">or click to browse files</p>

                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-300 cursor-pointer"
                        asChild
                      >
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">Supports: JPG, PNG, JPEG (Max 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-gray-200">
                    <Image
                      src={previewUrl! || "/placeholder.svg"}
                      alt="Prescription preview"
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                    <button
                      onClick={removeFile}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="font-semibold text-gray-900">File Ready</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p className="text-gray-600">
                    <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:hover:scale-100"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Analyzing Prescription...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-3 h-5 w-5" />
                      Analyze Prescription
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isAnalyzing && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <div>
                  <h3 className="font-semibold text-blue-900">AI Analysis in Progress</h3>
                  <p className="text-blue-700">Our AI is reading your prescription and identifying medicines...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
