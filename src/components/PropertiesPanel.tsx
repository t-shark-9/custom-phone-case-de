import { PartsLibraryPanel } from './PartsLibraryPanel'
import { ColorPickerPanel } from './ColorPickerPanel'
import { DrawToolPanel } from './DrawToolPanel'
import { ImageUploadPanel } from './ImageUploadPanel'
import { TexturePanel } from './TexturePanel'
import { DecalPanel } from './DecalPanel'
import type { ToolMode, Part3D, PhoneModel, CaseTexture, PlacedDecal } from '@/lib/types'
import { PHONE_MODELS } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface PropertiesPanelProps {
  currentTool: ToolMode
  phoneModel: PhoneModel
  caseColor: string
  caseTexture?: CaseTexture | null
  brushColor: string
  brushSize: number
  decals?: PlacedDecal[]
  selectedDecalId?: string | null
  onPhoneModelChange: (model: PhoneModel) => void
  onCaseColorChange: (color: string) => void
  onTextureChange?: (texture: CaseTexture) => void
  onBrushColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
  onSelectPart: (part: Part3D) => void
  onImageUpload: (imageUrl: string) => void
  onAddDecal?: (imageUrl: string) => void
  onUpdateDecal?: (id: string, updates: Partial<PlacedDecal>) => void
  onDeleteDecal?: (id: string) => void
  onSelectDecal?: (id: string | null) => void
  selectedPartId?: string
  isMobile?: boolean
}

export function PropertiesPanel({
  currentTool,
  phoneModel,
  caseColor,
  caseTexture,
  brushColor,
  brushSize,
  decals = [],
  selectedDecalId = null,
  onPhoneModelChange,
  onCaseColorChange,
  onTextureChange,
  onBrushColorChange,
  onBrushSizeChange,
  onSelectPart,
  onImageUpload,
  onAddDecal,
  onUpdateDecal,
  onDeleteDecal,
  onSelectDecal,
  selectedPartId,
  isMobile = false,
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
      case 'texture':
        return 'Material & Texture'
      case 'decal':
        return 'Decals & Stickers'
      case 'uvmap':
        return 'UV Map Editor'
      default:
        return 'Properties'
    }
  }

  return (
    <div className={`${isMobile ? 'w-full' : 'w-full lg:w-[320px] h-auto lg:h-full'} bg-card ${isMobile ? '' : 'border-t lg:border-l border-border p-4'} flex flex-col gap-4`}>
      <div>
        {!isMobile && (
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            {getTitleForTool(currentTool)}
          </h2>
        )}

        {!isMobile && (
          <div className="space-y-3 mb-4">
            <div className="space-y-2">
              <Label htmlFor="phone-model" className="text-sm font-medium">
                Phone Model
              </Label>
              <Select value={phoneModel} onValueChange={(value) => onPhoneModelChange(value as PhoneModel)}>
                <SelectTrigger id="phone-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHONE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className={`${isMobile ? '' : 'flex-1'} overflow-hidden`}>
        {currentTool === 'color' && (
          <ColorPickerPanel currentColor={caseColor} onColorChange={onCaseColorChange} />
        )}

        {currentTool === 'texture' && onTextureChange && (
          <TexturePanel 
            currentTexture={caseTexture || null}
            currentColor={caseColor}
            onTextureChange={onTextureChange}
            onColorChange={onCaseColorChange}
          />
        )}

        {currentTool === 'decal' && onAddDecal && onUpdateDecal && onDeleteDecal && onSelectDecal && (
          <DecalPanel
            decals={decals}
            selectedDecalId={selectedDecalId}
            onAddDecal={onAddDecal}
            onUpdateDecal={onUpdateDecal}
            onDeleteDecal={onDeleteDecal}
            onSelectDecal={onSelectDecal}
          />
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
              <p className="text-sm mb-4">
                Select a tool from the toolbar to start customizing your phone case
              </p>
              <div className="text-xs space-y-2 text-left bg-muted/50 p-4 rounded-lg">
                <div>🎨 <strong>Color</strong> - Change case color</div>
                <div>✨ <strong>Texture</strong> - Add patterns & materials</div>
                <div>🖼️ <strong>Decal</strong> - Add images & stickers</div>
                <div>🔷 <strong>Parts</strong> - Add 3D decorations</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
