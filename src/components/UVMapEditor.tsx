import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Pencil, 
  Eraser, 
  PaintBucket, 
  ArrowCounterClockwise, 
  Download,
  Image,
  Trash,
  Eye,
  EyeSlash,
  Check,
  TextT
} from '@phosphor-icons/react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { PhoneModel, CaseTexture } from '@/lib/types'
import { PHONE_MODELS, PRESET_COLORS, FONT_OPTIONS } from '@/lib/types'

interface UVMapEditorProps {
  phoneModel: PhoneModel
  caseColor: string
  caseTexture?: CaseTexture | null
  onTextureUpdate: (imageDataUrl: string) => void
  onApply?: () => void
}

type DrawTool = 'brush' | 'eraser' | 'fill' | 'text'

export function UVMapEditor({
  phoneModel,
  caseColor,
  caseTexture,
  onTextureUpdate,
  onApply,
}: UVMapEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guideCanvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)
  const [currentTool, setCurrentTool] = useState<DrawTool>('brush')
  const [brushColor, setBrushColor] = useState('#FF69B4')
  const [brushSize, setBrushSize] = useState(20)
  const [showGuide, setShowGuide] = useState(true)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [uvData, setUvData] = useState<{ triangles: Array<[number, number, number, number, number, number]> } | null>(null)
  const [isLoadingModel, setIsLoadingModel] = useState(true)
  
  // Text tool state
  const [textInput, setTextInput] = useState('Hello!')
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].family)
  const [fontSize, setFontSize] = useState(32)

  const canvasWidth = 512
  const canvasHeight = 512

  // Load GLTF model and extract UV coordinates
  useEffect(() => {
    setIsLoadingModel(true)
    const loader = new GLTFLoader()
    const modelPath = phoneModel === 'iphone-14-pro' 
      ? '/models/iphone_14_pro.glb' 
      : '/models/iphone_16_pro.glb'

    loader.load(modelPath, (gltf) => {
      const model = gltf.scene
      
      // Find first mesh in the model
      let geometry: THREE.BufferGeometry | null = null
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && !geometry) {
          geometry = child.geometry
        }
      })
      
      if (!geometry) {
        setIsLoadingModel(false)
        return
      }
      
      // Center and compute bounds
      geometry.center()
      geometry.computeVertexNormals()
      geometry.computeBoundingBox()
      
      const positionAttribute = geometry.getAttribute('position')
      const normalAttribute = geometry.getAttribute('normal')
      const bbox = geometry.boundingBox!
      const size = new THREE.Vector3()
      bbox.getSize(size)
      
      // Generate UV coordinates using the same algorithm as PhoneCaseCanvas3D
      const triangles: Array<[number, number, number, number, number, number]> = []
      
      for (let i = 0; i < positionAttribute.count; i += 3) {
        const uvs: number[] = []
        
        for (let j = 0; j < 3; j++) {
          const idx = i + j
          const x = positionAttribute.getX(idx)
          const y = positionAttribute.getY(idx)
          const z = positionAttribute.getZ(idx)
          
          const nx = normalAttribute.getX(idx)
          const ny = normalAttribute.getY(idx)
          const nz = normalAttribute.getZ(idx)
          
          const absNx = Math.abs(nx)
          const absNy = Math.abs(ny)
          const absNz = Math.abs(nz)
          
          let u: number, v: number
          
          if (absNz >= absNx && absNz >= absNy) {
            u = (x - bbox.min.x) / size.x
            v = (y - bbox.min.y) / size.y
          } else if (absNx >= absNy && absNx >= absNz) {
            u = (z - bbox.min.z) / size.z
            v = (y - bbox.min.y) / size.y
          } else {
            u = (x - bbox.min.x) / size.x
            v = (z - bbox.min.z) / size.z
          }
          
          uvs.push(u, v)
        }
        
        triangles.push([uvs[0], uvs[1], uvs[2], uvs[3], uvs[4], uvs[5]])
      }
      
      setUvData({ triangles })
      setIsLoadingModel(false)
    }, undefined, () => {
      setIsLoadingModel(false)
    })
  }, [phoneModel])

  // Draw UV wireframe guide overlay
  const drawGuideOverlay = useCallback(() => {
    const canvas = guideCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    if (!showGuide || !uvData) return

    // Draw UV wireframe
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
    ctx.lineWidth = 0.5

    uvData.triangles.forEach(([u1, v1, u2, v2, u3, v3]) => {
      // Scale UV coordinates to canvas
      const x1 = u1 * canvasWidth
      const y1 = (1 - v1) * canvasHeight // Flip Y
      const x2 = u2 * canvasWidth
      const y2 = (1 - v2) * canvasHeight
      const x3 = u3 * canvasWidth
      const y3 = (1 - v3) * canvasHeight
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.closePath()
      ctx.stroke()
    })

    // Draw border
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight)

    // Label
    ctx.font = 'bold 12px sans-serif'
    ctx.fillStyle = '#3B82F6'
    ctx.fillText('UV LAYOUT (from 3D model)', 10, 20)
    
  }, [uvData, showGuide, canvasWidth, canvasHeight])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill with base color
    ctx.fillStyle = caseColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Save initial state
    saveToHistory()
    
    // Export initial texture
    setTimeout(() => exportTexture(), 100)
  }, [phoneModel])

  // Redraw guide when UV data loads or toggle changes
  useEffect(() => {
    drawGuideOverlay()
  }, [showGuide, uvData, drawGuideOverlay])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    
    // Remove any redo states
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    
    // Limit history
    if (newHistory.length > 50) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex, canvasWidth, canvasHeight])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const newIndex = historyIndex - 1
      ctx.putImageData(history[newIndex], 0, 0)
      setHistoryIndex(newIndex)
      exportTexture()
    }
  }, [historyIndex, history])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = caseColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    saveToHistory()
    exportTexture()
  }, [caseColor, canvasWidth, canvasHeight, saveToHistory])

  const exportTexture = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a flipped version for proper UV mapping
    const flippedCanvas = document.createElement('canvas')
    flippedCanvas.width = canvas.width
    flippedCanvas.height = canvas.height
    const flippedCtx = flippedCanvas.getContext('2d')
    if (!flippedCtx) return
    
    // Flip vertically for UV coordinate system
    flippedCtx.translate(0, flippedCanvas.height)
    flippedCtx.scale(1, -1)
    flippedCtx.drawImage(canvas, 0, 0)
    
    const dataUrl = flippedCanvas.toDataURL('image/png')
    onTextureUpdate(dataUrl)
  }, [onTextureUpdate])

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (currentTool === 'brush') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (lastPos) {
        ctx.beginPath()
        ctx.moveTo(lastPos.x, lastPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = brushColor
        ctx.fill()
      }
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = caseColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (lastPos) {
        ctx.beginPath()
        ctx.moveTo(lastPos.x, lastPos.y)
        ctx.lineTo(x, y)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = caseColor
        ctx.fill()
      }
    }

    setLastPos({ x, y })
  }

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4
    const startR = data[startPos]
    const startG = data[startPos + 1]
    const startB = data[startPos + 2]

    // Parse fill color
    const tempDiv = document.createElement('div')
    tempDiv.style.color = fillColor
    document.body.appendChild(tempDiv)
    const computedColor = getComputedStyle(tempDiv).color
    document.body.removeChild(tempDiv)
    const rgb = computedColor.match(/\d+/g)
    if (!rgb) return
    const fillR = parseInt(rgb[0])
    const fillG = parseInt(rgb[1])
    const fillB = parseInt(rgb[2])

    if (startR === fillR && startG === fillG && startB === fillB) return

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`
      
      if (visited.has(key)) continue
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
      
      const pos = (y * canvas.width + x) * 4
      if (
        Math.abs(data[pos] - startR) > 10 ||
        Math.abs(data[pos + 1] - startG) > 10 ||
        Math.abs(data[pos + 2] - startB) > 10
      ) continue

      visited.add(key)
      data[pos] = fillR
      data[pos + 1] = fillG
      data[pos + 2] = fillB
      data[pos + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e)
    
    if (currentTool === 'fill') {
      floodFill(coords.x, coords.y, brushColor)
      saveToHistory()
      exportTexture()
      return
    }

    if (currentTool === 'text') {
      // Place text at click position
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      ctx.font = `${fontSize}px ${selectedFont}`
      ctx.fillStyle = brushColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(textInput, coords.x, coords.y)
      saveToHistory()
      exportTexture()
      return
    }

    setIsDrawing(true)
    setLastPos(null)
    draw(coords.x, coords.y)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const coords = getCanvasCoords(e)
    draw(coords.x, coords.y)
  }

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setLastPos(null)
      saveToHistory()
      exportTexture()
    }
  }

  const handleMouseLeave = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setLastPos(null)
      saveToHistory()
      exportTexture()
    }
  }

  const downloadTexture = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `uv-texture-${phoneModel}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const uploadImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new window.Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // Draw image to fit canvas
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
          saveToHistory()
          exportTexture()
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="w-full h-full flex flex-col bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border p-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            UV Map Editor
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {PHONE_MODELS.find(m => m.id === phoneModel)?.name}
          </span>
          {onApply && (
            <Button onClick={onApply} size="sm" className="gap-2">
              <Check size={16} weight="bold" />
              Apply
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-64 bg-card border-r border-border p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Drawing Tools */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Draw Tools</Label>
            <div className="grid grid-cols-4 gap-1">
              <Button
                size="sm"
                variant={currentTool === 'brush' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('brush')}
                className="flex-col h-auto py-2 gap-1"
              >
                <Pencil size={18} />
                <span className="text-[10px]">Brush</span>
              </Button>
              <Button
                size="sm"
                variant={currentTool === 'eraser' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('eraser')}
                className="flex-col h-auto py-2 gap-1"
              >
                <Eraser size={18} />
                <span className="text-[10px]">Eraser</span>
              </Button>
              <Button
                size="sm"
                variant={currentTool === 'fill' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('fill')}
                className="flex-col h-auto py-2 gap-1"
              >
                <PaintBucket size={18} />
                <span className="text-[10px]">Fill</span>
              </Button>
              <Button
                size="sm"
                variant={currentTool === 'text' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('text')}
                className="flex-col h-auto py-2 gap-1"
              >
                <TextT size={18} />
                <span className="text-[10px]">Text</span>
              </Button>
            </div>
          </div>

          {/* Text Options - only show when text tool is selected */}
          {currentTool === 'text' && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <Label className="text-xs font-medium">Text Options</Label>
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="text-sm"
              />
              <div className="space-y-1">
                <Label className="text-xs">Font</Label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full h-8 px-2 text-sm rounded border border-border bg-background"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.id} value={font.family}>{font.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex justify-between">
                  <span>Size</span>
                  <span className="text-muted-foreground">{fontSize}px</span>
                </Label>
                <Slider
                  value={[fontSize]}
                  min={12}
                  max={120}
                  step={2}
                  onValueChange={([value]) => setFontSize(value)}
                />
              </div>
            </div>
          )}

          {/* Brush Size */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex justify-between">
              <span>Brush Size</span>
              <span className="text-muted-foreground">{brushSize}px</span>
            </Label>
            <Slider
              value={[brushSize]}
              min={1}
              max={100}
              step={1}
              onValueChange={([value]) => setBrushSize(value)}
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Brush Color</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border border-border"
              />
              <div className="flex-1">
                <div className="flex flex-wrap gap-1">
                  {PRESET_COLORS.slice(0, 8).map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBrushColor(color.value)}
                      className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                        brushColor === color.value ? 'border-primary scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Colors from case */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Case Color</Label>
            <button
              onClick={() => setBrushColor(caseColor)}
              className="w-full h-8 rounded border border-border flex items-center justify-center gap-2"
              style={{ backgroundColor: caseColor }}
            >
              <span className="text-xs font-medium px-2 py-0.5 bg-black/30 text-white rounded">
                Use Case Color
              </span>
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Actions */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Actions</Label>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                <ArrowCounterClockwise size={16} />
                <span className="ml-2">Undo</span>
              </Button>
              <Button size="sm" variant="outline" onClick={clearCanvas}>
                <Trash size={16} />
                <span className="ml-2">Clear</span>
              </Button>
              <Button size="sm" variant="outline" onClick={uploadImage}>
                <Image size={16} />
                <span className="ml-2">Upload Image</span>
              </Button>
              <Button size="sm" variant="outline" onClick={downloadTexture}>
                <Download size={16} />
                <span className="ml-2">Download</span>
              </Button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Guide Toggle */}
          <div className="space-y-2">
            <Button
              size="sm"
              variant={showGuide ? 'default' : 'outline'}
              onClick={() => setShowGuide(!showGuide)}
              className="w-full"
              disabled={isLoadingModel}
            >
              {showGuide ? <Eye size={16} /> : <EyeSlash size={16} />}
              <span className="ml-2">{showGuide ? 'Wireframe ON' : 'Wireframe OFF'}</span>
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#1a1a2e]"
        >
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
            {isLoadingModel && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading UV map from model...</p>
                </div>
              </div>
            )}
            {/* Main drawing canvas */}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="cursor-crosshair block"
              style={{ 
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 200px)',
                width: 'auto',
                height: 'auto',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            />
            {/* Guide overlay canvas */}
            <canvas
              ref={guideCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="absolute inset-0 pointer-events-none"
              style={{ 
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 200px)',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="bg-card border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Texture: {canvasWidth} × {canvasHeight}px | {uvData ? `${uvData.triangles.length} triangles` : 'Loading...'}
        </div>
        <div>
          💡 Paint on this canvas - it will be mapped to the 3D phone case using UV coordinates
        </div>
      </div>
    </div>
  )
}
