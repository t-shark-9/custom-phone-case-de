import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js'
import type { Placed3DPart, DrawStroke, PhoneModel, CaseTexture, PlacedDecal, Metaball, PhoneModelSpec } from '@/lib/types'
import { PHONE_MODELS, getPhoneModel } from '@/lib/types'
import { createPhoneCaseGeometry, getCaseScaleFactor } from '@/lib/case-generator'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Trash, X, ArrowsOutCardinal, ArrowsClockwise, ArrowsOut, Palette, LinkSimple, LinkSimpleBreak } from '@phosphor-icons/react'
import { Switch } from '@/components/ui/switch'

interface PhoneCaseCanvasProps {
  phoneModel: PhoneModel
  caseColor: string
  caseTexture?: CaseTexture | null
  parts: Placed3DPart[]
  decals: PlacedDecal[]
  strokes: DrawStroke[]
  metaballs?: Metaball[]
  onPartClick?: (partId: string) => void
  onPartUpdate?: (partId: string, updates: Partial<Placed3DPart>) => void
  onPartDelete?: (partId: string) => void
  onDecalClick?: (decalId: string) => void
  onDecalUpdate?: (decalId: string, updates: Partial<PlacedDecal>) => void
  onDecalDelete?: (decalId: string) => void
  onMetaballClick?: (metaballId: string) => void
  onMetaballUpdate?: (metaballId: string, updates: Partial<Metaball>) => void
  onMetaballDelete?: (metaballId: string) => void
}

type SelectedObject = {
  type: 'part' | 'decal' | 'metaball'
  id: string
} | null

export function PhoneCaseCanvas3D({ 
  phoneModel, 
  caseColor, 
  caseTexture,
  parts, 
  decals,
  strokes,
  metaballs = [],
  onPartClick, 
  onPartUpdate,
  onPartDelete,
  onDecalClick,
  onDecalUpdate,
  onDecalDelete,
  onMetaballClick,
  onMetaballUpdate,
  onMetaballDelete,
}: PhoneCaseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const marchingCubesRef = useRef<MarchingCubes | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const caseMeshRef = useRef<THREE.Mesh | null>(null)
  const partsGroupRef = useRef<THREE.Group | null>(null)
  const decalsGroupRef = useRef<THREE.Group | null>(null)
  const metaballsGroupRef = useRef<THREE.Group | null>(null)
  const partMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const decalMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const metaballMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const textureLoaderRef = useRef<THREE.TextureLoader>(new THREE.TextureLoader())
  const outlineMeshRef = useRef<THREE.Mesh | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'move' | 'rotate' | 'scale'>('move')

  // Get the selected item's data
  const getSelectedItem = useCallback(() => {
    if (!selectedObject) return null
    if (selectedObject.type === 'part') {
      return parts.find(p => p.id === selectedObject.id)
    } else if (selectedObject.type === 'decal') {
      return decals.find(d => d.id === selectedObject.id)
    } else if (selectedObject.type === 'metaball') {
      return metaballs.find(m => m.id === selectedObject.id)
    }
    return null
  }, [selectedObject, parts, decals, metaballs])

  const selectedItem = getSelectedItem()

  // Get the phone model spec for the current phone
  const getPhoneSpec = (model: PhoneModel): PhoneModelSpec | undefined => {
    return getPhoneModel(model)
  }

  // Generate pattern texture
  const generatePatternTexture = useCallback((patternType: string, color: string): THREE.Texture => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 512, 512)

    switch (patternType) {
      case 'carbon':
        ctx.fillStyle = '#2a2a2a'
        for (let y = 0; y < 512; y += 8) {
          for (let x = 0; x < 512; x += 8) {
            if ((x + y) % 16 === 0) {
              ctx.fillRect(x, y, 4, 4)
            }
          }
        }
        break
      case 'stripes':
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 4
        for (let i = -512; i < 1024; i += 20) {
          ctx.beginPath()
          ctx.moveTo(i, 0)
          ctx.lineTo(i + 512, 512)
          ctx.stroke()
        }
        break
      case 'dots':
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        for (let y = 10; y < 512; y += 30) {
          for (let x = 10; x < 512; x += 30) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        break
      case 'checker':
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        for (let y = 0; y < 512; y += 32) {
          for (let x = 0; x < 512; x += 32) {
            if ((x / 32 + y / 32) % 2 === 0) {
              ctx.fillRect(x, y, 32, 32)
            }
          }
        }
        break
      case 'wood':
        const gradient = ctx.createLinearGradient(0, 0, 512, 0)
        gradient.addColorStop(0, '#8B4513')
        gradient.addColorStop(0.3, '#A0522D')
        gradient.addColorStop(0.6, '#8B4513')
        gradient.addColorStop(1, '#6B3E0A')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 512)
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1
        for (let y = 0; y < 512; y += 15) {
          ctx.beginPath()
          ctx.moveTo(0, y + Math.sin(y * 0.1) * 3)
          ctx.lineTo(512, y + Math.sin(y * 0.1 + 1) * 3)
          ctx.stroke()
        }
        break
      case 'marble':
        ctx.fillStyle = '#f5f5f5'
        ctx.fillRect(0, 0, 512, 512)
        ctx.strokeStyle = 'rgba(150,150,150,0.3)'
        ctx.lineWidth = 2
        for (let i = 0; i < 20; i++) {
          ctx.beginPath()
          ctx.moveTo(Math.random() * 512, Math.random() * 512)
          ctx.bezierCurveTo(
            Math.random() * 512, Math.random() * 512,
            Math.random() * 512, Math.random() * 512,
            Math.random() * 512, Math.random() * 512
          )
          ctx.stroke()
        }
        break
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 2)
    return texture
  }, [])

  // Generate gradient texture
  const generateGradientTexture = useCallback((colors: string[], angle: number = 45): THREE.Texture => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    const radians = (angle * Math.PI) / 180
    const x1 = 256 - Math.cos(radians) * 256
    const y1 = 256 - Math.sin(radians) * 256
    const x2 = 256 + Math.cos(radians) * 256
    const y2 = 256 + Math.sin(radians) * 256
    
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color)
    })
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Update visual selection indicator
  const updateSelectionOutline = useCallback(() => {
    if (!sceneRef.current) return
    
    // Remove old outline
    if (outlineMeshRef.current) {
      sceneRef.current.remove(outlineMeshRef.current)
      outlineMeshRef.current.geometry.dispose()
      ;(outlineMeshRef.current.material as THREE.Material).dispose()
      outlineMeshRef.current = null
    }

    if (!selectedObject) return

    // Find the selected mesh
    let selectedMesh: THREE.Mesh | undefined
    if (selectedObject.type === 'part') {
      selectedMesh = partMeshesRef.current.get(selectedObject.id)
    } else if (selectedObject.type === 'decal') {
      selectedMesh = decalMeshesRef.current.get(selectedObject.id)
    } else if (selectedObject.type === 'metaball') {
      selectedMesh = metaballMeshesRef.current.get(selectedObject.id)
    }

    if (selectedMesh) {
      // Create glowing outline effect
      const outlineGeometry = selectedMesh.geometry.clone()
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.5,
      })
      const outline = new THREE.Mesh(outlineGeometry, outlineMaterial)
      outline.position.copy(selectedMesh.position)
      outline.rotation.copy(selectedMesh.rotation)
      outline.scale.copy(selectedMesh.scale).multiplyScalar(1.15)
      sceneRef.current.add(outline)
      outlineMeshRef.current = outline
    }
  }, [selectedObject])

  // Update case material based on texture settings
  const updateCaseMaterial = useCallback(() => {
    if (!caseMeshRef.current) return

    const material = caseMeshRef.current.material as THREE.MeshStandardMaterial

    if (caseTexture) {
      material.roughness = caseTexture.roughness
      material.metalness = caseTexture.metalness
      material.opacity = caseTexture.opacity
      material.transparent = caseTexture.opacity < 1

      if (caseTexture.type === 'color') {
        material.map = null
        material.color.set(caseTexture.color || caseColor)
      } else if (caseTexture.type === 'image' && caseTexture.imageUrl) {
        textureLoaderRef.current.load(caseTexture.imageUrl, (texture) => {
          texture.wrapS = THREE.ClampToEdgeWrapping
          texture.wrapT = THREE.ClampToEdgeWrapping
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.flipY = false // UV-mapped textures should not be flipped
          material.map = texture
          material.color.set(0xffffff) // Set to white so texture shows properly
          material.needsUpdate = true
        })
      } else if (caseTexture.type === 'pattern' && caseTexture.patternType) {
        const patternTexture = generatePatternTexture(
          caseTexture.patternType, 
          caseTexture.color || caseColor
        )
        material.map = patternTexture
        material.color.set(0xffffff)
      } else if (caseTexture.type === 'gradient' && caseTexture.gradientColors) {
        const gradientTexture = generateGradientTexture(
          caseTexture.gradientColors,
          caseTexture.gradientAngle
        )
        material.map = gradientTexture
        material.color.set(0xffffff)
      }
    } else {
      material.map = null
      material.color.set(caseColor)
      material.roughness = 0.4
      material.metalness = 0.1
      material.opacity = 1
      material.transparent = false
    }

    material.needsUpdate = true
  }, [caseColor, caseTexture, generatePatternTexture, generateGradientTexture])

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    setIsLoading(true)
    setLoadError(null)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f3ff)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 150)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 80
    controls.maxDistance = 300
    controls.enablePan = true
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2)
    mainLight.position.set(5, 5, 5)
    mainLight.castShadow = true
    scene.add(mainLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
    fillLight.position.set(-5, 0, -5)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
    backLight.position.set(0, -5, -5)
    scene.add(backLight)

    // Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture

    const partsGroup = new THREE.Group()
    scene.add(partsGroup)
    partsGroupRef.current = partsGroup

    const decalsGroup = new THREE.Group()
    scene.add(decalsGroup)
    decalsGroupRef.current = decalsGroup

    const metaballsGroup = new THREE.Group()
    scene.add(metaballsGroup)
    metaballsGroupRef.current = metaballsGroup

    // Generate phone case geometry procedurally
    const phoneSpec = getPhoneSpec(phoneModel)
    
    if (!phoneSpec) {
      setLoadError(`Phone model ${phoneModel} not found`)
      setIsLoading(false)
      return
    }

    // Create case geometry using our generator
    const geometry = createPhoneCaseGeometry(phoneSpec)
    geometry.center()
    geometry.computeVertexNormals()
    
    // Generate proper UV coordinates using box projection based on surface normals
    const positionAttribute = geometry.getAttribute('position')
    const normalAttribute = geometry.getAttribute('normal')
    const uvs: number[] = []
    
    // Get bounding box for UV mapping
    geometry.computeBoundingBox()
    const bbox = geometry.boundingBox!
    const size = new THREE.Vector3()
    bbox.getSize(size)
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)
      const z = positionAttribute.getZ(i)
      
      const nx = normalAttribute.getX(i)
      const ny = normalAttribute.getY(i)
      const nz = normalAttribute.getZ(i)
      
      // Determine which axis the face is most aligned with
      const absNx = Math.abs(nx)
      const absNy = Math.abs(ny)
      const absNz = Math.abs(nz)
      
      let u: number, v: number
      
      if (absNz >= absNx && absNz >= absNy) {
        // Front/Back face (Z-aligned) - this is the main back of the phone case
        u = (x - bbox.min.x) / size.x
        v = (y - bbox.min.y) / size.y
      } else if (absNx >= absNy && absNx >= absNz) {
        // Left/Right face (X-aligned) - sides
        u = (z - bbox.min.z) / size.z
        v = (y - bbox.min.y) / size.y
      } else {
        // Top/Bottom face (Y-aligned)
        u = (x - bbox.min.x) / size.x
        v = (z - bbox.min.z) / size.z
      }
      
      uvs.push(u, v)
    }
    
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))

        const caseMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(caseColor),
          roughness: 0.4,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })

        const caseMesh = new THREE.Mesh(geometry, caseMaterial)
        caseMesh.castShadow = true
        caseMesh.receiveShadow = true
        
        // Scale based on phone dimensions for consistent display
        const scaleFactor = getCaseScaleFactor(phoneSpec)
        caseMesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
        
        // Standard rotation for case display
        caseMesh.rotation.x = Math.PI / 2
        caseMesh.rotation.y = Math.PI
        
        scene.add(caseMesh)
        caseMeshRef.current = caseMesh

        // Create MarchingCubes for metaballs
        const resolution = 28
        const metaballMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(caseColor),
          roughness: 0.3,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
        const marchingCubes = new MarchingCubes(resolution, metaballMaterial, true, true, 100000)
        marchingCubes.position.set(0, 0, 30)
        marchingCubes.scale.set(30, 40, 10)
        scene.add(marchingCubes)
        marchingCubesRef.current = marchingCubes

        setIsLoading(false)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      pmremGenerator.dispose()
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [phoneModel])

  // Mouse event handlers for selection and dragging
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current) return

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return // Only left click
      
      const rect = containerRef.current!.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!)
      
      // Check parts
      if (partsGroupRef.current) {
        const partIntersects = raycasterRef.current.intersectObjects(partsGroupRef.current.children, false)
        if (partIntersects.length > 0) {
          const clickedMesh = partIntersects[0].object as THREE.Mesh
          const partId = Array.from(partMeshesRef.current.entries()).find(([_, mesh]) => mesh === clickedMesh)?.[0]
          
          if (partId) {
            setSelectedObject({ type: 'part', id: partId })
            setIsDragging(true)
            setDragStart({ x: event.clientX, y: event.clientY })
            if (controlsRef.current) controlsRef.current.enabled = false
            onPartClick?.(partId)
            return
          }
        }
      }

      // Check decals
      if (decalsGroupRef.current) {
        const decalIntersects = raycasterRef.current.intersectObjects(decalsGroupRef.current.children, false)
        if (decalIntersects.length > 0) {
          const clickedMesh = decalIntersects[0].object as THREE.Mesh
          const decalId = Array.from(decalMeshesRef.current.entries()).find(([_, mesh]) => mesh === clickedMesh)?.[0]
          
          if (decalId) {
            setSelectedObject({ type: 'decal', id: decalId })
            setIsDragging(true)
            setDragStart({ x: event.clientX, y: event.clientY })
            if (controlsRef.current) controlsRef.current.enabled = false
            onDecalClick?.(decalId)
            return
          }
        }
      }

      // Check metaballs
      if (metaballsGroupRef.current) {
        const metaballIntersects = raycasterRef.current.intersectObjects(metaballsGroupRef.current.children, false)
        if (metaballIntersects.length > 0) {
          const clickedMesh = metaballIntersects[0].object as THREE.Mesh
          const metaballId = Array.from(metaballMeshesRef.current.entries()).find(([_, mesh]) => mesh === clickedMesh)?.[0]
          
          if (metaballId) {
            setSelectedObject({ type: 'metaball', id: metaballId })
            setIsDragging(true)
            setDragStart({ x: event.clientX, y: event.clientY })
            if (controlsRef.current) controlsRef.current.enabled = false
            onMetaballClick?.(metaballId)
            return
          }
        }
      }

      // Clicked nothing - deselect
      setSelectedObject(null)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      // Update hover state
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!)
      let foundHover = false
      
      if (partsGroupRef.current) {
        const partIntersects = raycasterRef.current.intersectObjects(partsGroupRef.current.children, false)
        if (partIntersects.length > 0) {
          const mesh = partIntersects[0].object as THREE.Mesh
          const id = Array.from(partMeshesRef.current.entries()).find(([_, m]) => m === mesh)?.[0]
          if (id) {
            setHoveredId(id)
            foundHover = true
          }
        }
      }
      
      if (!foundHover && decalsGroupRef.current) {
        const decalIntersects = raycasterRef.current.intersectObjects(decalsGroupRef.current.children, false)
        if (decalIntersects.length > 0) {
          const mesh = decalIntersects[0].object as THREE.Mesh
          const id = Array.from(decalMeshesRef.current.entries()).find(([_, m]) => m === mesh)?.[0]
          if (id) {
            setHoveredId(id)
            foundHover = true
          }
        }
      }
      
      if (!foundHover && metaballsGroupRef.current) {
        const metaballIntersects = raycasterRef.current.intersectObjects(metaballsGroupRef.current.children, false)
        if (metaballIntersects.length > 0) {
          const mesh = metaballIntersects[0].object as THREE.Mesh
          const id = Array.from(metaballMeshesRef.current.entries()).find(([_, m]) => m === mesh)?.[0]
          if (id) {
            setHoveredId(id)
            foundHover = true
          }
        }
      }
      
      if (!foundHover) {
        setHoveredId(null)
      }

      // Handle dragging
      if (isDragging && selectedObject && dragStart) {
        const deltaX = (event.clientX - dragStart.x) * 0.3
        const deltaY = (event.clientY - dragStart.y) * 0.3
        
        if (selectedObject.type === 'part') {
          const part = parts.find(p => p.id === selectedObject.id)
          if (part) {
            if (editMode === 'move') {
              onPartUpdate?.(selectedObject.id, {
                position: {
                  x: part.position.x + deltaX,
                  y: part.position.y - deltaY,
                  z: part.position.z
                }
              })
            } else if (editMode === 'rotate') {
              onPartUpdate?.(selectedObject.id, {
                rotation: {
                  x: part.rotation.x,
                  y: part.rotation.y + deltaX * 0.02,
                  z: part.rotation.z + deltaY * 0.02
                }
              })
            } else if (editMode === 'scale') {
              const scaleDelta = (deltaX + deltaY) * 0.01
              onPartUpdate?.(selectedObject.id, {
                scale: Math.max(0.1, part.scale + scaleDelta)
              })
            }
          }
        } else if (selectedObject.type === 'decal') {
          const decal = decals.find(d => d.id === selectedObject.id)
          if (decal) {
            if (editMode === 'move') {
              onDecalUpdate?.(selectedObject.id, {
                position: {
                  x: decal.position.x + deltaX,
                  y: decal.position.y - deltaY,
                  z: decal.position.z
                }
              })
            } else if (editMode === 'rotate') {
              onDecalUpdate?.(selectedObject.id, {
                rotation: {
                  x: decal.rotation.x,
                  y: decal.rotation.y + deltaX * 0.02,
                  z: decal.rotation.z + deltaY * 0.02
                }
              })
            } else if (editMode === 'scale') {
              const scaleDelta = (deltaX + deltaY) * 0.01
              onDecalUpdate?.(selectedObject.id, {
                scale: Math.max(0.1, decal.scale + scaleDelta)
              })
            }
          }
        } else if (selectedObject.type === 'metaball') {
          const metaball = metaballs.find(m => m.id === selectedObject.id)
          if (metaball) {
            if (editMode === 'move') {
              onMetaballUpdate?.(selectedObject.id, {
                position: {
                  x: metaball.position.x + deltaX,
                  y: metaball.position.y - deltaY,
                  z: metaball.position.z
                }
              })
            } else if (editMode === 'scale') {
              const scaleDelta = (deltaX + deltaY) * 0.01
              onMetaballUpdate?.(selectedObject.id, {
                scale: Math.max(0.1, metaball.scale + scaleDelta)
              })
            }
          }
        }
        
        setDragStart({ x: event.clientX, y: event.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragStart(null)
      if (controlsRef.current && !selectedObject) {
        controlsRef.current.enabled = true
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedObject(null)
        if (controlsRef.current) controlsRef.current.enabled = true
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedObject) {
          if (selectedObject.type === 'part') {
            onPartDelete?.(selectedObject.id)
          } else if (selectedObject.type === 'decal') {
            onDecalDelete?.(selectedObject.id)
          } else if (selectedObject.type === 'metaball') {
            onMetaballDelete?.(selectedObject.id)
          }
          setSelectedObject(null)
        }
      }
    }

    const canvas = rendererRef.current.domElement
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDragging, dragStart, selectedObject, parts, decals, metaballs, editMode, onPartUpdate, onDecalUpdate, onMetaballUpdate, onPartDelete, onDecalDelete, onMetaballDelete, onPartClick, onDecalClick, onMetaballClick])

  // Update orbit controls when selection changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !isDragging
    }
  }, [isDragging])

  // Update selection outline when selection changes
  useEffect(() => {
    updateSelectionOutline()
  }, [selectedObject, updateSelectionOutline])

  // Update case material
  useEffect(() => {
    updateCaseMaterial()
  }, [caseColor, caseTexture, updateCaseMaterial])

  // Update parts meshes
  useEffect(() => {
    if (!partsGroupRef.current || !sceneRef.current) return

    // Remove old parts
    while (partsGroupRef.current.children.length > 0) {
      const child = partsGroupRef.current.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
      partsGroupRef.current.remove(child)
    }
    partMeshesRef.current.clear()

    parts.forEach((part) => {
      const partMesh = createPartMesh(part)
      if (partMesh) {
        partMesh.userData.partId = part.id
        partsGroupRef.current?.add(partMesh)
        partMeshesRef.current.set(part.id, partMesh)
      }
    })

    // Update selection outline
    updateSelectionOutline()
  }, [parts, hoveredId, selectedObject, updateSelectionOutline, caseColor, caseTexture, generatePatternTexture, generateGradientTexture])

  // Update decals meshes
  useEffect(() => {
    if (!decalsGroupRef.current) return

    while (decalsGroupRef.current.children.length > 0) {
      const child = decalsGroupRef.current.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
      decalsGroupRef.current.remove(child)
    }
    decalMeshesRef.current.clear()

    decals.forEach((decal) => {
      createDecalMesh(decal)
    })
  }, [decals])

  // Update metaballs as individual 3D objects
  useEffect(() => {
    if (!metaballsGroupRef.current) return

    // Remove old metaballs
    while (metaballsGroupRef.current.children.length > 0) {
      const child = metaballsGroupRef.current.children[0]
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        ;(child.material as THREE.Material).dispose()
      }
      metaballsGroupRef.current.remove(child)
    }
    metaballMeshesRef.current.clear()

    // Create individual meshes for each metaball
    metaballs.forEach((metaball) => {
      const isSelected = selectedObject?.id === metaball.id
      const isHovered = hoveredId === metaball.id
      
      let geometry: THREE.BufferGeometry
      if (metaball.type === 'sphere') {
        geometry = new THREE.SphereGeometry(8 * metaball.scale, 32, 32)
      } else {
        geometry = new THREE.BoxGeometry(12 * metaball.scale, 12 * metaball.scale, 12 * metaball.scale, 4, 4, 4)
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: metaball.color,
        roughness: 0.3,
        metalness: 0.2,
        emissive: isSelected ? 0x00ff00 : isHovered ? 0x444444 : 0x000000,
        emissiveIntensity: isSelected ? 0.4 : isHovered ? 0.3 : 0,
      })
      
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(metaball.position.x, metaball.position.y, metaball.position.z)
      mesh.castShadow = true
      mesh.userData.metaballId = metaball.id
      
      metaballsGroupRef.current?.add(mesh)
      metaballMeshesRef.current.set(metaball.id, mesh)
    })
    
    updateSelectionOutline()
  }, [metaballs, hoveredId, selectedObject, updateSelectionOutline])

  const createDecalMesh = (decal: PlacedDecal) => {
    textureLoaderRef.current.load(decal.url, (texture) => {
      const isSelected = selectedObject?.id === decal.id
      const isHovered = hoveredId === decal.id
      
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: decal.opacity,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        emissive: isSelected ? 0x00ff00 : isHovered ? 0x333333 : 0x000000,
        emissiveIntensity: isSelected ? 0.3 : isHovered ? 0.2 : 0,
      })

      const geometry = new THREE.PlaneGeometry(20 * decal.scale, 20 * decal.scale)
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(decal.position.x, decal.position.y, decal.position.z)
      mesh.rotation.set(decal.rotation.x, decal.rotation.y, decal.rotation.z)
      mesh.userData.decalId = decal.id

      decalsGroupRef.current?.add(mesh)
      decalMeshesRef.current.set(decal.id, mesh)
    })
  }

  const createPartMesh = (part: Placed3DPart): THREE.Mesh | null => {
    let geometry: THREE.BufferGeometry

    switch (part.partId) {
      case 'heart':
        geometry = createHeartGeometry()
        break
      case 'star':
        geometry = createStarGeometry()
        break
      case 'flower':
        geometry = createFlowerGeometry()
        break
      case 'circle':
        geometry = new THREE.CylinderGeometry(5, 5, 2, 32)
        break
      case 'square':
        geometry = new THREE.BoxGeometry(8, 8, 2)
        break
      case 'triangle':
        geometry = new THREE.ConeGeometry(5, 8, 3)
        break
      case 'hexagon':
        geometry = new THREE.CylinderGeometry(5, 5, 2, 6)
        break
      case 'diamond':
        geometry = createDiamondGeometry()
        break
      case 'moon':
        geometry = createMoonGeometry()
        break
      case 'butterfly':
        geometry = createButterflyGeometry()
        break
      case 'cloud':
        geometry = createCloudGeometry()
        break
      case 'sparkle':
        geometry = createSparkleGeometry()
        break
      default:
        geometry = new THREE.SphereGeometry(4, 16, 16)
    }

    // Highlight color if hovered or selected
    const isHovered = hoveredId === part.id
    const isSelected = selectedObject?.id === part.id

    // Create material based on whether part uses custom color or case texture
    let material: THREE.MeshStandardMaterial
    
    if (part.useCustomColor) {
      // Use part's own color
      material = new THREE.MeshStandardMaterial({
        color: part.color || '#FF69B4',
        roughness: 0.3,
        metalness: 0.6,
        emissive: isSelected ? 0x00ff00 : isHovered ? 0x444444 : 0x000000,
        emissiveIntensity: isSelected ? 0.4 : isHovered ? 0.3 : 0,
      })
    } else {
      // Use case texture/color
      material = new THREE.MeshStandardMaterial({
        color: caseColor,
        roughness: caseTexture?.roughness ?? 0.4,
        metalness: caseTexture?.metalness ?? 0.1,
        opacity: caseTexture?.opacity ?? 1,
        transparent: (caseTexture?.opacity ?? 1) < 1,
        emissive: isSelected ? 0x00ff00 : isHovered ? 0x444444 : 0x000000,
        emissiveIntensity: isSelected ? 0.4 : isHovered ? 0.3 : 0,
      })

      // Apply texture based on case texture type
      if (caseTexture) {
        if (caseTexture.type === 'pattern' && caseTexture.patternType) {
          const patternTexture = generatePatternTexture(
            caseTexture.patternType,
            caseTexture.color || caseColor
          )
          material.map = patternTexture
          material.color.set(0xffffff)
        } else if (caseTexture.type === 'gradient' && caseTexture.gradientColors) {
          const gradientTexture = generateGradientTexture(
            caseTexture.gradientColors,
            caseTexture.gradientAngle
          )
          material.map = gradientTexture
          material.color.set(0xffffff)
        } else if (caseTexture.type === 'color' && caseTexture.color) {
          material.color.set(caseTexture.color)
        }
      }
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(part.position.x, part.position.y, part.position.z)
    mesh.rotation.set(part.rotation.x, part.rotation.y, part.rotation.z)
    mesh.scale.setScalar(part.scale)
    mesh.castShadow = true

    return mesh
  }

  const createHeartGeometry = (): THREE.BufferGeometry => {
    const shape = new THREE.Shape()
    const scale = 10
    shape.moveTo(0, 0.25 * scale)
    shape.bezierCurveTo(0, 0.4 * scale, -0.15 * scale, 0.5 * scale, -0.25 * scale, 0.5 * scale)
    shape.bezierCurveTo(-0.55 * scale, 0.5 * scale, -0.55 * scale, 0.1 * scale, -0.55 * scale, 0.1 * scale)
    shape.bezierCurveTo(-0.55 * scale, -0.1 * scale, -0.35 * scale, -0.25 * scale, -0.15 * scale, -0.45 * scale)
    shape.lineTo(0, -0.6 * scale)
    shape.lineTo(0.15 * scale, -0.45 * scale)
    shape.bezierCurveTo(0.35 * scale, -0.25 * scale, 0.55 * scale, -0.1 * scale, 0.55 * scale, 0.1 * scale)
    shape.bezierCurveTo(0.55 * scale, 0.1 * scale, 0.55 * scale, 0.5 * scale, 0.25 * scale, 0.5 * scale)
    shape.bezierCurveTo(0.15 * scale, 0.5 * scale, 0, 0.4 * scale, 0, 0.25 * scale)

    return new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 3 })
  }

  const createStarGeometry = (): THREE.BufferGeometry => {
    const shape = new THREE.Shape()
    const outerRadius = 6
    const innerRadius = 3
    const points = 5

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i * Math.PI) / points
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
    }
    shape.closePath()

    return new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 2 })
  }

  const createFlowerGeometry = (): THREE.BufferGeometry => {
    return new THREE.SphereGeometry(5, 32, 32)
  }

  const createDiamondGeometry = (): THREE.BufferGeometry => {
    return new THREE.OctahedronGeometry(5)
  }

  const createMoonGeometry = (): THREE.BufferGeometry => {
    const shape = new THREE.Shape()
    shape.absarc(0, 0, 6, 0, Math.PI * 2, false)
    const hole = new THREE.Path()
    hole.absarc(3, 0, 5, 0, Math.PI * 2, true)
    shape.holes.push(hole)
    return new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false })
  }

  const createButterflyGeometry = (): THREE.BufferGeometry => {
    return new THREE.SphereGeometry(4, 16, 16)
  }

  const createCloudGeometry = (): THREE.BufferGeometry => {
    return new THREE.SphereGeometry(3, 16, 16)
  }

  const createSparkleGeometry = (): THREE.BufferGeometry => {
    const shape = new THREE.Shape()
    const points = 8
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? 6 : 2
      const angle = (i * Math.PI) / points
      i === 0 ? shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius) : shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
    }
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 })
  }

  const handleDeleteSelected = () => {
    if (selectedObject) {
      if (selectedObject.type === 'part') {
        onPartDelete?.(selectedObject.id)
      } else {
        onDecalDelete?.(selectedObject.id)
      }
      setSelectedObject(null)
    }
  }

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ cursor: hoveredId ? 'pointer' : isDragging ? 'grabbing' : 'default' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-foreground font-medium">Loading {PHONE_MODELS.find(m => m.id === phoneModel)?.name}...</div>
          </div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3 max-w-md text-center">
            <div className="text-destructive text-4xl">⚠️</div>
            <div className="text-foreground font-medium">{loadError}</div>
            <div className="text-sm text-muted-foreground">Please try refreshing the page</div>
          </div>
        </div>
      )}
      {!isLoading && !loadError && (
        <>
          {/* Model info */}
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border">
            <div className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {PHONE_MODELS.find(m => m.id === phoneModel)?.name}
            </div>
          </div>
          
          {/* Selection panel - shows when something is selected */}
          {selectedObject && selectedItem && (
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border-2 border-green-500 overflow-hidden w-64 animate-in slide-in-from-right-2">
              <div className="px-4 py-3 bg-green-500/10 border-b border-border flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    {selectedObject.type === 'part' ? '3D Part' : selectedObject.type === 'metaball' ? 'Metaball' : 'Decal'} Selected
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setSelectedObject(null)}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Edit mode buttons */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Drag Mode</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      size="sm"
                      variant={editMode === 'move' ? 'default' : 'outline'}
                      onClick={() => setEditMode('move')}
                      className="flex-col h-auto py-2 gap-1"
                    >
                      <ArrowsOutCardinal size={18} />
                      <span className="text-[10px]">Move</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={editMode === 'rotate' ? 'default' : 'outline'}
                      onClick={() => setEditMode('rotate')}
                      className="flex-col h-auto py-2 gap-1"
                    >
                      <ArrowsClockwise size={18} />
                      <span className="text-[10px]">Rotate</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={editMode === 'scale' ? 'default' : 'outline'}
                      onClick={() => setEditMode('scale')}
                      className="flex-col h-auto py-2 gap-1"
                    >
                      <ArrowsOut size={18} />
                      <span className="text-[10px]">Scale</span>
                    </Button>
                  </div>
                </div>

                {/* Sliders for precise control */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium flex justify-between">
                      <span>Scale</span>
                      <span className="text-muted-foreground">{selectedItem.scale.toFixed(2)}x</span>
                    </Label>
                    <Slider
                      value={[selectedItem.scale]}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onValueChange={([value]) => {
                        if (selectedObject.type === 'part') {
                          onPartUpdate?.(selectedObject.id, { scale: value })
                        } else {
                          onDecalUpdate?.(selectedObject.id, { scale: value })
                        }
                      }}
                    />
                  </div>

                  {/* Part-specific: Custom color toggle */}
                  {selectedObject.type === 'part' && (
                    <>
                      <div className="space-y-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium flex items-center gap-2">
                            <Palette size={14} />
                            <span>Use Custom Color</span>
                          </Label>
                          <Switch
                            checked={(selectedItem as Placed3DPart).useCustomColor}
                            onCheckedChange={(checked) => {
                              onPartUpdate?.(selectedObject.id, { useCustomColor: checked })
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {(selectedItem as Placed3DPart).useCustomColor 
                            ? 'Part uses its own color' 
                            : 'Part matches case texture'}
                        </div>
                      </div>

                      {/* Color picker when using custom color */}
                      {(selectedItem as Placed3DPart).useCustomColor && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Part Color</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={(selectedItem as Placed3DPart).color || '#FF69B4'}
                              onChange={(e) => {
                                onPartUpdate?.(selectedObject.id, { color: e.target.value })
                              }}
                              className="w-10 h-10 rounded cursor-pointer border border-border"
                            />
                            <div className="flex flex-wrap gap-1 flex-1">
                              {['#FF69B4', '#FFD700', '#00CED1', '#9370DB', '#FF6347', '#32CD32'].map((color) => (
                                <button
                                  key={color}
                                  onClick={() => onPartUpdate?.(selectedObject.id, { color })}
                                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedObject.type === 'decal' && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex justify-between">
                        <span>Opacity</span>
                        <span className="text-muted-foreground">{Math.round((selectedItem as PlacedDecal).opacity * 100)}%</span>
                      </Label>
                      <Slider
                        value={[(selectedItem as PlacedDecal).opacity]}
                        min={0}
                        max={1}
                        step={0.05}
                        onValueChange={([value]) => {
                          onDecalUpdate?.(selectedObject.id, { opacity: value })
                        }}
                      />
                    </div>
                  )}

                  {/* Position controls */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Position (X, Y, Z)</Label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <input
                        type="number"
                        value={Math.round(selectedItem.position.x)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          if (selectedObject.type === 'part') {
                            onPartUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, x: val }
                            })
                          } else {
                            onDecalUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, x: val }
                            })
                          }
                        }}
                        className="w-full px-2 py-1.5 rounded bg-muted border border-border text-center text-sm"
                      />
                      <input
                        type="number"
                        value={Math.round(selectedItem.position.y)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          if (selectedObject.type === 'part') {
                            onPartUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, y: val }
                            })
                          } else {
                            onDecalUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, y: val }
                            })
                          }
                        }}
                        className="w-full px-2 py-1.5 rounded bg-muted border border-border text-center text-sm"
                      />
                      <input
                        type="number"
                        value={Math.round(selectedItem.position.z)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          if (selectedObject.type === 'part') {
                            onPartUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, z: val }
                            })
                          } else {
                            onDecalUpdate?.(selectedObject.id, {
                              position: { ...selectedItem.position, z: val }
                            })
                          }
                        }}
                        className="w-full px-2 py-1.5 rounded bg-muted border border-border text-center text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  className="w-full gap-2"
                >
                  <Trash size={16} />
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          {/* Help when nothing selected */}
          {!selectedObject && (parts.length > 0 || decals.length > 0) && (
            <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border max-w-xs">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="text-lg">👆</span> Click to Select
              </div>
              <div className="text-xs text-muted-foreground">
                Click on any 3D part or decal to select it. Then drag to move, or use the controls to adjust scale and rotation.
              </div>
            </div>
          )}

          {/* Empty state */}
          {parts.length === 0 && decals.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg border border-border text-center">
              <div className="text-sm font-bold text-foreground mb-1">✨ Add Parts & Stickers</div>
              <div className="text-xs text-muted-foreground">
                Use the sidebar to add 3D parts and stickers to customize your case
              </div>
            </div>
          )}

          {/* Camera controls hint */}
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-border">
            <div className="text-[10px] text-muted-foreground flex items-center gap-3">
              <span>🖱️ <strong>Scroll</strong> Zoom</span>
              <span><strong>Drag</strong> Rotate view</span>
              <span><strong>Right-drag</strong> Pan</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
