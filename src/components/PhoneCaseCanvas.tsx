import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Placed3DPart, DrawStroke } from '@/lib/types'

interface PhoneCaseCanvasProps {
  caseColor: string
  parts: Placed3DPart[]
  strokes: DrawStroke[]
  onPartClick?: (partId: string) => void
}

export function PhoneCaseCanvas({ caseColor, parts, strokes, onPartClick }: PhoneCaseCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const caseMeshRef = useRef<THREE.Mesh | null>(null)
  const partsGroupRef = useRef<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f3ff)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 8)
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
    controls.minDistance = 4
    controls.maxDistance = 12
    controls.enablePan = false
    controlsRef.current = controls

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-5, 0, -5)
    scene.add(fillLight)

    const caseGeometry = new THREE.BoxGeometry(3.5, 7, 0.5)
    caseGeometry.translate(0, 0, 0.25)
    
    const caseMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(caseColor),
      roughness: 0.4,
      metalness: 0.1,
    })
    const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial)
    caseMesh.castShadow = true
    caseMesh.receiveShadow = true
    scene.add(caseMesh)
    caseMeshRef.current = caseMesh

    const cameraHoleGeometry = new THREE.BoxGeometry(1.2, 0.6, 0.6)
    const holeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
    const cameraHole = new THREE.Mesh(cameraHoleGeometry, holeMaterial)
    cameraHole.position.set(0, 2.8, 0.25)
    scene.add(cameraHole)

    const buttonGeometry = new THREE.BoxGeometry(0.15, 0.8, 0.3)
    const buttonMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(caseColor),
      roughness: 0.3,
      metalness: 0.2,
    })
    const volumeButton = new THREE.Mesh(buttonGeometry, buttonMaterial)
    volumeButton.position.set(-1.85, 1.5, 0.25)
    scene.add(volumeButton)

    const powerButton = new THREE.Mesh(buttonGeometry.clone(), buttonMaterial.clone())
    powerButton.position.set(1.85, 1.8, 0.25)
    scene.add(powerButton)

    const partsGroup = new THREE.Group()
    scene.add(partsGroup)
    partsGroupRef.current = partsGroup

    setIsLoading(false)

    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

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

    parts.forEach((part) => {
      const partMesh = createPartMesh(part)
      if (partMesh) {
        partsGroupRef.current?.add(partMesh)
      }
    })
  }, [parts])

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
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32)
        break
      case 'square':
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.2)
        break
      case 'triangle':
        geometry = new THREE.ConeGeometry(0.3, 0.5, 3)
        break
      case 'hexagon':
        geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 6)
        break
      default:
        geometry = new THREE.SphereGeometry(0.25, 16, 16)
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
    
    shape.moveTo(0, 0.25)
    shape.bezierCurveTo(0, 0.4, -0.15, 0.5, -0.25, 0.5)
    shape.bezierCurveTo(-0.55, 0.5, -0.55, 0.1, -0.55, 0.1)
    shape.bezierCurveTo(-0.55, -0.1, -0.35, -0.25, -0.15, -0.45)
    shape.lineTo(0, -0.6)
    shape.lineTo(0.15, -0.45)
    shape.bezierCurveTo(0.35, -0.25, 0.55, -0.1, 0.55, 0.1)
    shape.bezierCurveTo(0.55, 0.1, 0.55, 0.5, 0.25, 0.5)
    shape.bezierCurveTo(0.15, 0.5, 0, 0.4, 0, 0.25)

    const extrudeSettings = {
      depth: 0.2,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }

  const createStarGeometry = (): THREE.BufferGeometry => {
    const shape = new THREE.Shape()
    const outerRadius = 0.4
    const innerRadius = 0.2
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
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    }

    return new THREE.ExtrudeGeometry(shape, extrudeSettings)
  }

  const createFlowerGeometry = (): THREE.BufferGeometry => {
    const group = new THREE.Group()
    const petalGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const centerGeometry = new THREE.SphereGeometry(0.1, 16, 16)

    const petalCount = 6
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const petal = new THREE.Mesh(petalGeometry)
      petal.position.set(Math.cos(angle) * 0.2, Math.sin(angle) * 0.2, 0)
      group.add(petal)
    }

    const center = new THREE.Mesh(centerGeometry)
    group.add(center)

    return new THREE.BoxGeometry(0.4, 0.4, 0.2)
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-muted-foreground">Loading 3D viewer...</div>
        </div>
      )}
    </div>
  )
}
