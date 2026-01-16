import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Upload, Trash, Image as ImageIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { PlacedDecal } from '@/lib/types'

interface DecalPanelProps {
  decals: PlacedDecal[]
  selectedDecalId: string | null
  onAddDecal: (imageUrl: string) => void
  onUpdateDecal: (id: string, updates: Partial<PlacedDecal>) => void
  onDeleteDecal: (id: string) => void
  onSelectDecal: (id: string | null) => void
}

const PRESET_DECALS = [
  { id: 'logo1', name: 'Star', emoji: '⭐', url: '' },
  { id: 'logo2', name: 'Heart', emoji: '❤️', url: '' },
  { id: 'logo3', name: 'Flame', emoji: '🔥', url: '' },
  { id: 'logo4', name: 'Lightning', emoji: '⚡', url: '' },
  { id: 'logo5', name: 'Crown', emoji: '👑', url: '' },
  { id: 'logo6', name: 'Diamond', emoji: '💎', url: '' },
  { id: 'logo7', name: 'Butterfly', emoji: '🦋', url: '' },
  { id: 'logo8', name: 'Moon', emoji: '🌙', url: '' },
  { id: 'logo9', name: 'Sun', emoji: '☀️', url: '' },
  { id: 'logo10', name: 'Rainbow', emoji: '🌈', url: '' },
  { id: 'logo11', name: 'Rose', emoji: '🌹', url: '' },
  { id: 'logo12', name: 'Skull', emoji: '💀', url: '' },
]

export function DecalPanel({
  decals,
  selectedDecalId,
  onAddDecal,
  onUpdateDecal,
  onDeleteDecal,
  onSelectDecal,
}: DecalPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedDecal = decals.find(d => d.id === selectedDecalId)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      onAddDecal(imageUrl)
      toast.success('Decal added! Click and drag to position it.')
    }
    reader.readAsDataURL(file)
  }

  const handlePresetDecalClick = (preset: typeof PRESET_DECALS[0]) => {
    // Create a canvas to render the emoji as an image
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = '96px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(preset.emoji, 64, 64)
      const imageUrl = canvas.toDataURL('image/png')
      onAddDecal(imageUrl)
      toast.success(`${preset.name} decal added!`)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Upload Custom Decal</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="w-full h-20 border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <Upload size={20} />
              <span className="text-xs">Upload image or logo</span>
            </div>
          </Button>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Decals</Label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_DECALS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className="h-12 text-2xl p-0"
                onClick={() => handlePresetDecalClick(preset)}
                title={preset.name}
              >
                {preset.emoji}
              </Button>
            ))}
          </div>
        </div>

        {decals.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Placed Decals ({decals.length})</Label>
            <div className="space-y-2">
              {decals.map((decal, index) => (
                <Card
                  key={decal.id}
                  className={`p-2 cursor-pointer transition-all ${
                    selectedDecalId === decal.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => onSelectDecal(decal.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={decal.url} 
                        alt={`Decal ${index + 1}`} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Decal {index + 1}</div>
                      <div className="text-xs text-muted-foreground">
                        Scale: {(decal.scale * 100).toFixed(0)}%
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteDecal(decal.id)
                        toast.success('Decal removed')
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedDecal && (
          <div className="border-t pt-4 space-y-4">
            <Label className="text-sm font-medium block">Edit Selected Decal</Label>
            
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Scale</Label>
                <span className="text-xs text-muted-foreground">
                  {(selectedDecal.scale * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[selectedDecal.scale]}
                onValueChange={([value]) => onUpdateDecal(selectedDecal.id, { scale: value })}
                min={0.1}
                max={3}
                step={0.1}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs text-muted-foreground">
                  {(selectedDecal.opacity * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[selectedDecal.opacity]}
                onValueChange={([value]) => onUpdateDecal(selectedDecal.id, { opacity: value })}
                min={0.1}
                max={1}
                step={0.05}
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              💡 Tip: Use the 3D viewer controls to move, rotate, and position the decal on the case.
            </div>
          </div>
        )}

        {decals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No decals added yet</p>
            <p className="text-xs">Upload an image or select a preset</p>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
