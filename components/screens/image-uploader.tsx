"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
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
        const imageUrl = e.target.result as string
        setPreviewImage(imageUrl)
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

  const handleContinue = () => {
    if (previewImage) {
      onImageUpload(previewImage)
    }
  }

  return (
    <div className="space-y-8">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center ${
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

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <ImageIcon className="h-10 w-10 text-blue-900" />
          </div>
          <div>
            <p className="text-gray-700 mb-1">Kéo và thả hình ảnh vào đây, hoặc</p>
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              className="border-blue-900 text-blue-900 hover:bg-blue-50"
              disabled={isLoading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Chọn tệp
            </Button>
          </div>
          <p className="text-sm text-gray-500">PNG, JPG hoặc GIF (tối đa 10MB)</p>
        </div>
      </div>

      {previewImage ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Xem trước hình ảnh</h3>
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Xem trước"
              className="max-w-full h-auto mx-auto object-contain max-h-[400px]"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleContinue} className="bg-blue-900 hover:bg-blue-800">
              Tiếp tục
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ví dụ về không gian nội thất</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border border-gray-200">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Ví dụ phòng khách"
                  className="max-h-full max-w-full object-cover rounded"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">Phòng khách hiện đại</p>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Ví dụ nhà bếp"
                  className="max-h-full max-w-full object-cover rounded"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">Nhà bếp sang trọng</p>
            </Card>

            <Card className="p-4 border border-gray-200">
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center mb-2">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Ví dụ phòng tắm"
                  className="max-h-full max-w-full object-cover rounded"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">Phòng tắm tinh tế</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

