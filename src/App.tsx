import { useState, useCallback, useEffect } from 'react'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { PhoneCaseCanvas3D } from './components/PhoneCaseCanvas3D'
import { UVMapEditor } from './components/UVMapEditor'
import { MetaballPanel } from './components/MetaballPanel'
import { SaveDesignDialog } from './components/SaveDesignDialog'
import { CartPage } from './components/CartPage'
import { SavedDesignsGallery } from './components/SavedDesignsGallery'
import { Model3DGallery } from './components/Model3DGallery'
import { HomePage } from './components/HomePage'
import { Toaster, toast } from 'sonner'
import type { 
  ToolMode, 
  Placed3DPart, 
  DrawStroke, 
  PlacedImage, 
  PlacedDecal,
  Metaball,
  Part3D, 
  Design,
  CartItem,
  PhoneModel,
  CaseTexture
} from './lib/types'
import { CASE_PRICE, getPhoneModel } from './lib/types'

// Custom hook to replace useKV for local storage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'designer' | 'cart' | 'gallery' | '3d-models'>('home')
  const [currentTool, setCurrentTool] = useState<ToolMode>('select')
  const [phoneModel, setPhoneModel] = useState<PhoneModel>('iphone-16-pro')
  const [caseColor, setCaseColor] = useState('#8B5CF6')
  const [caseTexture, setCaseTexture] = useState<CaseTexture | null>(null)
  const [uvTextureUrl, setUvTextureUrl] = useState<string | null>(null)
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(10)
  const [selectedPart, setSelectedPart] = useState<Part3D | null>(null)
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileToolPanelOpen, setIsMobileToolPanelOpen] = useState(false)
  
  const [parts, setParts] = useState<Placed3DPart[]>([])
  const [strokes, setStrokes] = useState<DrawStroke[]>([])
  const [images, setImages] = useState<PlacedImage[]>([])
  const [decals, setDecals] = useState<PlacedDecal[]>([])
  const [metaballs, setMetaballs] = useState<Metaball[]>([])
  
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [designs, setDesigns] = useLocalStorage<Design[]>('saved-designs', [])
  const [cart, setCart] = useLocalStorage<CartItem[]>('shopping-cart', [])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleStartDesigning = useCallback((model: PhoneModel) => {
    setPhoneModel(model)
    setCaseColor('#8B5CF6')
    setCaseTexture(null)
    setParts([])
    setDecals([])
    setStrokes([])
    setImages([])
    setMetaballs([])
    setCurrentView('designer')
    const modelSpec = getPhoneModel(model)
    toast.success(`Designing ${modelSpec?.name || model} case`)
  }, [])

  const handlePartSelect = useCallback((part: Part3D) => {
    setSelectedPart(part)
    
    const newPart: Placed3DPart = {
      id: `part-${Date.now()}-${Math.random()}`,
      partId: part.id,
      position: { x: 0, y: 0, z: 15 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      color: brushColor,
      useCustomColor: true, // Default: use own color, not case texture
    }
    
    setParts((currentParts) => [...currentParts, newPart])
    toast.success(`${part.name} added! 🎉`, {
      description: 'Click on it to select, then drag to move',
      duration: 3000,
    })
  }, [brushColor])

  const handlePartUpdate = useCallback((partId: string, updates: Partial<Placed3DPart>) => {
    setParts((currentParts) => 
      currentParts.map(part => 
        part.id === partId ? { ...part, ...updates } : part
      )
    )
  }, [])

  const handlePartDelete = useCallback((partId: string) => {
    setParts((currentParts) => currentParts.filter(part => part.id !== partId))
    toast.success('Part removed')
  }, [])

  const handleDecalAdd = useCallback((imageUrl: string) => {
    const newDecal: PlacedDecal = {
      id: `decal-${Date.now()}`,
      url: imageUrl,
      position: { x: 0, y: 0, z: 20 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      opacity: 1,
    }
    
    setDecals((currentDecals) => [...currentDecals, newDecal])
    toast.success('Decal added! 🎉', {
      description: 'Click on it to select, then drag to move',
      duration: 3000,
    })
  }, [])

  const handleDecalUpdate = useCallback((decalId: string, updates: Partial<PlacedDecal>) => {
    setDecals((currentDecals) => 
      currentDecals.map(decal => 
        decal.id === decalId ? { ...decal, ...updates } : decal
      )
    )
  }, [])

  const handleDecalDelete = useCallback((decalId: string) => {
    setDecals((currentDecals) => currentDecals.filter(decal => decal.id !== decalId))
    setSelectedDecalId(null)
    toast.success('Decal removed')
  }, [])

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

  const handleTextureChange = useCallback((texture: CaseTexture) => {
    setCaseTexture(texture)
    if (texture.color) {
      setCaseColor(texture.color)
    }
  }, [])

  const handleUVTextureUpdate = useCallback((imageDataUrl: string) => {
    setUvTextureUrl(imageDataUrl)
    // Update case texture to use the UV map
    setCaseTexture({
      id: 'uv-custom',
      type: 'image',
      imageUrl: imageDataUrl,
      roughness: caseTexture?.roughness ?? 0.4,
      metalness: caseTexture?.metalness ?? 0.1,
      opacity: caseTexture?.opacity ?? 1,
    })
  }, [caseTexture])

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
      phoneModel,
      caseColor,
      caseTexture: caseTexture || undefined,
      strokes,
      images,
      decals,
      parts,
    }
    
    setDesigns((currentDesigns) => [...(currentDesigns || []), design])
    toast.success(`Design "${name}" saved successfully!`)
  }, [phoneModel, caseColor, caseTexture, strokes, images, decals, parts, setDesigns])

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
      phoneModel,
      caseColor,
      caseTexture: caseTexture || undefined,
      strokes,
      images,
      decals,
      parts,
    }

    const cartItem: CartItem = {
      id: `cart-${Date.now()}`,
      design,
      quantity: 1,
      price: CASE_PRICE,
    }

    setCart((currentCart) => [...(currentCart || []), cartItem])
    toast.success('Design added to cart!', {
      description: `$${CASE_PRICE.toFixed(2)} - Custom Phone Case`,
      action: {
        label: 'View Cart',
        onClick: () => setCurrentView('cart'),
      },
    })
  }, [phoneModel, caseColor, caseTexture, strokes, images, decals, parts, setCart])

  const handleViewCart = useCallback(() => {
    setCurrentView('cart')
  }, [])

  const handleBackToDesigner = useCallback(() => {
    setCurrentView('designer')
  }, [])

  const handleBackToHome = useCallback(() => {
    setCurrentView('home')
  }, [])

  const handleViewGallery = useCallback(() => {
    setCurrentView('gallery')
  }, [])

  const handleView3DModels = useCallback(() => {
    setCurrentView('3d-models')
  }, [])

  const handleLoadDesign = useCallback((design: Design) => {
    setPhoneModel(design.phoneModel || 'iphone-16-pro')
    setCaseColor(design.caseColor)
    setCaseTexture(design.caseTexture || null)
    setStrokes(design.strokes)
    setImages(design.images)
    setDecals(design.decals || [])
    setParts(design.parts)
    setCurrentView('designer')
    toast.success('Design loaded!')
  }, [])

  const handleClearDesign = useCallback(() => {
    setParts([])
    setStrokes([])
    setImages([])
    setDecals([])
    setCaseTexture(null)
    setCaseColor('#8B5CF6')
    toast.success('Design cleared')
  }, [])

  // Toggle mobile tool panel
  const toggleMobileToolPanel = useCallback(() => {
    setIsMobileToolPanelOpen(prev => !prev)
  }, [])

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      
      {currentView === 'home' ? (
        <HomePage
          onStartDesigning={handleStartDesigning}
          onViewCart={handleViewCart}
          onViewGallery={handleViewGallery}
          cartItemCount={(cart || []).length}
        />
      ) : currentView === 'gallery' ? (
        <SavedDesignsGallery 
          onBack={handleBackToHome} 
          onLoadDesign={handleLoadDesign}
        />
      ) : currentView === 'cart' ? (
        <CartPage onBack={handleBackToHome} />
      ) : currentView === '3d-models' ? (
        <div className="h-screen w-screen overflow-auto bg-gray-50">
          <Model3DGallery />
          <div className="fixed top-4 left-4">
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Designer
            </button>
          </div>
        </div>
      ) : (
        <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-background">
          {/* Unified Header for all screen sizes */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBackToHome}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h1 className="text-lg font-bold text-primary">CaseCanvas</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleViewGallery}
                className="p-2 hover:bg-muted rounded-lg transition-colors hidden sm:block"
                title="My Designs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </button>
              <button
                onClick={handleViewCart}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {(cart || []).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {(cart || []).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-background overflow-hidden pt-14 pb-[180px]">
            {currentTool === 'uvmap' ? (
              <UVMapEditor
                phoneModel={phoneModel}
                caseColor={caseColor}
                caseTexture={caseTexture}
                onTextureUpdate={handleUVTextureUpdate}
                onApply={() => {
                  setCurrentTool('select')
                  toast.success('Texture applied to phone case!')
                }}
              />
            ) : currentTool === 'metaball' ? (
              <MetaballPanel
                metaballs={metaballs}
                caseColor={caseColor}
                onAddMetaball={(type) => {
                  const newMetaball: Metaball = {
                    id: `metaball-${Date.now()}`,
                    type,
                    position: { x: 0, y: 0, z: 30 },
                    scale: 1,
                    influence: 1,
                    color: caseColor,
                    smoothness: 0.7,
                    depth: 0.5,
                  }
                  setMetaballs([...metaballs, newMetaball])
                  toast.success(`Added ${type}!`, {
                    description: 'Tap on it to edit size and smoothness'
                  })
                }}
                onUpdateMetaball={(id, updates) => {
                  setMetaballs(metaballs.map(m => m.id === id ? { ...m, ...updates } : m))
                }}
                onDeleteMetaball={(id) => {
                  setMetaballs(metaballs.filter(m => m.id !== id))
                  toast.info('Item deleted')
                }}
              />
            ) : (
              <div className="h-full p-2 lg:p-8">
                <PhoneCaseCanvas3D
                  phoneModel={phoneModel}
                  caseColor={caseColor}
                  caseTexture={caseTexture}
                  parts={parts}
                  decals={decals}
                  strokes={strokes}
                  metaballs={metaballs}
                  onPartClick={(partId) => {
                    toast.info('Part selected - drag to move')
                  }}
                  onPartUpdate={handlePartUpdate}
                  onPartDelete={handlePartDelete}
                  onDecalClick={(decalId) => {
                    setSelectedDecalId(decalId)
                  }}
                  onDecalUpdate={handleDecalUpdate}
                  onDecalDelete={handleDecalDelete}
                  onMetaballClick={(metaballId) => {
                    toast.info('Metaball selected - drag to move')
                  }}
                  onMetaballUpdate={(id, updates) => {
                    setMetaballs(metaballs.map(m => m.id === id ? { ...m, ...updates } : m))
                  }}
                  onMetaballDelete={(id) => {
                    setMetaballs(metaballs.filter(m => m.id !== id))
                    toast.info('Metaball deleted')
                  }}
                />
              </div>
            )}
          </div>

          {/* Unified Bottom Toolbar for all screen sizes */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
            {/* Tool Options Panel (slides up when a tool is selected) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileToolPanelOpen ? 'max-h-[40vh]' : 'max-h-0'}`}>
              <div className="p-4 max-h-[40vh] overflow-y-auto">
                <PropertiesPanel
                  currentTool={currentTool}
                  phoneModel={phoneModel}
                  caseColor={caseColor}
                  caseTexture={caseTexture}
                  brushColor={brushColor}
                  brushSize={brushSize}
                  decals={decals}
                  selectedDecalId={selectedDecalId}
                  onPhoneModelChange={setPhoneModel}
                  onCaseColorChange={setCaseColor}
                  onTextureChange={handleTextureChange}
                  onBrushColorChange={setBrushColor}
                  onBrushSizeChange={setBrushSize}
                  onSelectPart={handlePartSelect}
                  onImageUpload={handleImageUpload}
                  onAddDecal={handleDecalAdd}
                  onUpdateDecal={handleDecalUpdate}
                  onDeleteDecal={handleDecalDelete}
                  onSelectDecal={setSelectedDecalId}
                  selectedPartId={selectedPart?.id}
                  isMobile={true}
                />
              </div>
            </div>

            {/* Tools Row */}
            <div className="flex items-center justify-around px-2 py-2 border-t border-border bg-card">
              {[
                { id: 'select' as ToolMode, icon: '👆', label: 'Select' },
                { id: 'color' as ToolMode, icon: '🎨', label: 'Color' },
                { id: 'texture' as ToolMode, icon: '✨', label: 'Texture' },
                { id: 'uvmap' as ToolMode, icon: '✏️', label: 'UV Map' },
                { id: 'decal' as ToolMode, icon: '🎀', label: 'Decals' },
                { id: 'parts' as ToolMode, icon: '💎', label: '3D Parts' },
                { id: 'metaball' as ToolMode, icon: '⚪', label: 'Metaballs' },
                { id: 'image' as ToolMode, icon: '🖼️', label: 'Images' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setCurrentTool(tool.id)
                    if (tool.id !== 'select') {
                      setIsMobileToolPanelOpen(true)
                    } else {
                      setIsMobileToolPanelOpen(false)
                    }
                  }}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
                    currentTool === tool.id
                      ? 'bg-primary text-primary-foreground scale-105'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">{tool.icon}</span>
                  <span className="text-[10px] font-medium">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                </button>
                <button
                  onClick={() => setSaveDialogOpen(true)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
                </button>
                <button
                  onClick={handleClearDesign}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                $29.99
              </button>
            </div>
          </div>

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