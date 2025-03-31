"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import WelcomeScreen from "./welcome-screen"
import ImageUploader from "./image-uploader"
import TextureGallery from "./texture-gallery"
import ImageMasking from "./image-masking"
import ProcessingScreen from "./processing-screen"
import ResultDisplay from "./result-display"
import { useToast } from "@/components/ui/use-toast"
import { productGroups } from "@/lib/product-data"

type Step = "welcome" | "upload" | "select" | "mask" | "process" | "result"

export default function ImageEditor() {
  const [currentStep, setCurrentStep] = useState<Step>("welcome")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedTexture, setSelectedTexture] = useState<{ url: string; name: string; quote: string } | null>(null)
  const [maskedImage, setMaskedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSimulated, setIsSimulated] = useState(false)
  const { toast } = useToast()

  const handleStart = () => {
    setCurrentStep("upload")
  }

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setCurrentStep("select")
  }

  const handleTextureSelect = (texture: { url: string; name: string; quote: string }) => {
    setSelectedTexture(texture)
    setCurrentStep("mask")
  }

  const handleMaskComplete = (maskedImageUrl: string) => {
    setMaskedImage(maskedImageUrl)
    setCurrentStep("process")
    processImage(maskedImageUrl)
  }

  const processImage = async (maskedImageUrl: string) => {
    if (!uploadedImage || !selectedTexture || !maskedImageUrl) {
      toast({
        title: "Lỗi",
        description: "Thiếu thông tin cần thiết để xử lý hình ảnh",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResultImage(null)

    try {
      // Chuyển đổi tên sản phẩm thành đường dẫn ảnh
      const extractCodeFromName = (name: string): string => {
        const match = name.match(/^C(\d+)/)
        if (match && match[1]) {
          return `C${match[1]}` // Trả về mã số với tiền tố "C"
        }
        return name.split(' ')[0] // Fallback nếu không tìm thấy mã số
      }

      const productCode = extractCodeFromName(selectedTexture.name)
      const textureImageUrl = `/product_images/${productCode}.jpg`

      // Chuyển đổi ảnh từ đường dẫn thành base64
      const textureImageBase64 = await fetch(textureImageUrl)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))

      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        originalImage: uploadedImage,
        textureImage: textureImageBase64, // Sử dụng base64 thay vì đường dẫn
        maskedImage: maskedImageUrl,
      }

      // Gọi API xử lý ảnh với timeout 3 phút
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 180000) // 3 phút timeout

      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()

      if (!data.resultUrl) {
        throw new Error('Không tìm thấy URL kết quả')
      }

      // Hoàn thành tiến trình
      setProgress(100)

      // Đợi 1 giây để hiển thị 100% trước khi chuyển sang kết quả
      setTimeout(() => {
        setResultImage(data.resultUrl)
        setCurrentStep("result")
        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      console.error("Error processing image with Tensor Art:", error)
      setIsProcessing(false)
      setProgress(0)
      setResultImage(null)
      let errorMessage = "Không thể kết nối đến máy chủ Tensor Art. Vui lòng thử lại sau."

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Lỗi xử lý ảnh",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const steps = [
    { id: "upload", label: "Tải lên" },
    { id: "select", label: "Chọn kết cấu" },
    { id: "mask", label: "Tạo mặt nạ" },
    { id: "process", label: "Xử lý" },
    { id: "result", label: "Kết quả" },
  ]

  const getStepIndex = (step: Exclude<Step, "welcome">) => {
    return steps.findIndex((s) => s.id === step)
  }

  const currentStepIndex = currentStep === "welcome" ? -1 : getStepIndex(currentStep as Exclude<Step, "welcome">)

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeScreen onStart={handleStart} />
      case "upload":
        return <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
      case "select":
        return (
          <TextureGallery
            onTextureSelect={(texture) => handleTextureSelect({ ...texture, url: texture.code })}
            uploadedImage={uploadedImage}
            productGroups={Object.entries(productGroups).reduce((acc, [key, value]) => ({
              ...acc,
              [key]: value.map(v => ({ ...v, code: v.name.toLowerCase().replace(/\s+/g, '_') }))
            }), {})}
          />
        )
      case "mask":
        return (
          <ImageMasking
            uploadedImage={uploadedImage!}
            selectedTexture={selectedTexture!}
            onMaskComplete={handleMaskComplete}
          />
        )
      case "process":
        return (
          <ProcessingScreen
            progress={progress}
            textureName={selectedTexture?.name || ""}
            textureQuote={selectedTexture?.quote || ""}
            isSimulated={isSimulated}
          />
        )
      case "result":
        return (
          <ResultDisplay
            resultImage={resultImage!}
            textureName={selectedTexture?.name || ""}
            textureQuote={selectedTexture?.quote || ""}
            isSimulated={isSimulated}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress steps - chỉ hiển thị khi không ở màn hình welcome */}
      {currentStep !== "welcome" && (
        <div className="mb-6 sm:mb-8">
          <div className="hidden sm:flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-sm font-medium ${index <= currentStepIndex ? "text-blue-900" : "text-gray-400"}`}
              >
                {step.label}
              </div>
            ))}
          </div>
          <div className="flex sm:hidden justify-between mb-2">
            <div className="text-sm font-medium text-blue-900">
              {steps[currentStepIndex].label}
            </div>
            <div className="text-sm text-gray-500">
              Bước {currentStepIndex + 1}/{steps.length}
            </div>
          </div>
          <Progress value={(currentStepIndex / (steps.length - 1)) * 100} className="h-2 bg-gray-200" />
        </div>
      )}

      {/* Content */}
      <Card className="p-3 sm:p-6 shadow-lg border-gray-200">
        {renderStepContent()}

        {/* Navigation buttons - chỉ hiển thị khi không ở màn hình welcome hoặc process */}
        {currentStep !== "welcome" && currentStep !== "process" && currentStep !== "result" && (
          <div className="flex justify-between mt-6">
            {currentStep !== "upload" && (
              <Button
                variant="outline"
                onClick={() => {
                  const prevIndex = Math.max(0, currentStepIndex - 1)
                  setCurrentStep(steps[prevIndex].id as Step)
                }}
                disabled={isProcessing}
                className="text-sm sm:text-base"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
                <span className="sm:hidden">Lại</span>
              </Button>
            )}

            {currentStep === "upload" && uploadedImage && (
              <Button
                className="ml-auto bg-blue-900 hover:bg-blue-800 text-sm sm:text-base"
                onClick={() => setCurrentStep("select")}
              >
                <span className="hidden sm:inline">Tiếp theo</span>
                <span className="sm:hidden">Tiếp</span>
                <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

