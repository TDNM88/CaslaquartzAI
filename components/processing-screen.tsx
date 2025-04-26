"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Info, CheckCircle2, AlertTriangle } from "lucide-react"

interface ProcessingScreenProps {
  progress: number
  textureName: string
  textureQuote: string
  isSimulated?: boolean
  isComplete?: boolean // Báo hiệu khi có kết quả
}

export default function ProcessingScreen({
  textureName,
  textureQuote,
  isSimulated = false,
  isComplete = false,
}: ProcessingScreenProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [activeTab, setActiveTab] = useState("info")
  const [processingStage, setProcessingStage] = useState(1)
  const [internalProgress, setInternalProgress] = useState(0) // Tiến trình nội bộ

  // Dữ liệu quảng cáo mẫu
  const ads = [
    {
      id: 1,
      title: "Đá thạch anh cao cấp CaslaQuartz",
      description:
        "Bề mặt siêu bền, chống trầy xước và kháng khuẩn tuyệt đối. Lý tưởng cho mặt bàn bếp và phòng tắm hiện đại.",
      imageUrl:
        "https://i.ibb.co/nsyZ46vk/C5242-1.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Đá thạch anh CaslaQuartz - Sản phẩm Việt Nam",
      description:
        "Đa dạng màu sắc, phù hợp với mọi không gian nội thất. Sản xuất tại Việt Nam với công nghệ tiên tiến nhất.",
      imageUrl:
        "https://i.ibb.co/nsyZ46vk/C5233-3.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Đá thạch anh nhân tạo CaslaQuartz - Đẳng cấp quốc tế",
      description: "Chất lượng quốc tế. Độ bền vượt trội và thiết kế đẳng cấp cho không gian sang trọng.",
      imageUrl:
        "https://i.ibb.co/RTqD9qvY/C4348-0.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Dịch vụ thi công đá thạch anh CaslaQuartz chuyên nghiệp",
      description:
        "Đội ngũ thợ lành nghề, thi công nhanh chóng, chính xác. Bảo hành dài hạn, hỗ trợ 24/7 cho mọi nhu cầu.",
      image:
        "https://caslaquartz.com/pictures/catalog/home/products/pro-4204.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ]

  // Các giai đoạn xử lý
  const processingStages = [
    {
      id: 1,
      name: "Phân tích hình ảnh",
      description: "Hệ thống đang phân tích hình ảnh của bạn và chuẩn bị các thông số cần thiết.",
    },
    {
      id: 2,
      name: "Áp dụng kết cấu",
      description: "Đang áp dụng kết cấu đá thạch anh CaslaQuartz vào khu vực đã đánh dấu.",
    },
    {
      id: 3,
      name: "Tối ưu hóa kết quả",
      description: "Đang điều chỉnh ánh sáng, bóng đổ và các chi tiết để tạo kết quả chân thực nhất.",
    },
    { id: 4, name: "Hoàn thiện", description: "Đang hoàn thiện và chuẩn bị kết quả cuối cùng cho bạn." },
  ]

  // Tự động chuyển quảng cáo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [ads.length])

  // Cập nhật thời gian đã trôi qua
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Logic tự động tăng tiến trình
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isComplete) {
      // Khi có kết quả, đặt progress thành 100%
      setInternalProgress(100)
    } else {
      // Giai đoạn 1: Tăng từ 0% đến 90% trong 60 giây
      if (elapsedTime < 60) {
        interval = setInterval(() => {
          setInternalProgress((prev) => {
            const step = 90 / 60000 // Tăng đều trong 60 giây
            return Math.min(prev + step * 1000, 90) // Cập nhật mỗi 1 giây
          })
        }, 1000)
      }
      // Giai đoạn 2: Tăng từ 90% đến 95% trong 20 giây tiếp theo
      else if (elapsedTime >= 60 && elapsedTime < 80) {
        interval = setInterval(() => {
          setInternalProgress((prev) => {
            const step = 5 / 20000 // Tăng đều trong 20 giây
            return Math.min(prev + step * 1000, 95)
          })
        }, 1000)
      }
      // Giai đoạn 3: Dừng ở 95% cho đến khi có kết quả
      else if (elapsedTime >= 80) {
        setInternalProgress(95)
      }
    }

    return () => clearInterval(interval)
  }, [elapsedTime, isComplete])

  // Cập nhật giai đoạn xử lý dựa trên tiến trình
  useEffect(() => {
    if (internalProgress < 25) {
      setProcessingStage(1)
    } else if (internalProgress < 50) {
      setProcessingStage(2)
    } else if (internalProgress < 75) {
      setProcessingStage(3)
    } else {
      setProcessingStage(4)
    }
  }, [internalProgress])

  // Format thời gian
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  // Ước tính thời gian còn lại
  const estimatedTotalTime = isSimulated ? 30 : 180 // 30 giây cho mô phỏng, 3 phút cho API thực
  const remainingTime = Math.max(0, estimatedTotalTime - elapsedTime)
  const remainingTimeFormatted = formatTime(remainingTime)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Đang xử lý hình ảnh</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Vui lòng đợi trong khi chúng tôi áp dụng kết cấu {textureName} vào hình ảnh của bạn
        </p>
      </div>

      {isSimulated && (
        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-yellow-700">
            Đang sử dụng chế độ mô phỏng do không thể kết nối đến máy chủ Tensor Art. Kết quả có thể không chính xác như
            khi sử dụng API xử lý hình ảnh AI.
          </p>
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span>Thời gian đã trôi qua: {formatTime(elapsedTime)}</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Ước tính còn lại: {remainingTimeFormatted}</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Tiến trình xử lý</span>
            <span>{Math.round(internalProgress)}%</span>
          </div>
          <Progress value={internalProgress} className="h-2" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-xs sm:text-sm text-gray-600">
            Đang xử lý:{" "}
            <span className="font-medium">{processingStages.find((stage) => stage.id === processingStage)?.name}</span>
          </p>
          <div className="flex gap-2">
            {processingStages.map((stage) => (
              <div
                key={stage.id}
                className={`w-2 h-2 rounded-full ${
                  stage.id === processingStage
                    ? "bg-blue-900"
                    : stage.id < processingStage
                      ? "bg-blue-300"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs sm:text-sm text-blue-800">
            {processingStages.find((stage) => stage.id === processingStage)?.description}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="text-xs sm:text-sm">
            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Thông tin</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="text-xs sm:text-sm">
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Tính năng</span>
            <span className="sm:hidden">Tính năng</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Sản phẩm</span>
            <span className="sm:hidden">Sản phẩm</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="pt-3 sm:pt-4">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Về kết cấu đá thạch anh đã chọn</h3>
            <p className="text-xs sm:text-sm text-gray-700">{textureQuote}</p>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm sm:text-base font-medium text-blue-900 mb-1 sm:mb-2">Lưu ý về thời gian xử lý</h4>
              <p className="text-xs sm:text-sm text-blue-800">
                {isSimulated
                  ? "Đang sử dụng chế độ mô phỏng, quá trình xử lý sẽ nhanh hơn bình thường. Kết quả có thể không chính xác như khi sử dụng Tensor Art API."
                  : "Quá trình xử lý có thể mất từ 2-3 phút tùy thuộc vào độ phức tạp của hình ảnh và kết cấu được chọn. Vui lòng không đóng trình duyệt trong quá trình này."}{" "}
                Bạn có thể xem thêm thông tin về sản phẩm CaslaQuartz trong khi chờ đợi.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="features" className="pt-3 sm:pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4 border-gray-200">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Độ bền vượt trội</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Đá thạch anh nhân tạo CaslaQuartz có độ cứng cao, chống trầy xước và chịu được tác động mạnh, lý tưởng
                cho các không gian có tần suất sử dụng cao.
              </p>
            </Card>

            <Card className="p-3 sm:p-4 border-gray-200">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Kháng khuẩn tự nhiên</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Bề mặt không lỗ rỗng giúp ngăn chặn sự phát triển của vi khuẩn và nấm mốc, đảm bảo vệ sinh cho không
                gian sống.
              </p>
            </Card>

            <Card className="p-3 sm:p-4 border-gray-200">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Dễ dàng bảo quản</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                Không cần đánh bóng định kỳ, chỉ cần lau chùi đơn giản với nước và xà phòng trung tính để duy trì vẻ đẹp
                lâu dài.
              </p>
            </Card>

            <Card className="p-3 sm:p-4 border-gray-200">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">Đa dạng màu sắc</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                CaslaQuartz cung cấp đa dạng màu sắc và họa tiết, từ vân đá cẩm thạch tinh tế đến các tông màu đồng
                nhất, phù hợp với mọi phong cách thiết kế.
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="pt-3 sm:pt-4">
          <div className="py-2 sm:py-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-6 text-center">
              Khám phá các sản phẩm đá thạch anh CaslaQuartz
            </h3>

            <Card className="overflow-hidden border-gray-200">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <img
                  src={ads[currentAdIndex].imageUrl || "/placeholder.svg"}
                  alt={ads[currentAdIndex].title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 sm:p-4">
                <h4 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{ads[currentAdIndex].title}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{ads[currentAdIndex].description}</p>
              </div>
            </Card>

            <div className="flex justify-center mt-3 sm:mt-4">
              {ads.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${index === currentAdIndex ? "bg-blue-900" : "bg-gray-300"}`}
                  onClick={() => setCurrentAdIndex(index)}
                  aria-label={`Xem quảng cáo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Hiển thị thông báo hoàn tất khi tiến trình đạt 100% */}
      {isComplete && internalProgress === 100 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="text-sm text-green-700">Xử lý hoàn tất! Kết quả đã sẵn sàng để hiển thị.</p>
        </div>
      )}
    </div>
  )
}
