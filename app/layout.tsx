// app/layout.tsx
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/toaster";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CaslaQuartz - Mô phỏng đá thạch anh",
  description: "Ứng dụng cho phép người dùng áp dụng kết cấu đá thạch anh CaslaQuartz vào không gian kiến trúc nội thất",
  appleWebApp: {
    title: "Casla Quartz",
    capable: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="antialiased">
      <head>
        {/* Thêm thủ công các meta tags nếu cần */}
        <meta name="apple-mobile-web-app-title" content="Casla" />
        <meta name="application-name" content="Casla" />
      </head>
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
  );
}
