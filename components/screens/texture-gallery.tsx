"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Search, ArrowRight, X, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface TextureGalleryProps {
  onTextureSelect: (texture: { url: string; name: string; id: number }) => void
  uploadedImage: string | null
}

// Danh sách các màu sắc đá thạch anh
const colors = [
  { id: "white", name: "Trắng" },
  { id: "black", name: "Đen" },
  { id: "gray", name: "Xám" },
  { id: "beige", name: "Be" },
  { id: "brown", name: "Nâu" },
  { id: "gold", name: "Vàng" },
  { id: "blue", name: "Xanh" },
  { id: "green", name: "Xanh lá" },
]

// Danh sách các kiểu vân đá
const patterns = [
  { id: "marble", name: "Vân cẩm thạch" },
  { id: "solid", name: "Đồng nhất" },
  { id: "speckled", name: "Hạt nhỏ" },
  { id: "veined", name: "Vân mạch" },
  { id: "concrete", name: "Bê tông" },
  { id: "wood", name: "Vân gỗ" },
]

export default function TextureGallery({ onTextureSelect, uploadedImage }: TextureGalleryProps) {
  const [selectedTextureId, setSelectedTextureId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("name")
  const [showFilters, setShowFilters] = useState(false)

  // Dữ liệu kết cấu đá thạch anh (43 mẫu)
  const allTextures = [
    {
      id: 1,
      name: "Đá thạch anh trắng Calacatta",
      description: "Bề mặt trắng tinh khiết với vân đá tự nhiên, sang trọng và tinh tế",
      imageUrl:
        "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 2,
      name: "Đá thạch anh đen Marquina",
      description: "Bề mặt đen sang trọng với các hạt thạch anh tinh tế, tạo điểm nhấn mạnh mẽ",
      imageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "black",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 3,
      name: "Đá thạch anh vân cẩm thạch Carrara",
      description: "Vân đá cẩm thạch tự nhiên trên nền trắng, tạo cảm giác thanh lịch và đẳng cấp",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "marble",
      price: "Cao",
    },
    {
      id: 4,
      name: "Đá thạch anh vàng Sahara",
      description: "Bề mặt vàng ấm áp với các hạt thạch anh lấp lánh, mang lại không gian ấm cúng",
      imageUrl:
        "https://images.unsplash.com/photo-1604231775361-9e1f6da64f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gold",
      pattern: "speckled",
      price: "Trung bình",
    },
    {
      id: 5,
      name: "Đá thạch anh xám Concrete",
      description: "Bề mặt xám hiện đại với kết cấu bê tông, phù hợp với phong cách công nghiệp",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "concrete",
      price: "Thấp",
    },
    {
      id: 6,
      name: "Đá thạch anh vân gỗ Walnut",
      description: "Kết cấu vân gỗ tự nhiên trên nền đá thạch anh, kết hợp hoàn hảo giữa ấm áp và bền bỉ",
      imageUrl:
        "https://images.unsplash.com/photo-1620066326062-4d4cb7b4c5ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "brown",
      pattern: "wood",
      price: "Trung bình",
    },
    {
      id: 7,
      name: "Đá thạch anh trắng tuyết Snow White",
      description: "Bề mặt trắng tinh khiết, đồng nhất, mang lại cảm giác sạch sẽ và rộng rãi",
      imageUrl:
        "https://images.unsplash.com/photo-1575301579296-39d50573daf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 8,
      name: "Đá thạch anh đen tuyền Absolute Black",
      description: "Bề mặt đen sâu thẳm, đồng nhất, tạo nên vẻ đẹp sang trọng và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1614851099511-773084f6911d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "black",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 9,
      name: "Đá thạch anh vân mây Cloud White",
      description: "Bề mặt trắng với vân mây nhẹ nhàng, tạo cảm giác thanh thoát và tinh tế",
      imageUrl:
        "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "veined",
      price: "Trung bình",
    },
    {
      id: 10,
      name: "Đá thạch anh nâu Emperador",
      description: "Bề mặt nâu ấm áp với vân đá tự nhiên, tạo không gian sang trọng và ấm cúng",
      imageUrl:
        "https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "brown",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 11,
      name: "Đá thạch anh xanh Azul",
      description: "Bề mặt xanh dương với vân đá tự nhiên, mang lại cảm giác mát mẻ và độc đáo",
      imageUrl:
        "https://images.unsplash.com/photo-1618219944342-824e40a13285?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "blue",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 12,
      name: "Đá thạch anh be Crema",
      description: "Bề mặt màu be ấm áp với vân đá nhẹ nhàng, phù hợp với nhiều phong cách nội thất",
      imageUrl:
        "https://images.unsplash.com/photo-1618219740975-d40e7598cdb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "beige",
      pattern: "veined",
      price: "Trung bình",
    },
    {
      id: 13,
      name: "Đá thạch anh xám đậm Charcoal",
      description: "Bề mặt xám đậm với các hạt thạch anh tinh tế, tạo nên vẻ đẹp hiện đại và sang trọng",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160588-241658c0f566?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "speckled",
      price: "Trung bình",
    },
    {
      id: 14,
      name: "Đá thạch anh trắng hạt Bianco",
      description: "Bề mặt trắng với các hạt thạch anh nhỏ, tạo nên vẻ đẹp tinh tế và sang trọng",
      imageUrl:
        "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "speckled",
      price: "Trung bình",
    },
    {
      id: 15,
      name: "Đá thạch anh vàng hổ Tiger Gold",
      description: "Bề mặt vàng với vân đá mạnh mẽ như vằn hổ, tạo điểm nhấn độc đáo cho không gian",
      imageUrl:
        "https://images.unsplash.com/photo-1620503374956-c942862f0372?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gold",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 16,
      name: "Đá thạch anh xanh lá Emerald",
      description: "Bề mặt xanh lá với vân đá tự nhiên, mang lại cảm giác tươi mới và gần gũi thiên nhiên",
      imageUrl:
        "https://images.unsplash.com/photo-1618220924273-338d82d6b886?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "green",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 17,
      name: "Đá thạch anh trắng ngọc trai Pearl",
      description: "Bề mặt trắng ánh ngọc trai, tạo cảm giác sang trọng và tinh tế",
      imageUrl:
        "https://images.unsplash.com/photo-1618221195410-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 18,
      name: "Đá thạch anh xám bạc Silver Gray",
      description: "Bề mặt xám bạc thanh lịch, phù hợp với không gian hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160588-241658c0f566?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 19,
      name: "Đá thạch anh nâu đất Terra",
      description: "Bề mặt nâu đất ấm áp, mang lại cảm giác gần gũi và thân thiện",
      imageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "brown",
      pattern: "solid",
      price: "Thấp",
    },
    {
      id: 20,
      name: "Đá thạch anh vân mây xám Nimbus",
      description: "Bề mặt xám với vân mây nhẹ nhàng, tạo cảm giác thanh thoát và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "veined",
      price: "Trung bình",
    },
    {
      id: 21,
      name: "Đá thạch anh trắng tuyết Alpine",
      description: "Bề mặt trắng tinh khiết như tuyết, mang lại cảm giác sạch sẽ và rộng rãi",
      imageUrl:
        "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 22,
      name: "Đá thạch anh đen huyền Galaxy",
      description: "Bề mặt đen với các hạt lấp lánh như dải ngân hà, tạo điểm nhấn độc đáo",
      imageUrl:
        "https://images.unsplash.com/photo-1614851099511-773084f6911d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "black",
      pattern: "speckled",
      price: "Cao",
    },
    {
      id: 23,
      name: "Đá thạch anh be vàng Sahara",
      description: "Bề mặt be vàng ấm áp, phù hợp với không gian cổ điển và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1604231775361-9e1f6da64f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "beige",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 24,
      name: "Đá thạch anh xanh biển Aqua",
      description: "Bề mặt xanh biển mát mẻ, mang lại cảm giác thư giãn và yên bình",
      imageUrl:
        "https://images.unsplash.com/photo-1618219944342-824e40a13285?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "blue",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 25,
      name: "Đá thạch anh vân gỗ sồi Oak",
      description: "Bề mặt vân gỗ sồi tự nhiên, kết hợp hoàn hảo giữa ấm áp và bền bỉ",
      imageUrl:
        "https://images.unsplash.com/photo-1620066326062-4d4cb7b4c5ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "brown",
      pattern: "wood",
      price: "Trung bình",
    },
    {
      id: 26,
      name: "Đá thạch anh trắng vân xám Carrara",
      description: "Bề mặt trắng với vân xám nhẹ nhàng, tạo cảm giác thanh lịch và sang trọng",
      imageUrl:
        "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 27,
      name: "Đá thạch anh xám đen Anthracite",
      description: "Bề mặt xám đen hiện đại, phù hợp với không gian công nghiệp và tối giản",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 28,
      name: "Đá thạch anh vàng kim Imperial",
      description: "Bề mặt vàng kim sang trọng, tạo điểm nhấn đẳng cấp cho không gian",
      imageUrl:
        "https://images.unsplash.com/photo-1620503374956-c942862f0372?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gold",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 29,
      name: "Đá thạch anh trắng hạt Crystal",
      description: "Bề mặt trắng với các hạt thạch anh lấp lánh như pha lê, tạo cảm giác sang trọng",
      imageUrl:
        "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "speckled",
      price: "Cao",
    },
    {
      id: 30,
      name: "Đá thạch anh xám bê tông Urban",
      description: "Bề mặt xám với kết cấu bê tông, phù hợp với phong cách công nghiệp và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "concrete",
      price: "Thấp",
    },
    {
      id: 31,
      name: "Đá thạch anh đen vân vàng Noir",
      description: "Bề mặt đen với vân vàng sang trọng, tạo điểm nhấn mạnh mẽ cho không gian",
      imageUrl:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "black",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 32,
      name: "Đá thạch anh be vân nâu Cappuccino",
      description: "Bề mặt be với vân nâu nhẹ nhàng, tạo cảm giác ấm áp và tinh tế",
      imageUrl:
        "https://images.unsplash.com/photo-1618219740975-d40e7598cdb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "beige",
      pattern: "veined",
      price: "Trung bình",
    },
    {
      id: 33,
      name: "Đá thạch anh trắng vân vàng Calacatta Gold",
      description: "Bề mặt trắng với vân vàng sang trọng, tạo điểm nhấn đẳng cấp cho không gian",
      imageUrl:
        "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 34,
      name: "Đá thạch anh xanh rêu Forest",
      description: "Bề mặt xanh rêu tự nhiên, mang lại cảm giác gần gũi với thiên nhiên",
      imageUrl:
        "https://images.unsplash.com/photo-1618220924273-338d82d6b886?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "green",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 35,
      name: "Đá thạch anh nâu vân gỗ Walnut",
      description: "Bề mặt nâu với vân gỗ tự nhiên, kết hợp hoàn hảo giữa ấm áp và bền bỉ",
      imageUrl:
        "https://images.unsplash.com/photo-1620066326062-4d4cb7b4c5ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "brown",
      pattern: "wood",
      price: "Trung bình",
    },
    {
      id: 36,
      name: "Đá thạch anh trắng tuyết Arctic",
      description: "Bề mặt trắng tinh khiết, đồng nhất, mang lại cảm giác sạch sẽ và rộng rãi",
      imageUrl:
        "https://images.unsplash.com/photo-1575301579296-39d50573daf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 37,
      name: "Đá thạch anh xám vân mây Nimbus",
      description: "Bề mặt xám với vân mây nhẹ nhàng, tạo cảm giác thanh thoát và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160536-598cf32026fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "veined",
      price: "Trung bình",
    },
    {
      id: 38,
      name: "Đá thạch anh đen tuyền Absolute",
      description: "Bề mặt đen sâu thẳm, đồng nhất, tạo nên vẻ đẹp sang trọng và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1614851099511-773084f6911d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "black",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 39,
      name: "Đá thạch anh be vàng Desert",
      description: "Bề mặt be vàng ấm áp, phù hợp với không gian cổ điển và hiện đại",
      imageUrl:
        "https://images.unsplash.com/photo-1604231775361-9e1f6da64f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "beige",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 40,
      name: "Đá thạch anh xanh biển Aquamarine",
      description: "Bề mặt xanh biển mát mẻ, mang lại cảm giác thư giãn và yên bình",
      imageUrl:
        "https://images.unsplash.com/photo-1618219944342-824e40a13285?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "blue",
      pattern: "solid",
      price: "Cao",
    },
    {
      id: 41,
      name: "Đá thạch anh trắng vân xám Statuario",
      description: "Bề mặt trắng với vân xám nhẹ nhàng, tạo cảm giác thanh lịch và sang trọng",
      imageUrl:
        "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "white",
      pattern: "veined",
      price: "Cao",
    },
    {
      id: 42,
      name: "Đá thạch anh xám đen Charcoal",
      description: "Bề mặt xám đen hiện đại, phù hợp với không gian công nghiệp và tối giản",
      imageUrl:
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gray",
      pattern: "solid",
      price: "Trung bình",
    },
    {
      id: 43,
      name: "Đá thạch anh vàng kim Imperial Gold",
      description: "Bề mặt vàng kim sang trọng, tạo điểm nhấn đẳng cấp cho không gian",
      imageUrl:
        "https://images.unsplash.com/photo-1620503374956-c942862f0372?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      color: "gold",
      pattern: "veined",
      price: "Cao",
    },
  ]

  // Lọc và sắp xếp dữ liệu
  const filteredTextures = allTextures.filter((texture) => {
    const matchesSearch =
      texture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      texture.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesColor = selectedColors.length === 0 || selectedColors.includes(texture.color)
    const matchesPattern = selectedPatterns.length === 0 || selectedPatterns.includes(texture.pattern)

    return matchesSearch && matchesColor && matchesPattern
  })

  // Sắp xếp dữ liệu
  const sortedTextures = [...filteredTextures].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "price_asc") {
      const priceOrder = { Thấp: 1, "Trung bình": 2, Cao: 3 }
      return priceOrder[a.price as keyof typeof priceOrder] - priceOrder[b.price as keyof typeof priceOrder]
    } else if (sortBy === "price_desc") {
      const priceOrder = { Thấp: 1, "Trung bình": 2, Cao: 3 }
      return priceOrder[b.price as keyof typeof priceOrder] - priceOrder[a.price as keyof typeof priceOrder]
    }
    return 0
  })

  // Phân trang
  const totalPages = Math.ceil(sortedTextures.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTextures = sortedTextures.slice(startIndex, startIndex + itemsPerPage)

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Xử lý thay đổi số lượng hiển thị
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  // Xử lý thay đổi màu sắc
  const handleColorChange = (colorId: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((id) => id !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
    setCurrentPage(1)
  }

  // Xử lý thay đổi kiểu vân đá
  const handlePatternChange = (patternId: string) => {
    setSelectedPatterns((prev) => {
      if (prev.includes(patternId)) {
        return prev.filter((id) => id !== patternId)
      } else {
        return [...prev, patternId]
      }
    })
    setCurrentPage(1)
  }

  // Xử lý xóa bộ lọc
  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedColors([])
    setSelectedPatterns([])
    setSortBy("name")
    setCurrentPage(1)
  }

  const handleSelect = (textureId: number) => {
    setSelectedTextureId(textureId)
  }

  const handleConfirm = () => {
    if (selectedTextureId !== null) {
      const selectedTexture = allTextures.find((texture) => texture.id === selectedTextureId)
      if (selectedTexture) {
        onTextureSelect({
          id: selectedTexture.id,
          url: selectedTexture.imageUrl,
          name: selectedTexture.name,
        })
      }
    }
  }

  const handleTextureSelect = async (texture: { code: string; name: string; quote: string }) => {
    const extractCodeFromName = (name: string): string => {
      const match = name.match(/^C(\d+)/);
      if (match && match[1]) {
        return `C${match[1]}`; // Trả về mã số với tiền tố "C"
      }
      return name.split(' ')[0]; // Fallback nếu không tìm thấy mã số
    };

    const productCode = extractCodeFromName(texture.name);
    const imageUrl = `https://raw.githubusercontent.com/TDNM88/cqfinal/refs/heads/main/public/product_images/${productCode}.jpg`;

    try {
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Ảnh sản phẩm không tồn tại'));
      });
      setSelectedTextureId(parseInt(productCode.replace('C', ''), 10));
      onTextureSelect({ id: parseInt(productCode.replace('C', ''), 10), url: imageUrl, name: texture.name });
    } catch (error) {
      console.error('Lỗi khi kiểm tra ảnh sản phẩm:', error);
      toast({
        title: "Lỗi",
        description: "Ảnh sản phẩm không tồn tại. Vui lòng chọn lại.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {uploadedImage && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Hình ảnh đã tải lên:</p>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <img
              src={uploadedImage || "/placeholder.svg"}
              alt="Hình ảnh đã tải lên"
              className="max-h-[300px] max-w-full rounded object-contain"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Bộ lọc cho màn hình lớn */}
        <div className="hidden md:block md:w-1/4 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Bộ lọc</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Màu sắc</h4>
                <div className="space-y-2">
                  {colors.map((color) => (
                    <div key={color.id} className="flex items-center">
                      <Checkbox
                        id={`color-${color.id}`}
                        checked={selectedColors.includes(color.id)}
                        onCheckedChange={() => handleColorChange(color.id)}
                      />
                      <Label
                        htmlFor={`color-${color.id}`}
                        className="ml-2 text-sm font-normal text-gray-700 cursor-pointer"
                      >
                        {color.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Kiểu vân đá</h4>
                <div className="space-y-2">
                  {patterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-center">
                      <Checkbox
                        id={`pattern-${pattern.id}`}
                        checked={selectedPatterns.includes(pattern.id)}
                        onCheckedChange={() => handlePatternChange(pattern.id)}
                      />
                      <Label
                        htmlFor={`pattern-${pattern.id}`}
                        className="ml-2 text-sm font-normal text-gray-700 cursor-pointer"
                      >
                        {pattern.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedColors.length > 0 || selectedPatterns.length > 0) && (
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full mt-2">
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="md:w-3/4 space-y-4">
          {/* Thanh tìm kiếm và sắp xếp */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm kết cấu đá thạch anh..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Bộ lọc
                    {(selectedColors.length > 0 || selectedPatterns.length > 0) && (
                      <Badge className="ml-2 bg-blue-900" variant="default">
                        {selectedColors.length + selectedPatterns.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Bộ lọc</SheetTitle>
                    <SheetDescription>Lọc kết cấu đá thạch anh theo các tiêu chí</SheetDescription>
                  </SheetHeader>
                  <div className="py-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Màu sắc</h4>
                      <div className="space-y-2">
                        {colors.map((color) => (
                          <div key={color.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-color-${color.id}`}
                              checked={selectedColors.includes(color.id)}
                              onCheckedChange={() => handleColorChange(color.id)}
                            />
                            <Label
                              htmlFor={`mobile-color-${color.id}`}
                              className="ml-2 text-sm font-normal text-gray-700 cursor-pointer"
                            >
                              {color.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Kiểu vân đá</h4>
                      <div className="space-y-2">
                        {patterns.map((pattern) => (
                          <div key={pattern.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-pattern-${pattern.id}`}
                              checked={selectedPatterns.includes(pattern.id)}
                              onCheckedChange={() => handlePatternChange(pattern.id)}
                            />
                            <Label
                              htmlFor={`mobile-pattern-${pattern.id}`}
                              className="ml-2 text-sm font-normal text-gray-700 cursor-pointer"
                            >
                              {pattern.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(selectedColors.length > 0 || selectedPatterns.length > 0) && (
                      <Button variant="outline" size="sm" onClick={handleClearFilters} className="w-full mt-2">
                        <X className="h-4 w-4 mr-2" />
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên (A-Z)</SelectItem>
                  <SelectItem value="price_asc">Giá (Thấp - Cao)</SelectItem>
                  <SelectItem value="price_desc">Giá (Cao - Thấp)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hiển thị bộ lọc đã chọn */}
          {(selectedColors.length > 0 || selectedPatterns.length > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-500">Bộ lọc:</span>
              {selectedColors.map((colorId) => {
                const color = colors.find((c) => c.id === colorId)
                return color ? (
                  <Badge key={`color-${colorId}`} variant="secondary" className="flex items-center gap-1">
                    {color.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleColorChange(colorId)} />
                  </Badge>
                ) : null
              })}
              {selectedPatterns.map((patternId) => {
                const pattern = patterns.find((p) => p.id === patternId)
                return pattern ? (
                  <Badge key={`pattern-${patternId}`} variant="secondary" className="flex items-center gap-1">
                    {pattern.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handlePatternChange(patternId)} />
                  </Badge>
                ) : null
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm text-blue-900 hover:text-blue-700"
              >
                Xóa tất cả
              </Button>
            </div>
          )}

          {/* Hiển thị số lượng kết quả */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Hiển thị {paginatedTextures.length} trên {filteredTextures.length} kết quả
            </p>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Hiển thị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 mẫu</SelectItem>
                <SelectItem value="24">24 mẫu</SelectItem>
                <SelectItem value="36">36 mẫu</SelectItem>
                <SelectItem value="48">48 mẫu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Danh sách sản phẩm */}
          {paginatedTextures.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTextures.map((texture) => (
                <Card
                  key={texture.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTextureId === texture.id
                      ? "ring-2 ring-blue-900 border-transparent"
                      : "hover:border-blue-200"
                  }`}
                  onClick={() => handleSelect(texture.id)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                      <img
                        src={texture.imageUrl || "/placeholder.svg"}
                        alt={texture.name}
                        className="max-h-full max-w-full rounded object-cover"
                      />
                    </div>

                    {selectedTextureId === texture.id && (
                      <div className="absolute top-2 right-2 bg-blue-900 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">{texture.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{texture.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      variant={
                        texture.price === "Cao" ? "default" : texture.price === "Trung bình" ? "secondary" : "outline"
                      }
                    >
                      {texture.price}
                    </Badge>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        {colors.find((c) => c.id === texture.color)?.name}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy kết quả phù hợp</p>
              <Button variant="link" onClick={handleClearFilters} className="text-blue-900">
                Xóa bộ lọc
              </Button>
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1

                  // Hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }

                  // Hiển thị dấu ... nếu có khoảng cách
                  if ((page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2)) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }

                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Nút tiếp tục */}
      <div className="flex justify-end mt-6">
        <Button onClick={handleConfirm} disabled={selectedTextureId === null} className="bg-blue-900 hover:bg-blue-800">
          Tiếp tục với kết cấu đã chọn
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

