"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Share2, Check, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ResultDisplayProps {
  resultImage: string
  textureName: string
  textureQuote: string
  isSimulated?: boolean
}

export default function ResultDisplay({
  resultImage,
  textureName,
  textureQuote,
  isSimulated = false,
}: ResultDisplayProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    try {
      const link = document.createElement("a")
      link.href = resultImage
      link.download = `casla-quartz-${textureName.toLowerCase().replace(/\s+/g, "-")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Tải xuống thành công",
        description: "Hình ảnh đã được tải xuống thành công",
      })
    } catch (error) {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống hình ảnh",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    setShowShareOptions(!showShareOptions)
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(resultImage)
      toast({
        title: "Đã sao chép",
        description: "Đường dẫn hình ảnh đã được sao chép vào clipboard",
        action: <Check className="h-4 w-4 text-green-500" />,
      })
    } catch (error) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép đường dẫn",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Kết quả</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Hình ảnh của bạn đã được xử lý thành công với kết cấu {textureName}!
        </p>
      </div>

      {isSimulated && (
        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-yellow-700">
            Kết quả này được tạo bằng chế độ mô phỏng do không thể kết nối đến máy chủ Tensor Art. Chất lượng có thể
            không tốt như khi sử dụng API xử lý hình ảnh AI.
          </p>
        </div>
      )}

      <Card className="overflow-hidden border-gray-200">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <img src={resultImage || "/placeholder.svg"} alt="Kết quả" className="max-h-full max-w-full object-contain" />
        </div>
      </Card>

      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm sm:text-base font-medium text-blue-900 mb-1 sm:mb-2">Thông tin về kết cấu đã chọn</h3>
        <p className="text-xs sm:text-sm text-blue-800">{textureQuote}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button onClick={handleDownload} className="bg-blue-900 hover:bg-blue-800 text-xs sm:text-sm">
          <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Tải xuống hình ảnh chất lượng cao</span>
          <span className="sm:hidden">Tải xuống</span>
        </Button>

        <Button variant="outline" onClick={handleShare} className="text-xs sm:text-sm">
          <Share2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Chia sẻ
        </Button>
      </div>

      {showShareOptions && (
        <Card className="p-3 sm:p-4 border-gray-200">
          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 sm:mb-3">Chia sẻ kết quả</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Button variant="outline" className="flex flex-col items-center h-auto py-2 sm:py-3 text-xs sm:text-sm">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1 sm:mb-2">
                <span className="text-blue-900 font-bold">f</span>
              </div>
              <span>Facebook</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center h-auto py-2 sm:py-3 text-xs sm:text-sm">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1 sm:mb-2">
                <span className="text-blue-900 font-bold">in</span>
              </div>
              <span>LinkedIn</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center h-auto py-2 sm:py-3 text-xs sm:text-sm"
              onClick={handleCopyLink}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center mb-1 sm:mb-2">
                <span className="text-blue-900 font-bold">🔗</span>
              </div>
              <span>Sao chép</span>
            </Button>
          </div>
        </Card>
      )}

      <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border border-gray-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-4">Bạn có thích kết quả không?</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
          Hãy liên hệ với chúng tôi để được tư vấn về các sản phẩm đá thạch anh CaslaQuartz phù hợp với không gian của
          bạn. Chúng tôi cung cấp dịch vụ tư vấn miễn phí và báo giá chi tiết.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button className="bg-blue-900 hover:bg-blue-800 text-xs sm:text-sm">Liên hệ tư vấn</Button>
          <Button variant="outline" className="text-xs sm:text-sm">
            Xem thêm mẫu đá thạch anh CaslaQuartz
          </Button>
        </div>
      </div>
    </div>
  )
}

