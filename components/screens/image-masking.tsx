"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Brush, Eraser, Undo, Redo, RotateCcw, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"

interface ImageMaskingProps {
  uploadedImage: string
  selectedTexture: { url: string; name: string; id: number }
  onMaskComplete: (maskedImageUrl: string) => void
}

export default function ImageMasking({ uploadedImage, selectedTexture, onMaskComplete }: ImageMaskingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [brushSize, setBrushSize] = useState(20)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isMaskApplied, setIsMaskApplied] = useState(false)
  const { toast } = useToast()

  // Khởi tạo canvas khi component được mount
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Tải hình ảnh đã upload lên canvas
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // Tính toán kích thước canvas để vừa với container
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const aspectRatio = img.height / img.width
      const canvasWidth = containerWidth
      const canvasHeight = containerWidth * aspectRatio

      // Cập nhật kích thước canvas
      setCanvasSize({ width: canvasWidth, height: canvasHeight })
      canvas.width = img.width
      canvas.height = img.height

      // Vẽ hình ảnh lên canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Lưu trạng thái ban đầu vào history
      saveToHistory()
    }
    img.src = uploadedImage
  }, [uploadedImage])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    setIsMaskApplied(true)

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    ctx.beginPath()
    ctx.moveTo(x, y)

    // Thiết lập thuộc tính cọ vẽ
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    if (tool === "brush") {
      ctx.strokeStyle = "rgba(0, 0, 255, 0.5)" // Màu xanh bán trong suốt cho mask
      ctx.globalCompositeOperation = "source-over"
    } else {
      ctx.strokeStyle = "rgba(0, 0, 0, 0)"
      ctx.globalCompositeOperation = "destination-out" // Chế độ tẩy
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.closePath()
    setIsDrawing(false)

    // Lưu trạng thái hiện tại vào history
    saveToHistory()
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Lấy trạng thái canvas hiện tại
    const dataURL = canvas.toDataURL()

    // Nếu không ở cuối history, xóa các trạng thái tương lai
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }

    // Thêm trạng thái hiện tại vào history
    setHistory([...history.slice(0, historyIndex + 1), dataURL])
    setHistoryIndex(historyIndex + 1)
  }

  const undo = () => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Lùi lại một bước trong history
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    // Tải trạng thái trước đó
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = history[newIndex]

    // Kiểm tra nếu đã quay lại trạng thái ban đầu
    if (newIndex === 0) {
      setIsMaskApplied(false)
    }
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Tiến tới một bước trong history
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setIsMaskApplied(true)

    // Tải trạng thái tiếp theo
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = history[newIndex]
  }

  const resetCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Xóa canvas và vẽ lại hình ảnh gốc
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Lưu trạng thái này vào history
      setHistory([history[0]])
      setHistoryIndex(0)
      setIsMaskApplied(false)
    }
    img.src = uploadedImage
  }

  const handleComplete = () => {
    if (!isMaskApplied) {
      toast({
        title: "Cần tạo mặt nạ",
        description: "Vui lòng sử dụng công cụ cọ để đánh dấu các khu vực bạn muốn áp dụng kết cấu đá thạch anh",
        variant: "destructive",
      })
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    try {
      // Lấy hình ảnh đã mask
      const maskedImageUrl = canvas.toDataURL("image/png")
      onMaskComplete(maskedImageUrl)
    } catch (error) {
      console.error("Error creating masked image:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo hình ảnh đã mask",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4" ref={containerRef}>
          <div className="border rounded-lg overflow-hidden bg-gray-100 relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="max-w-full cursor-crosshair"
              style={{
                width: "100%",
                height: canvasSize.height > 0 ? canvasSize.height : "auto",
                objectFit: "contain",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Vẽ lên các khu vực bạn muốn thay đổi kết cấu. Màu xanh biểu thị vùng sẽ được áp dụng kết cấu đá thạch anh.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} size="sm">
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1} size="sm">
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={resetCanvas} size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="md:w-1/4 space-y-4">
          <Card className="p-4 border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Công cụ</h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                className={tool === "brush" ? "bg-blue-900" : ""}
                onClick={() => setTool("brush")}
              >
                <Brush className="mr-2 h-4 w-4" />
                Cọ
              </Button>

              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                className={tool === "eraser" ? "bg-blue-900" : ""}
                onClick={() => setTool("eraser")}
              >
                <Eraser className="mr-2 h-4 w-4" />
                Tẩy
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Kích thước cọ: {brushSize}px</label>
                <Slider
                  value={[brushSize]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0])}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Kết cấu đã chọn</h3>
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
              <img
                src={selectedTexture.url || "/placeholder.svg"}
                alt={selectedTexture.name}
                className="max-h-full max-w-full rounded object-cover"
              />
            </div>
            <p className="text-sm text-gray-700">{selectedTexture.name}</p>
          </Card>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-4">
              <li>Sử dụng cọ để đánh dấu các khu vực bạn muốn áp dụng kết cấu đá</li>
              <li>Sử dụng tẩy để xóa các phần không mong muốn</li>
              <li>Điều chỉnh kích thước cọ để có độ chính xác cao hơn</li>
              <li>Sử dụng nút hoàn tác/làm lại nếu cần</li>
            </ul>
          </div>

          <Button onClick={handleComplete} className="w-full bg-blue-900 hover:bg-blue-800">
            Hoàn thành và xử lý
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

