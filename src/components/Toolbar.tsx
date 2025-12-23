import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Pencil, 
  Image, 
  Cube, 
  PaintBucket, 
  ArrowCounterClockwise, 
  ArrowClockwise,
  FloppyDisk,
  Download,
  ShoppingCart
} from '@phosphor-icons/react'
import type { ToolMode } from '@/lib/types'

interface ToolbarProps {
  currentTool: ToolMode
  onToolChange: (tool: ToolMode) => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onExport: () => void
  onAddToCart: () => void
  onViewCart: () => void
  canUndo: boolean
  canRedo: boolean
  cartItemCount: number
}

export function Toolbar({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onAddToCart,
  onViewCart,
  canUndo,
  canRedo,
  cartItemCount,
}: ToolbarProps) {
  const tools: Array<{ id: ToolMode; icon: React.ReactNode; label: string }> = [
    { id: 'select', icon: <Cube size={20} />, label: 'Select' },
    { id: 'draw', icon: <Pencil size={20} />, label: 'Draw' },
    { id: 'image', icon: <Image size={20} />, label: 'Add Image' },
    { id: 'parts', icon: <Cube size={20} />, label: '3D Parts' },
    { id: 'color', icon: <PaintBucket size={20} />, label: 'Case Color' },
  ]

  return (
    <TooltipProvider>
      <div className="w-full lg:w-[280px] h-auto lg:h-full bg-card border-b lg:border-r border-border p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
            CaseCanvas
          </h1>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Tools</div>
          <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'default' : 'outline'}
                    className={`justify-start ${
                      currentTool === tool.id
                        ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20'
                        : ''
                    }`}
                    onClick={() => onToolChange(tool.id)}
                  >
                    <span className="flex items-center gap-2">
                      {tool.icon}
                      <span className="hidden lg:inline">{tool.label}</span>
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground mb-2">Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                >
                  <ArrowCounterClockwise size={18} />
                  <span className="hidden lg:inline ml-2">Undo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                >
                  <ArrowClockwise size={18} />
                  <span className="hidden lg:inline ml-2">Redo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          <Button variant="outline" onClick={onSave} className="w-full">
            <FloppyDisk size={18} />
            <span className="ml-2">Save Design</span>
          </Button>

          <Button variant="outline" onClick={onExport} className="w-full">
            <Download size={18} />
            <span className="ml-2">Export 3D Model</span>
          </Button>
        </div>

        <div className="mt-auto space-y-2">
          <Button 
            onClick={onAddToCart} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            size="lg"
          >
            <ShoppingCart size={20} />
            <span className="ml-2">Add to Cart - $29.99</span>
          </Button>
          
          {cartItemCount > 0 && (
            <Button 
              onClick={onViewCart} 
              variant="outline"
              className="w-full relative"
            >
              <ShoppingCart size={18} />
              <span className="ml-2">View Cart</span>
              <Badge className="ml-auto">{cartItemCount}</Badge>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
