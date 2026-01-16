import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { 
  Trash,
} from '@phosphor-icons/react'
import type { Metaball } from '@/lib/types'
import { PRESET_COLORS } from '@/lib/types'

// Shape definitions with icons and descriptions
const SHAPE_CATEGORIES = [
  {
    name: 'Smooth Bumps',
    shapes: [
      { type: 'bump' as const, icon: '🔘', name: 'Smooth Bump', description: 'Raised rounded surface' },
      { type: 'sphere' as const, icon: '⚪', name: 'Sphere', description: 'Perfect round ball' },
      { type: 'ridge' as const, icon: '〰️', name: 'Ridge', description: 'Elongated raised line' },
      { type: 'wave' as const, icon: '🌊', name: 'Wave', description: 'Flowing curved surface' },
    ]
  },
  {
    name: 'Grooves & Indents',
    shapes: [
      { type: 'groove' as const, icon: '⭕', name: 'Groove', description: 'Smooth indented circle' },
      { type: 'cube' as const, icon: '🔲', name: 'Dimple', description: 'Soft square indent' },
    ]
  },
  {
    name: 'Fidgets',
    shapes: [
      { type: 'fidget-bubble' as const, icon: '🫧', name: 'Pop Bubble', description: 'Satisfying pop bubble' },
      { type: 'fidget-button' as const, icon: '🔴', name: 'Clicky Button', description: 'Tactile click button' },
    ]
  }
]

interface MetaballPanelProps {
  metaballs: Metaball[]
  caseColor: string
  onAddMetaball: (type: Metaball['type']) => void
  onUpdateMetaball: (id: string, updates: Partial<Metaball>) => void
  onDeleteMetaball: (id: string) => void
}

export function MetaballPanel({
  metaballs,
  caseColor,
  onAddMetaball,
  onUpdateMetaball,
  onDeleteMetaball,
}: MetaballPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const selectedMetaball = metaballs.find(m => m.id === selectedId)

  const getShapeInfo = (type: string) => {
    for (const cat of SHAPE_CATEGORIES) {
      const shape = cat.shapes.find(s => s.type === type)
      if (shape) return shape
    }
    return { icon: '⚪', name: type, description: '' }
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/30 overflow-auto">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Bumps, Grooves & Fidgets
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Add smooth 3D textures and interactive fidget elements
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Shape Categories */}
        {SHAPE_CATEGORIES.map((category) => (
          <div key={category.name} className="space-y-3">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {category.name}
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {category.shapes.map((shape) => (
                <button
                  key={shape.type}
                  onClick={() => onAddMetaball(shape.type)}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {shape.icon}
                  </span>
                  <span className="text-xs font-medium text-center">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="h-px bg-border" />

        {/* Placed Items */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Placed Items ({metaballs.length})
          </Label>
          
          {metaballs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-2">🎨</span>
              <p className="text-sm">Tap a shape above to add it to your case</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {metaballs.map((metaball, index) => {
                const shapeInfo = getShapeInfo(metaball.type)
                return (
                  <button
                    key={metaball.id}
                    onClick={() => setSelectedId(selectedId === metaball.id ? null : metaball.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedId === metaball.id 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: metaball.color + '30' }}
                    >
                      {shapeInfo.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">
                        {shapeInfo.name} #{index + 1}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Size: {metaball.scale.toFixed(1)}x • Smooth: {((metaball.smoothness || 0.5) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: metaball.color }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Item Editor */}
        {selectedMetaball && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-4 bg-card p-4 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Edit {getShapeInfo(selectedMetaball.type).name}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onDeleteMetaball(selectedMetaball.id)
                    setSelectedId(null)
                  }}
                >
                  <Trash size={14} />
                  <span className="ml-1 text-xs">Delete</span>
                </Button>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label className="text-xs flex justify-between">
                  <span>Size</span>
                  <span className="text-muted-foreground">{selectedMetaball.scale.toFixed(1)}x</span>
                </Label>
                <Slider
                  value={[selectedMetaball.scale]}
                  min={0.3}
                  max={3}
                  step={0.1}
                  onValueChange={([value]) => onUpdateMetaball(selectedMetaball.id, { scale: value })}
                />
              </div>

              {/* Smoothness */}
              <div className="space-y-2">
                <Label className="text-xs flex justify-between">
                  <span>Smoothness</span>
                  <span className="text-muted-foreground">{((selectedMetaball.smoothness || 0.5) * 100).toFixed(0)}%</span>
                </Label>
                <Slider
                  value={[selectedMetaball.smoothness || 0.5]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([value]) => onUpdateMetaball(selectedMetaball.id, { smoothness: value })}
                />
              </div>

              {/* Depth (for grooves) */}
              {(selectedMetaball.type === 'groove' || selectedMetaball.type === 'cube') && (
                <div className="space-y-2">
                  <Label className="text-xs flex justify-between">
                    <span>Depth</span>
                    <span className="text-muted-foreground">{((selectedMetaball.depth || 0.5) * 100).toFixed(0)}%</span>
                  </Label>
                  <Slider
                    value={[selectedMetaball.depth || 0.5]}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) => onUpdateMetaball(selectedMetaball.id, { depth: value })}
                  />
                </div>
              )}

              {/* Blend/Influence */}
              <div className="space-y-2">
                <Label className="text-xs flex justify-between">
                  <span>Blend with surface</span>
                  <span className="text-muted-foreground">{(selectedMetaball.influence * 100).toFixed(0)}%</span>
                </Label>
                <Slider
                  value={[selectedMetaball.influence]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => onUpdateMetaball(selectedMetaball.id, { influence: value })}
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2 items-center flex-wrap">
                  <input
                    type="color"
                    value={selectedMetaball.color}
                    onChange={(e) => onUpdateMetaball(selectedMetaball.id, { color: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                  />
                  {PRESET_COLORS.slice(0, 8).map((color) => (
                    <button
                      key={color.value}
                      onClick={() => onUpdateMetaball(selectedMetaball.id, { color: color.value })}
                      className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                        selectedMetaball.color === color.value ? 'border-primary scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => onUpdateMetaball(selectedMetaball.id, { color: caseColor })}
                >
                  Match Case Color
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Tips */}
        <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">💡 Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Smooth bumps create raised 3D textures on your case</li>
            <li>Grooves create indented patterns</li>
            <li>Fidget bubbles and buttons are interactive elements</li>
            <li>Increase smoothness for softer, more organic shapes</li>
            <li>Use blend to merge shapes seamlessly with the surface</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
