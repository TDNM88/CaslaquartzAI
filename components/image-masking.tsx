"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Brush, Eraser, Undo, Redo, RotateCcw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ImageMaskingProps {
  uploadedImage: string
  selectedTexture: { url: string; name: string; quote: string }
  onMaskComplete: (maskedImageUrl: string) => void
}

export default function ImageMasking({ uploadedImage, selectedTexture, onMaskComplete }: ImageMaskingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null) // Canvas riêng cho mask
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [brushSize, setBrushSize] = useState(50)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isMaskApplied, setIsMaskApplied] = useState(false)
  const { toast } = useToast()

  // Thêm state cho zoom và pan
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Khởi tạo canvas khi component được mount
  useEffect(() => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    // Tải hình ảnh đã upload lên canvas chính
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
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
      maskCanvas.width = img.width
      maskCanvas.height = img.height

      // Vẽ hình ảnh lên canvas chính
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Khởi tạo mask canvas với nền đen
      maskCtx.fillStyle = "black"
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)

      // Lưu trạng thái ban đầu vào history
      saveToHistory()
    }
    img.src = uploadedImage
  }, [uploadedImage])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    setIsDrawing(true)
    setIsMaskApplied(true)

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Vẽ trên canvas chính (hiển thị cho người dùng)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = tool === "brush" ? "white" : "black"
    ctx.globalCompositeOperation = "source-over"

    // Vẽ trên mask canvas (lưu mask thực tế)
    maskCtx.beginPath()
    maskCtx.moveTo(x, y)
    maskCtx.lineWidth = brushSize
    maskCtx.lineCap = "round"
    maskCtx.lineJoin = "round"
    maskCtx.strokeStyle = tool === "brush" ? "white" : "black"
    maskCtx.globalCompositeOperation = "source-over"
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Áp dụng transform
    const x = (e.clientX - rect.left - offset.x) * scaleX / scale;
    const y = (e.clientY - rect.top - offset.y) * scaleY / scale;

    ctx.lineTo(x, y)
    ctx.stroke()

    maskCtx.lineTo(x, y)
    maskCtx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    ctx.closePath()
    maskCtx.closePath()
    setIsDrawing(false)

    saveToHistory()
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const dataURL = canvas.toDataURL()
    const maskDataURL = maskCanvas.toDataURL()

    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }

    setHistory([...history.slice(0, historyIndex + 1), `${dataURL}|${maskDataURL}`])
    setHistoryIndex(historyIndex + 1)
  }

  const undo = () => {
    if (historyIndex <= 0) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const [dataURL, maskDataURL] = history[newIndex].split("|")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = dataURL

    const maskImg = new Image()
    maskImg.crossOrigin = "anonymous"
    maskImg.onload = () => {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      maskCtx.drawImage(maskImg, 0, 0, maskCanvas.width, maskCanvas.height)
    }
    maskImg.src = maskDataURL
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const [dataURL, maskDataURL] = history[newIndex].split("|")
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = dataURL

    const maskImg = new Image()
    maskImg.crossOrigin = "anonymous"
    maskImg.onload = () => {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      maskCtx.drawImage(maskImg, 0, 0, maskCanvas.width, maskCanvas.height)
    }
    maskImg.src = maskDataURL
  }

  const resetCanvas = () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      maskCtx.fillStyle = "black"
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)

      saveToHistory()
    }
    img.src = uploadedImage
  }

  const handleComplete = async () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return

    try {
      const finalMaskData = maskCanvas.toDataURL("image/png")
      console.log("Final Mask Data:", finalMaskData)
      onMaskComplete(finalMaskData)

      toast({
        title: "Thành công",
        description: "Mask đã được tạo và gửi đi",
      })
    } catch (error) {
      console.error("Error creating masked image:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo hình ảnh đã mask",
        variant: "destructive",
      })
    }
  }

  // Xử lý touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      }) as unknown as React.MouseEvent<HTMLCanvasElement>;
      startDrawing(mouseEvent);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY,
      }) as unknown as React.MouseEvent<HTMLCanvasElement>;
      draw(mouseEvent);
    }
  };

  const handleTouchEnd = () => {
    stopDrawing();
  };

  // Xử lý pinch-to-zoom
  const handleTouchMoveMulti = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const dist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (initialDistance.current > 0) {
        const newScale = scale * (dist / initialDistance.current);
        setScale(Math.min(Math.max(newScale, 0.5), 3));
      }
      initialDistance.current = dist;
    }
  };

  // Thêm transform vào canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);
  }, [scale, offset]);

  function extractCodeFromName(name: string): string {
    const match = name.match(/^C(\d+)/)
    if (match && match[1]) {
      return `C${match[1]}`
    }
    return name.split(" ")[0]
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Tạo mặt nạ</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Sử dụng công cụ cọ để đánh dấu các khu vực bạn muốn áp dụng kết cấu đá thạch anh. Dùng công cụ tẩy để xóa các
          phần không mong muốn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-3 sm:space-y-4 order-2 md:order-1">
          <div className="p-3 sm:p-4 border rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Kết cấu đã chọn</h3>
            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
              <img
                src={`https://raw.githubusercontent.com/TDNM88/cqfinal/refs/heads/main/public/product_images/${extractCodeFromName(selectedTexture.name)}.jpg`}
                alt={selectedTexture.name}
                className="max-h-full max-w-full rounded object-cover"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{selectedTexture.name}</p>
          </div>

          <div className="p-3 sm:p-4 border rounded-lg">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Công cụ</h3>

            <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                className={`text-xs sm:text-sm ${tool === "brush" ? "bg-blue-900" : ""}`}
                onClick={() => setTool("brush")}
              >
                <Brush className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Cọ
              </Button>

              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                className={`text-xs sm:text-sm ${tool === "eraser" ? "bg-blue-900" : ""}`}
                onClick={() => setTool("eraser")}
              >
                <Eraser className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Tẩy
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 block mb-1">
                  Kích thước cọ: {brushSize}px
                </label>
                <Slider
                  value={[brushSize]}
                  min={10}
                  max={150}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} className="text-xs sm:text-sm">
                  <Undo className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Hoàn tác</span>
                  <span className="sm:hidden">Hoàn</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="text-xs sm:text-sm"
                >
                  <Redo className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Làm lại</span>
                  <span className="sm:hidden">Lại</span>
                </Button>
              </div>

              <Button variant="outline" onClick={resetCanvas} className="w-full text-xs sm:text-sm">
                <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Đặt lại
              </Button>
            </div>
          </div>

          <Button onClick={handleComplete} className="w-full bg-blue-900 hover:bg-blue-800 text-xs sm:text-sm">
            Hoàn thành và xử lý
          </Button>
        </div>

        <div className="md:col-span-3 order-1 md:order-2" ref={containerRef}>
          <div className="border rounded-lg overflow-hidden bg-gray-100 relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                if (e.touches.length === 1) {
                  handleTouchMove(e);
                } else {
                  handleTouchMoveMulti(e);
                }
              }}
              onTouchEnd={handleTouchEnd}
              className="max-w-full cursor-crosshair touch-none"
              style={{
                width: "100%",
                height: canvasSize.height > 0 ? canvasSize.height : "auto",
                objectFit: "contain",
              }}
            />
            {/* Canvas mask ẩn đi */}
            <canvas ref={maskCanvasRef} style={{ display: "none" }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Vẽ lên các khu vực bạn muốn thay đổi kết cấu. Màu trắng biểu thị vùng sẽ được áp dụng kết cấu đá thạch anh.
          </p>

          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm sm:text-base font-medium text-blue-900 mb-1 sm:mb-2">Hướng dẫn</h4>
            <ul className="text-xs sm:text-sm text-blue-800 list-disc pl-4 sm:pl-5 space-y-1">
              <li>
                Sử dụng công cụ <strong>Cọ</strong> để đánh dấu các khu vực bạn muốn áp dụng kết cấu đá thạch anh
              </li>
              <li>
                Sử dụng công cụ <strong>Tẩy</strong> để xóa các phần đã đánh dấu không mong muốn
              </li>
              <li>
                Điều chỉnh <strong>Kích thước cọ</strong> để có thể vẽ chi tiết hơn
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}