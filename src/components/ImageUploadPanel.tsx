import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Image, Upload } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ImageUploadPanelProps {
  onImageUpload: (imageUrl: string) => void
}

export function ImageUploadPanel({ onImageUpload }: ImageUploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      onImageUpload(imageUrl)
      toast.success('Image uploaded successfully')
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card
        className="p-8 border-2 border-dashed cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={32} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Upload Image</h3>
            <p className="text-sm text-muted-foreground">
              Click to select an image file
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG up to 5MB
            </p>
          </div>
          <Button variant="outline" className="mt-2">
            <Image size={18} className="mr-2" />
            Choose File
          </Button>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <h4 className="text-sm font-semibold mb-2">Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Use high-resolution images for best quality</li>
          <li>• PNG files support transparency</li>
          <li>• You can resize and position images on the case</li>
        </ul>
      </div>
    </div>
  )
}
