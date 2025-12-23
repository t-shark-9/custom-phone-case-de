import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PRESET_COLORS } from '@/lib/types'

interface ColorPickerPanelProps {
  currentColor: string
  onColorChange: (color: string) => void
}

export function ColorPickerPanel({ currentColor, onColorChange }: ColorPickerPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="text-sm font-semibold mb-3 block">Preset Colors</Label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onColorChange(preset.value)}
              className={`relative w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                currentColor.toUpperCase() === preset.value.toUpperCase()
                  ? 'ring-4 ring-primary shadow-lg'
                  : 'ring-2 ring-border hover:ring-primary/50'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            >
              {currentColor.toUpperCase() === preset.value.toUpperCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="custom-color" className="text-sm font-semibold mb-3 block">
          Custom Color
        </Label>
        <div className="flex gap-3 items-center">
          <Input
            id="custom-color"
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-20 h-20 cursor-pointer border-2"
          />
          <div className="flex-1">
            <Input
              type="text"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#000000"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter any hex color code
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border-2 border-border bg-card">
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-lg shadow-lg"
            style={{ backgroundColor: currentColor }}
          />
          <div>
            <div className="text-sm font-medium">Current Color</div>
            <div className="text-xs text-muted-foreground font-mono mt-1">
              {currentColor.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
