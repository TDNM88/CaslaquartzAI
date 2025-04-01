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
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"brush" | "eraser">("brush")
  const [brushSize, setBrushSize] = useState(20) // Giảm kích thước cọ mặc định cho di động
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isMaskApplied, setIsMaskApplied] = useState(false)
  const { toast } = useToast()

  // State cho zoom và pan
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null)
  const initialDistance = useRef<number>(0)

  // Khởi tạo canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.clientWidth
      const containerHeight = window.innerHeight * 0.5 // Giới hạn chiều cao trên di động
      const aspectRatio = img.height / img.width
      let canvasWidth = containerWidth
      let canvasHeight = canvasWidth * aspectRatio

      if (canvasHeight > containerHeight) {
        canvasHeight = containerHeight
        canvasWidth = canvasHeight / aspectRatio
      }

      setCanvasSize({ width: canvasWidth, height: canvasHeight })
      canvas.width = img.width
      canvas.height = img.height
      maskCanvas.width = img.width
      maskCanvas.height = img.height

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      maskCtx.fillStyle = "black"
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)

      saveToHistory()
    }
    img.src = uploadedImage
  }, [uploadedImage])

  // Cập nhật transform khi scale hoặc offset thay đổi
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.translate(offset.x / scale, offset.y / scale)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = uploadedImage
  }, [scale, offset, uploadedImage])

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / (rect.width * scale)
    const scaleY = canvas.height / (rect.height * scale)
    const x = (clientX - rect.left) * scaleX - offset.x / scale
    const y = (clientY - rect.top) * scaleY - offset.y / scale
    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const { x, y } = getCanvasCoordinates(clientX, clientY)

    setIsDrawing(true)
    setIsMaskApplied(true)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = tool === "brush" ? "white" : "black"
    ctx.globalCompositeOperation = "source-over"

    maskCtx.beginPath()
    maskCtx.moveTo(x, y)
    maskCtx.lineWidth = brushSize
    maskCtx.lineCap = "round"
    maskCtx.lineJoin = "round"
    maskCtx.strokeStyle = tool === "brush" ? "white" : "black"
    maskCtx.globalCompositeOperation = "source-over"
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const ctx = canvas.getContext("2d")
    const maskCtx = maskCanvas.getContext("2d")
    if (!ctx || !maskCtx) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const { x, y } = getCanvasCoordinates(clientX, clientY)

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
      setScale(1)
      setOffset({ x: 0, y: 0 })
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

  // Touch events cho vẽ
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (e.touches.length === 1) {
      setIsPanning(false)
      startDrawing(e)
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      setIsPanning(true)
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (e.touches.length === 1 && isDrawing) {
      draw(e)
    } else if (e.touches.length === 2 && isPanning) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      const newScale = scale * (currentDistance / initialDistance.current)
      setScale(Math.min(Math.max(newScale, 0.5), 3))

      const midX = (touch1.clientX + touch2.clientX) / 2
      const midY = (touch1.clientY + touch2.clientY) / 2
      if (lastTouchPos.current) {
        const dx = midX - lastTouchPos.current.x
        const dy = midY - lastTouchPos.current.y
        setOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }))
      }
      lastTouchPos.current = { x: midX, y: midY }
      initialDistance.current = currentDistance
    }
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (isDrawing) {
      stopDrawing()
    }
    setIsPanning(false)
    lastTouchPos.current = null
    initialDistance.current = 0
  }

  function extractCodeFromName(name: string): string {
    const match = name.match(/^C(\d+)/)
    if (match && match[1]) {
      return `C${match[1]}`
    }
    return name.split(" ")[0]
  }

  return (
    <div className="space-y-4 flex flex-col min-h-screen">
      <div className="text-center p-4">
        <h2 className="text-lg font-bold text-gray-900">Tạo mặt nạ</h2>
        <p className="text-xs text-gray-600">
          Dùng ngón tay để vẽ hoặc tẩy trên hình ảnh. Pinch để zoom, kéo để di chuyển.
        </p>
      </div>

      <div className="flex-1 flex flex-col" ref={containerRef}>
        <div className="border rounded-lg overflow-hidden bg-gray-100 relative flex-1">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full cursor-crosshair touch-none"
            style={{
              width: "100%",
              height: canvasSize.height > 0 ? `${canvasSize.height}px` : "auto",
              objectFit: "contain",
            }}
          />
          <canvas ref={maskCanvasRef} style={{ display: "none" }} />
        </div>
      </div>

      <div className="p-4 space-y-4 bg-white sticky bottom-0 z-10">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={tool === "brush" ? "default" : "outline"}
            className={`text-xs ${tool === "brush" ? "bg-blue-900" : ""}`}
            onClick={() => setTool("brush")}
          >
            <Brush className="mr-1 h-4 w-4" />
            Cọ
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            className={`text-xs ${tool === "eraser" ? "bg-blue-900" : ""}`}
            onClick={() => setTool("eraser")}
          >
            <Eraser className="mr-1 h-4 w-4" />
            Tẩy
          </Button>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Kích thước cọ: {brushSize}px</label>
          <Slider
            value={[brushSize]}
            min={5}
            max={100}
            step={1}
            onValueChange={(value) => setBrushSize(value[0])}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={undo} disabled={historyIndex <= 0} className="text-xs">
            <Undo className="mr-1 h-4 w-4" />
            Hoàn
          </Button>
          <Button
            variant="outline"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="text-xs"
          >
            <Redo className="mr-1 h-4 w-4" />
            Lại
          </Button>
          <Button variant="outline" onClick={resetCanvas} className="text-xs">
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>

        <Button onClick={handleComplete} className="w-full bg-blue-900 hover:bg-blue-800 text-sm">
          Hoàn thành
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Kết cấu: <span className="font-medium">{selectedTexture.name}</span>
          </p>
        </div>
      </div>
    </div>
  )
}