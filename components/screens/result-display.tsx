"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Share2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ResultDisplayProps {
  resultImage: string
  textureName: string
}

export default function ResultDisplay({ resultImage, textureName }: ResultDisplayProps) {
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    try {
      const link = document.createElement("a")
      link.href = resultImage
      link.download = `tensor-art-${textureName.toLowerCase().replace(/\s+/g, "-")}.png`
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
    <div className="space-y-8">
      <Card className="overflow-hidden border-gray-200">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <img
            src={resultImage || "/placeholder.svg"}
            alt="Kết quả"
            className="max-h-full max-w-full object-contain cursor-pointer"
            onClick={() => setShowFullImage(true)}
          />
        </div>
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
          Nhấp vào hình ảnh để xem kích thước đầy đủ
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={handleDownload} className="bg-blue-900 hover:bg-blue-800">
          <Download className="mr-2 h-4 w-4" />
          Tải xuống hình ảnh chất lượng cao
        </Button>

        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Chia sẻ
        </Button>
      </div>

      {showShareOptions && (
        <Card className="p-4 border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Chia sẻ kết quả</h3>
          <div className="grid grid-cols-3 gap-4">
            <Button variant="outline" className="flex flex-col items-center h-auto py-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-900 font-bold">f</span>
              </div>
              <span className="text-sm">Facebook</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center h-auto py-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-900 font-bold">in</span>
              </div>
              <span className="text-sm">LinkedIn</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center h-auto py-3" onClick={handleCopyLink}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-blue-900 font-bold">🔗</span>
              </div>
              <span className="text-sm">Sao chép</span>
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Thông tin kết cấu đá</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Tên kết cấu:</p>
              <p className="text-gray-900">{textureName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Đặc điểm:</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                <li>Độ bền cao, chống trầy xước</li>
                <li>Kháng khuẩn tự nhiên</li>
                <li>Dễ dàng vệ sinh và bảo quản</li>
                <li>Không thấm nước và chống ố vàng</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Ứng dụng phù hợp:</p>
              <p className="text-gray-600 text-sm">Mặt bàn bếp, phòng tắm, bàn ăn, kệ tủ và các bề mặt nội thất khác</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-lg text-blue-900 mb-4">Bạn có thích kết quả không?</h3>
          <p className="text-blue-800 mb-4">
            Hãy liên hệ với chúng tôi để được tư vấn về các sản phẩm đá thạch anh nhân tạo phù hợp với không gian của
            bạn. Chúng tôi cung cấp dịch vụ tư vấn miễn phí và báo giá chi tiết.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-blue-900 hover:bg-blue-800">Liên hệ tư vấn</Button>
            <Button variant="outline" className="border-blue-300 text-blue-900 hover:bg-blue-100">
              Xem thêm mẫu đá thạch anh
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Các dự án tương tự</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="overflow-hidden">
            <div className="aspect-video">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Dự án mẫu 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900">Nhà bếp hiện đại</h4>
              <p className="text-sm text-gray-600">Đá thạch anh trắng Calacatta</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="aspect-video">
              <img
                src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Dự án mẫu 2"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900">Phòng tắm sang trọng</h4>
              <p className="text-sm text-gray-600">Đá thạch anh đen Marquina</p>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="aspect-video">
              <img
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Dự án mẫu 3"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h4 className="font-medium text-gray-900">Quầy bar tinh tế</h4>
              <p className="text-sm text-gray-600">Đá thạch anh vân cẩm thạch</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialog hiển thị hình ảnh kích thước đầy đủ */}
      <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Hình ảnh kết quả</DialogTitle>
            <DialogDescription>Kết cấu {textureName} đã được áp dụng vào hình ảnh của bạn</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-2">
            <img
              src={resultImage || "/placeholder.svg"}
              alt="Kết quả kích thước đầy đủ"
              className="max-h-[70vh] max-w-full object-contain"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFullImage(false)}>
              Đóng
            </Button>
            <Button onClick={handleDownload} className="bg-blue-900 hover:bg-blue-800">
              <Download className="mr-2 h-4 w-4" />
              Tải xuống
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

