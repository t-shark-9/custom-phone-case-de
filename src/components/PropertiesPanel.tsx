import { PartsLibraryPanel } from './PartsLibraryPanel'
import { ColorPickerPanel } from './ColorPickerPanel'
import { DrawToolPanel } from './DrawToolPanel'
import { ImageUploadPanel } from './ImageUploadPanel'
import type { ToolMode, Part3D } from '@/lib/types'

interface PropertiesPanelProps {
  currentTool: ToolMode
  caseColor: string
  brushColor: string
  brushSize: number
  onCaseColorChange: (color: string) => void
  onBrushColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
  onSelectPart: (part: Part3D) => void
  onImageUpload: (imageUrl: string) => void
  selectedPartId?: string
}

export function PropertiesPanel({
  currentTool,
  caseColor,
  brushColor,
  brushSize,
  onCaseColorChange,
  onBrushColorChange,
  onBrushSizeChange,
  onSelectPart,
  onImageUpload,
  selectedPartId,
}: PropertiesPanelProps) {
  const getTitleForTool = (tool: ToolMode): string => {
    switch (tool) {
      case 'select':
        return 'Selection'
      case 'draw':
        return 'Draw Tool'
      case 'image':
        return 'Add Image'
      case 'parts':
        return '3D Parts Library'
      case 'color':
        return 'Case Color'
      default:
        return 'Properties'
    }
  }

  return (
    <div className="w-full lg:w-[320px] h-auto lg:h-full bg-card border-t lg:border-l border-border p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        {getTitleForTool(currentTool)}
      </h2>

      <div className="flex-1 overflow-hidden">
        {currentTool === 'color' && (
          <ColorPickerPanel currentColor={caseColor} onColorChange={onCaseColorChange} />
        )}

        {currentTool === 'draw' && (
          <DrawToolPanel
            brushColor={brushColor}
            brushSize={brushSize}
            onBrushColorChange={onBrushColorChange}
            onBrushSizeChange={onBrushSizeChange}
          />
        )}

        {currentTool === 'image' && <ImageUploadPanel onImageUpload={onImageUpload} />}

        {currentTool === 'parts' && (
          <PartsLibraryPanel onSelectPart={onSelectPart} selectedPartId={selectedPartId} />
        )}

        {currentTool === 'select' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground p-8">
              <p className="text-sm">
                Select a tool from the toolbar to start customizing your phone case
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
