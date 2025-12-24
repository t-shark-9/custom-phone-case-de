export type ToolMode = 'select' | 'draw' | 'image' | 'parts' | 'color'

export type PhoneModel = 'iphone-14-pro' | 'iphone-16-pro'

export const PHONE_MODELS = [
  { id: 'iphone-14-pro' as const, name: 'iPhone 14 Pro', stlFile: 'iphone_14_pro.stl' },
  { id: 'iphone-16-pro' as const, name: 'iPhone 16 Pro', stlFile: 'iphone_16_pro.stl' },
]

export interface DrawStroke {
  id: string
  points: Array<{ x: number; y: number; z: number }>
  color: string
  size: number
}

export interface PlacedImage {
  id: string
  url: string
  position: { x: number; y: number; z: number }
  rotation: number
  scale: number
}

export interface Placed3DPart {
  id: string
  partId: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  color?: string
}

export interface Part3D {
  id: string
  name: string
  category: string
  thumbnail: string
}

export interface Design {
  id: string
  name: string
  timestamp: number
  caseColor: string
  phoneModel: PhoneModel
  strokes: DrawStroke[]
  images: PlacedImage[]
  parts: Placed3DPart[]
  thumbnail?: string
}

export interface CartItem {
  id: string
  design: Design
  quantity: number
  price: number
}

export const PRESET_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Lavender', value: '#C4B5FD' },
]

export const PARTS_LIBRARY: Part3D[] = [
  { id: 'heart', name: 'Heart', category: 'Shapes', thumbnail: '❤️' },
  { id: 'star', name: 'Star', category: 'Shapes', thumbnail: '⭐' },
  { id: 'flower', name: 'Flower', category: 'Nature', thumbnail: '🌸' },
  { id: 'butterfly', name: 'Butterfly', category: 'Nature', thumbnail: '🦋' },
  { id: 'cloud', name: 'Cloud', category: 'Nature', thumbnail: '☁️' },
  { id: 'moon', name: 'Moon', category: 'Celestial', thumbnail: '🌙' },
  { id: 'sparkle', name: 'Sparkle', category: 'Celestial', thumbnail: '✨' },
  { id: 'diamond', name: 'Diamond', category: 'Shapes', thumbnail: '💎' },
  { id: 'circle', name: 'Circle', category: 'Shapes', thumbnail: '⚪' },
  { id: 'square', name: 'Square', category: 'Shapes', thumbnail: '◻️' },
  { id: 'triangle', name: 'Triangle', category: 'Shapes', thumbnail: '▲' },
  { id: 'hexagon', name: 'Hexagon', category: 'Shapes', thumbnail: '⬡' },
]

export const CASE_PRICE = 29.99
