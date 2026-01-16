import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, Image as ImageIcon, Palette, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { CaseTexture } from '@/lib/types'
import { MATERIAL_FINISHES, PRESET_COLORS } from '@/lib/types'

interface TexturePanelProps {
  currentTexture: CaseTexture | null
  currentColor: string
  onTextureChange: (texture: CaseTexture) => void
  onColorChange: (color: string) => void
}

const PATTERN_PRESETS = [
  { id: 'carbon', name: 'Carbon Fiber', emoji: '🔲', color: '#1a1a2e' },
  { id: 'wood', name: 'Wood Grain', emoji: '🪵', color: '#8B4513' },
  { id: 'marble', name: 'Marble', emoji: '🪨', color: '#f5f5f5' },
  { id: 'stripes', name: 'Stripes', emoji: '📊', color: '#3B82F6' },
  { id: 'dots', name: 'Polka Dots', emoji: '⚪', color: '#EC4899' },
  { id: 'checker', name: 'Checkerboard', emoji: '♟️', color: '#000000' },
]

const GRADIENT_PRESETS = [
  { id: 'sunset', name: 'Sunset', colors: ['#FF512F', '#F09819'] },
  { id: 'ocean', name: 'Ocean', colors: ['#2193b0', '#6dd5ed'] },
  { id: 'purple', name: 'Purple Haze', colors: ['#7F00FF', '#E100FF'] },
  { id: 'forest', name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { id: 'fire', name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { id: 'cool', name: 'Cool Blue', colors: ['#00c6ff', '#0072ff'] },
  { id: 'rose', name: 'Rose', colors: ['#ee9ca7', '#ffdde1'] },
  { id: 'midnight', name: 'Midnight', colors: ['#232526', '#414345'] },
]

export function TexturePanel({ 
  currentTexture, 
  currentColor, 
  onTextureChange, 
  onColorChange 
}: TexturePanelProps) {
  const [roughness, setRoughness] = useState(currentTexture?.roughness ?? 0.4)
  const [metalness, setMetalness] = useState(currentTexture?.metalness ?? 0.1)
  const [opacity, setOpacity] = useState(currentTexture?.opacity ?? 1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFinishSelect = (finish: typeof MATERIAL_FINISHES[0]) => {
    setRoughness(finish.roughness)
    setMetalness(finish.metalness)
    
    onTextureChange({
      id: `finish-${finish.id}`,
      type: 'color',
      color: currentColor,
      roughness: finish.roughness,
      metalness: finish.metalness,
      opacity,
    })
    
    toast.success(`${finish.name} finish applied`)
  }

  const handleColorSelect = (color: string) => {
    onColorChange(color)
    onTextureChange({
      id: `color-${Date.now()}`,
      type: 'color',
      color,
      roughness,
      metalness,
      opacity,
    })
  }

  const handlePatternSelect = (pattern: typeof PATTERN_PRESETS[0]) => {
    onTextureChange({
      id: `pattern-${pattern.id}`,
      type: 'pattern',
      patternType: pattern.id as any,
      color: pattern.color,
      roughness,
      metalness,
      opacity,
    })
    toast.success(`${pattern.name} pattern applied`)
  }

  const handleGradientSelect = (gradient: typeof GRADIENT_PRESETS[0]) => {
    onTextureChange({
      id: `gradient-${gradient.id}`,
      type: 'gradient',
      gradientColors: gradient.colors,
      gradientAngle: 45,
      roughness,
      metalness,
      opacity,
    })
    toast.success(`${gradient.name} gradient applied`)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      onTextureChange({
        id: `image-${Date.now()}`,
        type: 'image',
        imageUrl,
        roughness,
        metalness,
        opacity,
      })
      toast.success('Custom texture image applied')
    }
    reader.readAsDataURL(file)
  }

  const handleMaterialUpdate = (updates: Partial<CaseTexture>) => {
    const newRoughness = updates.roughness ?? roughness
    const newMetalness = updates.metalness ?? metalness
    const newOpacity = updates.opacity ?? opacity
    
    if (updates.roughness !== undefined) setRoughness(newRoughness)
    if (updates.metalness !== undefined) setMetalness(newMetalness)
    if (updates.opacity !== undefined) setOpacity(newOpacity)
    
    onTextureChange({
      ...(currentTexture || { id: 'default', type: 'color' }),
      roughness: newRoughness,
      metalness: newMetalness,
      opacity: newOpacity,
      color: currentColor,
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" className="text-xs">
              <Palette size={14} className="mr-1" />
              Color
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-xs">
              <Sparkle size={14} className="mr-1" />
              Pattern
            </TabsTrigger>
            <TabsTrigger value="gradients" className="text-xs">
              🌈
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              <ImageIcon size={14} className="mr-1" />
              Image
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Solid Colors</Label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                      currentColor === color.value ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Custom Color</Label>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-border"
              />
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {PATTERN_PRESETS.map((pattern) => (
                <Card
                  key={pattern.id}
                  className={`p-3 cursor-pointer transition-all hover:border-primary ${
                    currentTexture?.patternType === pattern.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handlePatternSelect(pattern)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{pattern.emoji}</span>
                    <span className="text-sm font-medium">{pattern.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gradients" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((gradient) => (
                <Card
                  key={gradient.id}
                  className={`p-3 cursor-pointer transition-all hover:border-primary overflow-hidden ${
                    currentTexture?.type === 'gradient' && 
                    currentTexture?.gradientColors?.[0] === gradient.colors[0] 
                      ? 'border-primary' : ''
                  }`}
                  onClick={() => handleGradientSelect(gradient)}
                >
                  <div
                    className="h-8 rounded mb-2"
                    style={{
                      background: `linear-gradient(45deg, ${gradient.colors[0]}, ${gradient.colors[1]})`,
                    }}
                  />
                  <span className="text-xs font-medium">{gradient.name}</span>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Upload Texture Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} />
                  <span className="text-sm">Click to upload texture</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                </div>
              </Button>
            </div>
            
            {currentTexture?.type === 'image' && currentTexture.imageUrl && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Current Texture</Label>
                <img 
                  src={currentTexture.imageUrl} 
                  alt="Current texture" 
                  className="w-full h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Material Finish</Label>
            <div className="grid grid-cols-3 gap-2">
              {MATERIAL_FINISHES.map((finish) => (
                <Button
                  key={finish.id}
                  variant={roughness === finish.roughness && metalness === finish.metalness ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleFinishSelect(finish)}
                >
                  {finish.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Roughness</Label>
                <span className="text-xs text-muted-foreground">{Math.round(roughness * 100)}%</span>
              </div>
              <Slider
                value={[roughness]}
                onValueChange={([value]) => handleMaterialUpdate({ roughness: value })}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Metalness</Label>
                <span className="text-xs text-muted-foreground">{Math.round(metalness * 100)}%</span>
              </div>
              <Slider
                value={[metalness]}
                onValueChange={([value]) => handleMaterialUpdate({ metalness: value })}
                min={0}
                max={1}
                step={0.01}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span>
              </div>
              <Slider
                value={[opacity]}
                onValueChange={([value]) => handleMaterialUpdate({ opacity: value })}
                min={0.1}
                max={1}
                step={0.01}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
