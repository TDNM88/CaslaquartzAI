import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/toaster"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "CaslaQuartz - Mô phỏng đá thạch anh",
  description: "Ứng dụng cho phép người dùng áp dụng kết cấu đá thạch anh CaslaQuartz vào không gian kiến trúc nội thất",
  // ↓↓↓ Thêm cấu hình icons ở đây ↓↓↓
  icons: {
    icon: [
      { url: "/favicon.ico" }, // Standard favicon
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }, // Apple touch icon (180x180)
    ],
    other: [
      {
        rel: "icon",
        url: "/icon-192x192.png", // Android PWA icon
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/icon-512x512.png", // Larger PWA icon
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json", // PWA manifest
  themeColor: "#FFFFFF",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className="antialiased">
      <body className={`${beVietnamPro.className} min-h-screen text-gray-900 overflow-x-hidden`}>
        {children}
        <Toaster />
        <footer className="py-4 text-center text-sm text-gray-500 border-t">
          Ứng dụng này thuộc bản quyền của{' '}
          <a href="https://caslastone.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Caslquartz Vietnam
          </a>
        </footer>
      </body>
    </html>
  )
}
