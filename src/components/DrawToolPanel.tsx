import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { PRESET_COLORS } from '@/lib/types'

interface DrawToolPanelProps {
  brushColor: string
  brushSize: number
  onBrushColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
}

export function DrawToolPanel({
  brushColor,
  brushSize,
  onBrushColorChange,
  onBrushSizeChange,
}: DrawToolPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Brush Color</Label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onBrushColorChange(preset.value)}
              className={`relative w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                brushColor.toUpperCase() === preset.value.toUpperCase()
                  ? 'ring-4 ring-primary shadow-lg'
                  : 'ring-2 ring-border hover:ring-primary/50'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            >
              {brushColor.toUpperCase() === preset.value.toUpperCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm font-semibold">Brush Size</Label>
          <span className="text-sm font-mono text-muted-foreground">{brushSize}px</span>
        </div>
        <Slider
          value={[brushSize]}
          onValueChange={(values) => onBrushSizeChange(values[0])}
          min={2}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="mt-4 flex justify-center">
          <div
            className="rounded-full border-2 border-border shadow-lg"
            style={{
              width: `${brushSize}px`,
              height: `${brushSize}px`,
              backgroundColor: brushColor,
            }}
          />
        </div>
      </div>

      <div className="p-4 rounded-lg border-2 border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          Click and drag on the phone case to draw
        </p>
      </div>
    </div>
  )
}
