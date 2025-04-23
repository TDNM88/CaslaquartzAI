"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, Camera } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
  uploadedImage: string | null
}

export default function ImageUploader({ onImageUpload, uploadedImage }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Kiểm tra nếu file là hình ảnh
    if (!file.type.match("image.*")) {
      toast({
        title: "Lỗi tệp",
        description: "Vui lòng tải lên tệp hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra kích thước file (tối đa 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi kích thước",
        description: "Kích thước tệp không được vượt quá 10MB",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string)
        setIsLoading(false)
      }
    }
    reader.onerror = () => {
      toast({
        title: "Lỗi đọc tệp",
        description: "Không thể đọc tệp hình ảnh",
        variant: "destructive",
      })
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Tải lên hình ảnh</h2>
        <p className="text-sm sm:text-base text-gray-600">Tải lên hình ảnh không gian nội thất của bạn để bắt đầu</p>
      </div>

      {uploadedImage ? (
        <div className="relative">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={uploadedImage || "/placeholder.svg"}
              alt="Hình ảnh đã tải lên"
              className="w-full h-full object-contain"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-1" />
            <span className="text-xs sm:text-sm">Thay đổi</span>
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 sm:p-12 text-center ${
            dragActive ? "border-blue-900 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isLoading}
          />

          <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-blue-100 rounded-full">
              <ImageIcon className="h-6 w-6 sm:h-10 sm:w-10 text-blue-900" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-700 mb-1">Kéo và thả hình ảnh vào đây, hoặc</p>
              <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="border-blue-900 text-blue-900 hover:bg-blue-50 text-xs sm:text-sm"
                disabled={isLoading}
              >
                <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Chọn tệp
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">PNG, JPG hoặc GIF (tối đa 10MB)</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border border-gray-200">
          <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
            <img
              src="https://caslaquartz.com/pictures/catalog/background/3.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Ví dụ phòng khách"
              className="max-h-full max-w-full object-cover rounded"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 text-center">Ví dụ: Phòng khách hiện đại</p>
        </Card>

        <Card className="p-3 sm:p-4 border border-gray-200">
          <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
            <img
              src="https://caslaquartz.com/pictures/catalog/home/products/pro-4202.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Ví dụ nhà bếp"
              className="max-h-full max-w-full object-cover rounded"
            />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 text-center">Ví dụ: Nhà bếp sang trọng</p>
        </Card>
      </div>
    </div>
  )
}

