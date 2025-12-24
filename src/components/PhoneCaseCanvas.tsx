import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { Placed3DPart, DrawStroke, PhoneModel } from '@/lib/types'
import { PHONE_MODELS } from '@/lib/types'

interface PhoneCaseCanvasProps {
  phoneModel: PhoneModel
  caseColor: string
  parts: Placed3DPart[]
  strokes: DrawStroke[]
  onPartClick?: (partId: string) => void
  onPartUpdate?: (partId: string, updates: Partial<Placed3DPart>) => void
}

export function PhoneCaseCanvas({ phoneModel, caseColor, parts, strokes, onPartClick, onPartUpdate }: PhoneCaseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const transformControlsRef = useRef<TransformControls | null>(null)
  const caseMeshRef = useRef<THREE.Mesh | null>(null)
  const partsGroupRef = useRef<THREE.Group | null>(null)
  const partMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate')

  const getModelPath = (model: PhoneModel): string => {
    switch (model) {
      case 'iphone-14-pro':
        return '/models/iphone_14_pro.stl'
      case 'iphone-16-pro':
        return '/models/iphone_16_pro.stl'
      default:
        return '/models/iphone_16_pro.stl'
    }
  }

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
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 80
    controls.maxDistance = 300
    controls.enablePan = true
    controlsRef.current = controls

    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value
    })
    transformControls.addEventListener('change', () => {
      const attachedObject = transformControls.object
      if (selectedPartId && attachedObject) {
        onPartUpdate?.(selectedPartId, {
          position: { x: attachedObject.position.x, y: attachedObject.position.y, z: attachedObject.position.z },
          rotation: { x: attachedObject.rotation.x, y: attachedObject.rotation.y, z: attachedObject.rotation.z },
          scale: attachedObject.scale.x,
        })
      }
    })
    scene.add(transformControls as any)
    transformControlsRef.current = transformControls

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !partsGroupRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      const intersects = raycasterRef.current.intersectObjects(partsGroupRef.current.children, false)

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh
        const partId = Array.from(partMeshesRef.current.entries()).find(([_, mesh]) => mesh === clickedMesh)?.[0]
        
        if (partId) {
          setSelectedPartId(partId)
          transformControls.attach(clickedMesh)
          onPartClick?.(partId)
        }
      } else {
        setSelectedPartId(null)
        transformControls.detach()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!transformControls.object) return

      switch (event.key) {
        case 'g':
        case 'G':
          setTransformMode('translate')
          transformControls.setMode('translate')
          break
        case 'r':
        case 'R':
          setTransformMode('rotate')
          transformControls.setMode('rotate')
          break
        case 's':
        case 'S':
          setTransformMode('scale')
          transformControls.setMode('scale')
          break
        case 'Escape':
          setSelectedPartId(null)
          transformControls.detach()
          break
        case 'Delete':
        case 'Backspace':
          if (selectedPartId) {
            setSelectedPartId(null)
            transformControls.detach()
          }
          break
      }
    }

    renderer.domElement.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, 0, -5)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.3)
    backLight.position.set(0, -5, -5)
    scene.add(backLight)

    const partsGroup = new THREE.Group()
    scene.add(partsGroup)
    partsGroupRef.current = partsGroup

    const loader = new STLLoader()
    const modelPath = getModelPath(phoneModel)

    loader.load(
      modelPath,
      (geometry) => {
        geometry.center()
        geometry.computeVertexNormals()

        const caseMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(caseColor),
          roughness: 0.4,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })

        const caseMesh = new THREE.Mesh(geometry, caseMaterial)
        caseMesh.castShadow = true
        caseMesh.receiveShadow = true
        
        scene.add(caseMesh)
        caseMeshRef.current = caseMesh

        setIsLoading(false)
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100
        console.log(`Loading model: ${percentComplete.toFixed(0)}%`)
      },
      (error) => {
        console.error('Error loading STL model:', error)
        setLoadError(`Failed to load ${PHONE_MODELS.find(m => m.id === phoneModel)?.name} model`)
        setIsLoading(false)
      }
    )

    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      renderer.domElement.removeEventListener('click', handleClick)
      cancelAnimationFrame(animationId)
      transformControls.dispose()
      renderer.dispose()
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [phoneModel])

  useEffect(() => {
    if (caseMeshRef.current) {
      const material = caseMeshRef.current.material as THREE.MeshStandardMaterial
      material.color.set(caseColor)
    }
  }, [caseColor])

  useEffect(() => {
    if (!partsGroupRef.current) return

    while (partsGroupRef.current.children.length > 0) {
      partsGroupRef.current.remove(partsGroupRef.current.children[0])
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

    if (selectedPartId && !partMeshesRef.current.has(selectedPartId)) {
      setSelectedPartId(null)
      transformControlsRef.current?.detach()
    }
  }, [parts, selectedPartId])

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
      default:
        geometry = new THREE.SphereGeometry(4, 16, 16)
    }

    const material = new THREE.MeshStandardMaterial({
      color: part.color || '#FF69B4',
      roughness: 0.3,
      metalness: 0.6,
    })

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

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.5,
      bevelSize: 0.5,
      bevelSegments: 3,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
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
      
      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    }
    shape.closePath()

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.4,
      bevelSegments: 2,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }

  const createFlowerGeometry = (): THREE.BufferGeometry => {
    const group = new THREE.Group()
    const petalGeometry = new THREE.SphereGeometry(2.5, 16, 16)
    const centerGeometry = new THREE.SphereGeometry(1.5, 16, 16)

    const petalCount = 6
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const petal = new THREE.Mesh(petalGeometry)
      petal.position.set(Math.cos(angle) * 3, Math.sin(angle) * 3, 0)
      group.add(petal)
    }

    const center = new THREE.Mesh(centerGeometry)
    group.add(center)

    return new THREE.BoxGeometry(6, 6, 2)
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
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
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border">
            <div className="text-sm font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              {PHONE_MODELS.find(m => m.id === phoneModel)?.name}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Using STL Model ✓
            </div>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border">
            <div className="text-xs font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Controls
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><span className="font-medium">Click</span> part to select</div>
              <div><span className="font-medium">G</span> Move | <span className="font-medium">R</span> Rotate | <span className="font-medium">S</span> Scale</div>
              <div><span className="font-medium">ESC</span> Deselect | <span className="font-medium">Del</span> Remove</div>
            </div>
            {selectedPartId && (
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-xs font-medium text-primary">
                  Mode: {transformMode.toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
