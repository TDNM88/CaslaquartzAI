import type { Metadata } from "next"
import ImageEditor from "@/components/image-editor"

export const metadata: Metadata = {
  title: "CaslaQuartz - Mô phỏng đá thạch anh",
  description:
    "Ứng dụng cho phép người dùng áp dụng kết cấu đá thạch anh CaslaQuartz vào không gian kiến trúc nội thất của bạn",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <header className="mb-4 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">CaslaQuartz</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Biến đổi không gian nội thất của bạn với đá thạch anh nhân tạo cao cấp
          </p>
        </header>
        <ImageEditor />
      </div>
    </main>
  )
}

