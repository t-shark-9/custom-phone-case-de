/**
 * Phone Case 3D Model Generator
 * Generates procedural phone case models based on phone specifications
 * Uses Three.js geometry - can be exported as STL/GLB
 */

import * as THREE from 'three'
import type { PhoneModelSpec } from './types'
import { ENABLED_PHONE_MODELS, getPhoneModel } from './types'

// Case design parameters
const CASE_WALL_THICKNESS = 1.5 // mm
const CASE_BASE_THICKNESS = 1.2 // mm
const CASE_LIP_HEIGHT = 1.0 // mm (how much case extends above phone)
const CASE_CORNER_SEGMENTS = 16

/**
 * Create a rounded rectangle shape for extrusion
 */
function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2

  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)

  return shape
}

/**
 * Create a phone case geometry for a specific phone model
 */
export function createPhoneCaseGeometry(model: PhoneModelSpec): THREE.BufferGeometry {
  // Outer dimensions (phone + case wall)
  const outerWidth = model.width + 2 * CASE_WALL_THICKNESS
  const outerHeight = model.height + 2 * CASE_WALL_THICKNESS
  const outerDepth = model.depth + CASE_BASE_THICKNESS + CASE_LIP_HEIGHT
  const outerRadius = model.cornerRadius + CASE_WALL_THICKNESS

  // Inner dimensions (phone cavity)
  const innerWidth = model.width
  const innerHeight = model.height
  const innerDepth = model.depth + CASE_LIP_HEIGHT
  const innerRadius = model.cornerRadius

  // Create outer shell shape
  const outerShape = createRoundedRectShape(outerWidth, outerHeight, outerRadius)

  // Create inner cutout shape (for the phone cavity)
  const innerShape = createRoundedRectShape(innerWidth, innerHeight, innerRadius)

  // Extrude settings
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: outerDepth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 3,
    curveSegments: CASE_CORNER_SEGMENTS,
  }

  // Create outer geometry
  const outerGeometry = new THREE.ExtrudeGeometry(outerShape, extrudeSettings)

  // Create inner cavity geometry (to be subtracted)
  const innerExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: innerDepth,
    bevelEnabled: false,
    curveSegments: CASE_CORNER_SEGMENTS,
  }
  const innerGeometry = new THREE.ExtrudeGeometry(innerShape, innerExtrudeSettings)

  // Position inner geometry (offset for base thickness)
  innerGeometry.translate(0, 0, CASE_BASE_THICKNESS)

  // For now, we'll use the outer geometry
  // In a full implementation, you'd use CSG to subtract inner from outer
  // But for visualization, the outer shell works well

  // Add camera cutout
  const cameraGeometry = createCameraCutout(model)
  
  // Add button cutouts
  const buttonGeometries = createButtonCutouts(model)

  // Center the geometry
  outerGeometry.center()
  
  // Rotate to stand upright
  outerGeometry.rotateX(-Math.PI / 2)

  return outerGeometry
}

/**
 * Create camera cutout geometry
 */
function createCameraCutout(model: PhoneModelSpec): THREE.BufferGeometry {
  const shape = createRoundedRectShape(
    model.cameraWidth + 2,
    model.cameraHeight + 2,
    model.cameraCornerRadius
  )
  
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: CASE_BASE_THICKNESS + 2,
    bevelEnabled: false,
  })

  // Position at camera location
  geometry.translate(
    -model.width / 2 + model.cameraOffsetX + model.cameraWidth / 2,
    model.height / 2 - model.cameraOffsetY - model.cameraHeight / 2,
    -1
  )

  return geometry
}

/**
 * Create button cutout geometries
 */
function createButtonCutouts(model: PhoneModelSpec): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = []

  // Volume button (left side)
  const volumeGeom = new THREE.BoxGeometry(
    CASE_WALL_THICKNESS + 2,
    model.volumeButtonLength,
    4
  )
  volumeGeom.translate(
    -model.width / 2 - CASE_WALL_THICKNESS,
    model.height / 2 - model.volumeButtonOffset - model.volumeButtonLength / 2,
    model.depth / 2
  )
  geometries.push(volumeGeom)

  // Power button (right side)
  const powerGeom = new THREE.BoxGeometry(
    CASE_WALL_THICKNESS + 2,
    model.powerButtonLength,
    4
  )
  powerGeom.translate(
    model.width / 2 + CASE_WALL_THICKNESS,
    model.height / 2 - model.powerButtonOffset - model.powerButtonLength / 2,
    model.depth / 2
  )
  geometries.push(powerGeom)

  // Action button (if present)
  if (model.hasActionButton && model.actionButtonOffset) {
    const actionGeom = new THREE.BoxGeometry(
      CASE_WALL_THICKNESS + 2,
      8,
      4
    )
    actionGeom.translate(
      -model.width / 2 - CASE_WALL_THICKNESS,
      model.height / 2 - model.actionButtonOffset - 4,
      model.depth / 2
    )
    geometries.push(actionGeom)
  }

  // USB port (bottom)
  const usbGeom = new THREE.BoxGeometry(12, CASE_WALL_THICKNESS + 2, 6)
  usbGeom.translate(
    0,
    -model.height / 2 - CASE_WALL_THICKNESS,
    model.depth / 2
  )
  geometries.push(usbGeom)

  // Speaker grilles (bottom)
  const speakerLeftGeom = new THREE.BoxGeometry(15, CASE_WALL_THICKNESS + 2, 4)
  speakerLeftGeom.translate(
    -model.width / 2 + model.speakerLeftOffset + 7.5,
    -model.height / 2 - CASE_WALL_THICKNESS,
    model.depth / 2
  )
  geometries.push(speakerLeftGeom)

  const speakerRightGeom = new THREE.BoxGeometry(15, CASE_WALL_THICKNESS + 2, 4)
  speakerRightGeom.translate(
    -model.width / 2 + model.speakerRightOffset + 7.5,
    -model.height / 2 - CASE_WALL_THICKNESS,
    model.depth / 2
  )
  geometries.push(speakerRightGeom)

  return geometries
}

/**
 * Create a complete phone case mesh with material
 */
export function createPhoneCaseMesh(
  model: PhoneModelSpec,
  color: string = '#8B5CF6'
): THREE.Mesh {
  const geometry = createPhoneCaseGeometry(model)
  
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.4,
    metalness: 0.1,
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = `case-${model.id}`
  
  return mesh
}

/**
 * Create case for a phone model by ID
 */
export function createCaseForPhone(
  phoneId: string,
  color?: string
): THREE.Mesh | null {
  const model = getPhoneModel(phoneId as any)
  if (!model) return null
  return createPhoneCaseMesh(model, color)
}

/**
 * Get scale factor to normalize case size for display
 * (so different phone sizes look similar in the viewer)
 */
export function getCaseScaleFactor(model: PhoneModelSpec): number {
  // Normalize to a ~100mm height reference
  return 100 / model.height
}

/**
 * Export geometry as STL string (for download)
 */
export function geometryToSTL(geometry: THREE.BufferGeometry): string {
  // Simple ASCII STL export
  const positions = geometry.getAttribute('position')
  const indices = geometry.getIndex()
  
  let stl = 'solid phonecaseexport\n'
  
  if (indices) {
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i)
      const b = indices.getX(i + 1)
      const c = indices.getX(i + 2)
      
      const v1 = new THREE.Vector3(
        positions.getX(a),
        positions.getY(a),
        positions.getZ(a)
      )
      const v2 = new THREE.Vector3(
        positions.getX(b),
        positions.getY(b),
        positions.getZ(b)
      )
      const v3 = new THREE.Vector3(
        positions.getX(c),
        positions.getY(c),
        positions.getZ(c)
      )
      
      // Calculate normal
      const edge1 = new THREE.Vector3().subVectors(v2, v1)
      const edge2 = new THREE.Vector3().subVectors(v3, v1)
      const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize()
      
      stl += `  facet normal ${normal.x} ${normal.y} ${normal.z}\n`
      stl += `    outer loop\n`
      stl += `      vertex ${v1.x} ${v1.y} ${v1.z}\n`
      stl += `      vertex ${v2.x} ${v2.y} ${v2.z}\n`
      stl += `      vertex ${v3.x} ${v3.y} ${v3.z}\n`
      stl += `    endloop\n`
      stl += `  endfacet\n`
    }
  }
  
  stl += 'endsolid phonecase\n'
  return stl
}

// Export all available models
export { ENABLED_PHONE_MODELS, getPhoneModel }
