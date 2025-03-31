"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Search, ChevronRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"

interface TextureGalleryProps {
  onTextureSelect: (texture: { code: string; name: string; quote: string; url: string }) => void
  uploadedImage: string | null
  productGroups: Record<string, Array<{ name: string; quote: string; code: string }>>
}

const extractCodeFromName = (name: string): string => {
  const match = name.match(/^C(\d+)/);
  if (match && match[1]) {
    return `C${match[1]}`; // Trả về mã số với tiền tố "C"
  }
  return name.split(' ')[0]; // Fallback nếu không tìm thấy mã số
};

export default function TextureGallery({ onTextureSelect, uploadedImage, productGroups }: TextureGalleryProps) {
  const [selectedTexture, setSelectedTexture] = useState<{ code: string; name: string; quote: string; url: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(Object.keys(productGroups)[0])

  const handleTextureSelect = (texture: { code: string; name: string; quote: string }) => {
    const productCode = extractCodeFromName(texture.name);
    const imageUrl = `/product_images/${productCode}.jpg`;

    setSelectedTexture({ ...texture, url: imageUrl });
    onTextureSelect({ ...texture, url: imageUrl });
  };

  const handleConfirm = () => {
    if (selectedTexture) {
      onTextureSelect(selectedTexture)
    }
  }

  const filteredTextures = searchQuery
    ? Object.values(productGroups)
        .flat()
        .filter(
          (texture) =>
            texture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            texture.quote.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    : productGroups[activeCategory]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Chọn kết cấu đá thạch anh</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Chọn loại đá thạch anh nhân tạo bạn muốn áp dụng vào không gian của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Hình ảnh đã tải lên */}
        <div className="md:col-span-1">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Hình ảnh đã tải lên</h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={uploadedImage || "/placeholder.svg"}
                alt="Hình ảnh đã tải lên"
                className="w-full h-full object-contain"
              />
            </div>

            {selectedTexture && (
              <div className="space-y-3 p-3 sm:p-4 border rounded-lg">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Kết cấu đã chọn</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedTexture.url}
                    alt={selectedTexture.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900">{selectedTexture.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-3">{selectedTexture.quote}</p>
                </div>
                <Button onClick={handleConfirm} className="w-full bg-blue-900 hover:bg-blue-800 text-xs sm:text-sm">
                  Tiếp tục với kết cấu đã chọn
                  <ChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách kết cấu */}
        <div className="md:col-span-2">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm kết cấu đá thạch anh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs sm:text-sm"
              />
            </div>

            {searchQuery ? (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Kết quả tìm kiếm ({filteredTextures.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {filteredTextures.map((texture) => (
                    <TextureCard
                      key={texture.name}
                      texture={texture}
                      isSelected={selectedTexture?.name === texture.name}
                      onSelect={() => handleTextureSelect(texture)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="w-full justify-start mb-3 sm:mb-4 overflow-x-auto">
                  {Object.keys(productGroups).map((category) => (
                    <TabsTrigger key={category} value={category} className="whitespace-nowrap text-xs sm:text-sm">
                      {category} ({productGroups[category].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(productGroups).map((category) => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <ScrollArea className="h-[350px] sm:h-[500px] pr-2 sm:pr-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {productGroups[category].map((texture) => (
                          <TextureCard
                            key={texture.name}
                            texture={texture}
                            isSelected={selectedTexture?.name === texture.name}
                            onSelect={() => handleTextureSelect(texture)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface TextureCardProps {
  texture: { code: string; name: string; quote: string }
  isSelected: boolean
  onSelect: () => void
}

function TextureCard({ texture, isSelected, onSelect }: TextureCardProps) {
  const code = extractCodeFromName(texture.name);
  const imageUrl = `/product_images/${code}.jpg`;

  return (
    <Card
      className={`p-3 sm:p-4 cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-blue-900 border-transparent" : "hover:border-blue-200"
      }`}
      onClick={onSelect}
    >
      <div className="relative">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
          <img src={imageUrl} alt={texture.name} className="w-full h-full object-cover" />
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-900 text-white rounded-full p-1">
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-1">{texture.name}</h3>
      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{texture.quote}</p>
    </Card>
  )
}

