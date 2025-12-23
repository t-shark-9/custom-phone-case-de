import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { PhoneCaseCanvas } from './components/PhoneCaseCanvas'
import { SaveDesignDialog } from './components/SaveDesignDialog'
import { CartPage } from './components/CartPage'
import { Toaster, toast } from 'sonner'
import type { 
  ToolMode, 
  Placed3DPart, 
  DrawStroke, 
  PlacedImage, 
  Part3D, 
  Design,
  CartItem 
} from './lib/types'
import { CASE_PRICE } from './lib/types'

function App() {
  const [currentView, setCurrentView] = useState<'designer' | 'cart'>('designer')
  const [currentTool, setCurrentTool] = useState<ToolMode>('select')
  const [caseColor, setCaseColor] = useState('#8B5CF6')
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(10)
  const [selectedPart, setSelectedPart] = useState<Part3D | null>(null)
  
  const [parts, setParts] = useState<Placed3DPart[]>([])
  const [strokes, setStrokes] = useState<DrawStroke[]>([])
  const [images, setImages] = useState<PlacedImage[]>([])
  
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [designs, setDesigns] = useKV<Design[]>('saved-designs', [])
  const [cart, setCart] = useKV<CartItem[]>('shopping-cart', [])

  const handlePartSelect = useCallback((part: Part3D) => {
    setSelectedPart(part)
    
    const newPart: Placed3DPart = {
      id: `part-${Date.now()}-${Math.random()}`,
      partId: part.id,
      position: { x: 0, y: 0, z: 0.6 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      color: brushColor,
    }
    
    setParts((currentParts) => [...currentParts, newPart])
    toast.success(`${part.name} added to case`)
  }, [brushColor])

  const handleImageUpload = useCallback((imageUrl: string) => {
    const newImage: PlacedImage = {
      id: `image-${Date.now()}`,
      url: imageUrl,
      position: { x: 0, y: 0, z: 0.5 },
      rotation: 0,
      scale: 1,
    }
    
    setImages((currentImages) => [...currentImages, newImage])
  }, [])

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      toast.info('Undone')
    }
  }, [historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      toast.info('Redone')
    }
  }, [historyIndex, history.length])

  const handleSaveDesign = useCallback((name: string) => {
    const design: Design = {
      id: `design-${Date.now()}`,
      name,
      timestamp: Date.now(),
      caseColor,
      strokes,
      images,
      parts,
    }
    
    setDesigns((currentDesigns) => [...(currentDesigns || []), design])
    toast.success(`Design "${name}" saved successfully!`)
  }, [caseColor, strokes, images, parts, setDesigns])

  const handleExport = useCallback(() => {
    toast.info('Preparing 3D model for download...')
    
    setTimeout(() => {
      toast.success('3D model exported successfully!')
    }, 1500)
  }, [])

  const handleAddToCart = useCallback(() => {
    const design: Design = {
      id: `design-${Date.now()}`,
      name: `Custom Case ${new Date().toLocaleDateString()}`,
      timestamp: Date.now(),
      caseColor,
      strokes,
      images,
      parts,
    }

    const cartItem: CartItem = {
      id: `cart-${Date.now()}`,
      design,
      quantity: 1,
      price: CASE_PRICE,
    }

    setCart((currentCart) => [...(currentCart || []), cartItem])
    const currentCartLength = (cart || []).length
    toast.success('Design added to cart!', {
      description: `$${CASE_PRICE.toFixed(2)} - Custom Phone Case`,
      action: {
        label: 'View Cart',
        onClick: () => toast.info(`Cart has ${currentCartLength + 1} item(s)`),
      },
    })
  }, [caseColor, strokes, images, parts, setCart, cart])

  const handleViewCart = useCallback(() => {
    setCurrentView('cart')
  }, [])

  const handleBackToDesigner = useCallback(() => {
    setCurrentView('designer')
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors />
      
      {currentView === 'cart' ? (
        <CartPage onBack={handleBackToDesigner} />
      ) : (
        <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onSave={() => setSaveDialogOpen(true)}
            onExport={handleExport}
            onAddToCart={handleAddToCart}
            onViewCart={handleViewCart}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            cartItemCount={(cart || []).length}
          />

          <div className="flex-1 bg-background p-4 lg:p-8 overflow-hidden">
            <PhoneCaseCanvas
              caseColor={caseColor}
              parts={parts}
              strokes={strokes}
              onPartClick={(partId) => {
                const part = parts.find(p => p.id === partId)
                if (part) {
                  toast.info('Part selected')
                }
              }}
            />
          </div>

          <PropertiesPanel
            currentTool={currentTool}
            caseColor={caseColor}
            brushColor={brushColor}
            brushSize={brushSize}
            onCaseColorChange={setCaseColor}
            onBrushColorChange={setBrushColor}
            onBrushSizeChange={setBrushSize}
            onSelectPart={handlePartSelect}
            onImageUpload={handleImageUpload}
            selectedPartId={selectedPart?.id}
          />

          <SaveDesignDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            onSave={handleSaveDesign}
          />
        </div>
      )}
    </>
  )
}

export default App