"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"

interface ProcessingScreenProps {
  progress: number
  textureName: string
}

export default function ProcessingScreen({ progress, textureName }: ProcessingScreenProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [processingStage, setProcessingStage] = useState(1)

  // Dữ liệu quảng cáo mẫu
  const ads = [
    {
      id: 1,
      title: "Đá thạch anh cao cấp CaslaQuartz",
      description:
        "Bề mặt siêu bền, chống trầy xước và kháng khuẩn tuyệt đối. Lý tưởng cho mặt bàn bếp và phòng tắm hiện đại.",
      imageUrl:
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Đá thạch anh CaslaQuartz",
      description:
        "Đa dạng màu sắc, phù hợp với mọi không gian nội thất. Sản xuất tại Việt Nam với công nghệ tiên tiến nhất.",
      imageUrl:
        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Đá thạch anh nhân tạo Caesarstone - Đẳng cấp quốc tế",
      description:
        "Nhập khẩu chính hãng, chất lượng quốc tế. Độ bền vượt trội và thiết kế đẳng cấp cho không gian sang trọng.",
      imageUrl:
        "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Dịch vụ thi công đá thạch anh chuyên nghiệp",
      description:
        "Đội ngũ thợ lành nghề, thi công nhanh chóng, chính xác. Bảo hành dài hạn, hỗ trợ 24/7 cho mọi nhu cầu.",
      imageUrl:
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ]

  // Các giai đoạn xử lý
  const processingStages = [
    { id: 1, name: "Phân tích hình ảnh" },
    { id: 2, name: "Áp dụng kết cấu" },
    { id: 3, name: "Tối ưu hóa kết quả" },
    { id: 4, name: "Hoàn thiện" },
  ]

  // Tự động chuyển quảng cáo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [ads.length])

  // Cập nhật giai đoạn xử lý dựa trên tiến trình
  useEffect(() => {
    if (progress < 25) {
      setProcessingStage(1)
    } else if (progress < 50) {
      setProcessingStage(2)
    } else if (progress < 75) {
      setProcessingStage(3)
    } else {
      setProcessingStage(4)
    }
  }, [progress])

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến trình xử lý</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-sm text-gray-600">
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
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Đang xử lý:</strong> Chúng tôi đang áp dụng kết cấu {textureName} vào hình ảnh của bạn. Quá trình này
          có thể mất từ 30 giây đến 2 phút tùy thuộc vào độ phức tạp của hình ảnh. Vui lòng không đóng trình duyệt trong
          quá trình này.
        </p>
      </div>

      <div className="py-4">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Khám phá các sản phẩm đá thạch anh nhân tạo
        </h3>

        <Card className="overflow-hidden border-gray-200">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <img
              src={ads[currentAdIndex].imageUrl || "/placeholder.svg"}
              alt={ads[currentAdIndex].title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4">
            <h4 className="font-bold text-lg text-gray-900 mb-2">{ads[currentAdIndex].title}</h4>
            <p className="text-gray-600">{ads[currentAdIndex].description}</p>
          </div>
        </Card>

        <div className="flex justify-center mt-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Độ bền vượt trội</h4>
          <p className="text-sm text-gray-600">
            Đá thạch anh nhân tạo có độ cứng cao, chống trầy xước và chịu được tác động mạnh, lý tưởng cho các không
            gian có tần suất sử dụng cao.
          </p>
        </Card>

        <Card className="p-4 border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Kháng khuẩn tự nhiên</h4>
          <p className="text-sm text-gray-600">
            Bề mặt không lỗ rỗng giúp ngăn chặn sự phát triển của vi khuẩn và nấm mốc, đảm bảo vệ sinh cho không gian
            sống.
          </p>
        </Card>

        <Card className="p-4 border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Dễ dàng bảo quản</h4>
          <p className="text-sm text-gray-600">
            Không cần đánh bóng định kỳ, chỉ cần lau chùi đơn giản với nước và xà phòng trung tính để duy trì vẻ đẹp lâu
            dài.
          </p>
        </Card>
      </div>
    </div>
  )
}

