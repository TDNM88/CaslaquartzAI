"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, CheckCircle2 } from "lucide-react"

interface WelcomeScreenProps {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Chào mừng đến với CaslaQuartz",
      description: "Ứng dụng mô phỏng đá thạch anh CaslaQuartz cho không gian nội thất của bạn",
      image:
        "https://i.ibb.co/vxCng8YD/G5233-3.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      features: [
        "Tải lên hình ảnh không gian nội thất của bạn",
        "Chọn từ 43 mẫu đá thạch anh CaslaQuartz cao cấp",
        "Xem trước kết quả trước khi thi công thực tế",
        "Dễ dàng chia sẻ và lưu thiết kế của bạn",
      ],
    },
    {
      title: "Quy trình đơn giản",
      description: "Chỉ với vài bước đơn giản, bạn có thể thấy không gian của mình được biến đổi",
      image:
        "https://i.ibb.co/B5zqFz5m/G5233-5.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      steps: [
        "Tải lên hình ảnh không gian của bạn",
        "Chọn mẫu đá thạch anh CaslaQuartz yêu thích",
        "Đánh dấu khu vực bạn muốn áp dụng",
        "Xem kết quả và chia sẻ thiết kế của bạn",
      ],
    },
    {
      title: "Bắt đầu ngay",
      description: "Hãy biến không gian của bạn thành tuyệt tác với đá thạch anh CaslaQuartz",
      image:
        "https://i.ibb.co/ccKnMdLx/G5233-3.jpgixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      benefits: [
        "Độ bền vượt trội, chống trầy xước",
        "Kháng khuẩn tự nhiên, an toàn cho gia đình",
        "Đa dạng màu sắc và họa tiết",
        "Dễ dàng vệ sinh và bảo quản",
      ],
    },
  ]

  const currentSlideData = slides[currentSlide]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onStart()
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-gray-200 shadow-lg">
        <div className="aspect-video relative">
          <img
            src={currentSlideData.image || "/placeholder.svg"}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{currentSlideData.title}</h1>
            <p className="text-base sm:text-lg">{currentSlideData.description}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {currentSlideData.features && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Tính năng chính</h2>
              <ul className="space-y-2">
                {currentSlideData.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-900 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentSlideData.steps && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Các bước thực hiện</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSlideData.steps.map((step, index) => (
                  <div key={index} className="flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-900 text-white flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm sm:text-base">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentSlideData.benefits && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lợi ích của đá thạch anh CaslaQuartz</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSlideData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-blue-900 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="flex space-x-1">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-blue-900" : "bg-gray-300"}`}
                />
              ))}
            </div>

            <Button onClick={nextSlide} className="bg-blue-900 hover:bg-blue-800">
              {currentSlide === slides.length - 1 ? "Bắt đầu ngay" : "Tiếp theo"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

