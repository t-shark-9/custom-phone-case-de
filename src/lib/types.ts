export type ToolMode = 'select' | 'draw' | 'image' | 'parts' | 'color' | 'texture' | 'decal' | 'uvmap' | 'text' | 'metaball'

// Extended phone model type for all supported devices
export type PhoneModel = 
  // iPhone 17 Series
  | 'iphone-17-pro-max' | 'iphone-17-pro' | 'iphone-17' | 'iphone-17-air'
  // iPhone 16 Series
  | 'iphone-16-pro-max' | 'iphone-16-pro' | 'iphone-16-plus' | 'iphone-16' | 'iphone-16e'
  // iPhone 15 Series
  | 'iphone-15-pro-max' | 'iphone-15-pro' | 'iphone-15-plus' | 'iphone-15'
  // iPhone 14 Series
  | 'iphone-14-pro-max' | 'iphone-14-pro' | 'iphone-14-plus' | 'iphone-14'
  // iPhone 13 Series
  | 'iphone-13-pro-max' | 'iphone-13-pro' | 'iphone-13' | 'iphone-13-mini'
  // iPhone SE
  | 'iphone-se-3'
  // Samsung Galaxy
  | 'samsung-galaxy-s24-ultra' | 'samsung-galaxy-s24-plus' | 'samsung-galaxy-s24'
  | 'samsung-galaxy-a21s'

// Phone model dimensions in mm (from Apple Accessory Design Guidelines and official specs)
export interface PhoneModelSpec {
  id: PhoneModel
  name: string
  brand: 'Apple' | 'Samsung'
  series: string
  // Dimensions in mm
  width: number
  height: number
  depth: number
  cornerRadius: number
  // Display info
  displayWidth: number
  displayHeight: number
  // Camera cutout info (from top-left of back)
  cameraOffsetX: number
  cameraOffsetY: number
  cameraWidth: number
  cameraHeight: number
  cameraCornerRadius: number
  // Button positions (offset from top, in mm)
  volumeButtonOffset: number
  volumeButtonLength: number
  powerButtonOffset: number
  powerButtonLength: number
  actionButtonOffset?: number // iPhone 15 Pro+ only
  // Ports (offset from left side at bottom)
  usbPortOffset: number
  speakerLeftOffset: number
  speakerRightOffset: number
  // Features
  hasMagSafe: boolean
  hasDynamicIsland: boolean
  hasActionButton: boolean
  hasCameraControl: boolean // iPhone 16+
  // Case generation
  stlFile?: string
  openScadParams?: string
}

// Comprehensive phone model database with accurate dimensions
export const PHONE_MODELS: PhoneModelSpec[] = [
  // ============ iPhone 17 Series (2025) ============
  {
    id: 'iphone-17-pro-max',
    name: 'iPhone 17 Pro Max',
    brand: 'Apple',
    series: 'iPhone 17',
    width: 77.6,
    height: 163.0,
    depth: 8.25,
    cornerRadius: 14.0,
    displayWidth: 72.9,
    displayHeight: 158.3,
    cameraOffsetX: 10.5,
    cameraOffsetY: 10.5,
    cameraWidth: 38.0,
    cameraHeight: 38.0,
    cameraCornerRadius: 9.0,
    volumeButtonOffset: 62.5,
    volumeButtonLength: 33.0,
    powerButtonOffset: 62.5,
    powerButtonLength: 25.0,
    actionButtonOffset: 48.0,
    usbPortOffset: 38.8,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 53.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: true,
  },
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    brand: 'Apple',
    series: 'iPhone 17',
    width: 71.5,
    height: 149.6,
    depth: 8.25,
    cornerRadius: 14.0,
    displayWidth: 66.8,
    displayHeight: 144.9,
    cameraOffsetX: 10.2,
    cameraOffsetY: 10.2,
    cameraWidth: 36.0,
    cameraHeight: 36.0,
    cameraCornerRadius: 8.5,
    volumeButtonOffset: 55.3,
    volumeButtonLength: 30.0,
    powerButtonOffset: 55.3,
    powerButtonLength: 23.0,
    actionButtonOffset: 42.0,
    usbPortOffset: 35.8,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 49.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: true,
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    brand: 'Apple',
    series: 'iPhone 17',
    width: 71.6,
    height: 147.6,
    depth: 7.80,
    cornerRadius: 13.0,
    displayWidth: 66.9,
    displayHeight: 143.0,
    cameraOffsetX: 10.0,
    cameraOffsetY: 10.0,
    cameraWidth: 34.0,
    cameraHeight: 34.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 54.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 54.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.8,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: true,
  },
  {
    id: 'iphone-17-air',
    name: 'iPhone 17 Air',
    brand: 'Apple',
    series: 'iPhone 17',
    width: 71.5,
    height: 155.0,
    depth: 5.50,
    cornerRadius: 13.5,
    displayWidth: 66.8,
    displayHeight: 150.3,
    cameraOffsetX: 35.8,
    cameraOffsetY: 8.0,
    cameraWidth: 22.0,
    cameraHeight: 22.0,
    cameraCornerRadius: 11.0,
    volumeButtonOffset: 58.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 58.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.8,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: true,
  },
  
  // ============ iPhone 16 Series (2024) ============
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    series: 'iPhone 16',
    width: 77.58,
    height: 163.03,
    depth: 8.25,
    cornerRadius: 14.17,
    displayWidth: 72.86,
    displayHeight: 158.31,
    cameraOffsetX: 10.22,
    cameraOffsetY: 10.22,
    cameraWidth: 38.0,
    cameraHeight: 38.0,
    cameraCornerRadius: 9.06,
    volumeButtonOffset: 62.43,
    volumeButtonLength: 33.0,
    powerButtonOffset: 62.43,
    powerButtonLength: 25.0,
    actionButtonOffset: 48.23,
    usbPortOffset: 38.79,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 53.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: true,
  },
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    brand: 'Apple',
    series: 'iPhone 16',
    width: 71.45,
    height: 149.61,
    depth: 8.25,
    cornerRadius: 14.17,
    displayWidth: 66.73,
    displayHeight: 144.89,
    cameraOffsetX: 10.22,
    cameraOffsetY: 10.22,
    cameraWidth: 36.0,
    cameraHeight: 36.0,
    cameraCornerRadius: 8.5,
    volumeButtonOffset: 55.33,
    volumeButtonLength: 30.0,
    powerButtonOffset: 55.33,
    powerButtonLength: 23.0,
    actionButtonOffset: 42.0,
    usbPortOffset: 35.73,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 49.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: true,
  },
  {
    id: 'iphone-16-plus',
    name: 'iPhone 16 Plus',
    brand: 'Apple',
    series: 'iPhone 16',
    width: 77.8,
    height: 160.9,
    depth: 7.80,
    cornerRadius: 13.5,
    displayWidth: 73.1,
    displayHeight: 156.2,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 34.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 60.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 60.0,
    powerButtonLength: 25.0,
    usbPortOffset: 38.9,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 53.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: true,
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    brand: 'Apple',
    series: 'iPhone 16',
    width: 71.6,
    height: 147.6,
    depth: 7.80,
    cornerRadius: 13.0,
    displayWidth: 66.9,
    displayHeight: 143.0,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 34.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 54.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 54.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.8,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: true,
  },
  {
    id: 'iphone-16e',
    name: 'iPhone 16e',
    brand: 'Apple',
    series: 'iPhone 16',
    width: 71.36,
    height: 146.72,
    depth: 7.80,
    cornerRadius: 12.5,
    displayWidth: 66.69,
    displayHeight: 142.05,
    cameraOffsetX: 35.0,
    cameraOffsetY: 8.0,
    cameraWidth: 22.0,
    cameraHeight: 22.0,
    cameraCornerRadius: 11.0,
    volumeButtonOffset: 54.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 54.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.68,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ iPhone 15 Series (2023) ============
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    series: 'iPhone 15',
    width: 76.7,
    height: 159.9,
    depth: 8.25,
    cornerRadius: 14.0,
    displayWidth: 72.0,
    displayHeight: 155.2,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 38.0,
    cameraHeight: 38.0,
    cameraCornerRadius: 9.0,
    volumeButtonOffset: 60.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 60.0,
    powerButtonLength: 25.0,
    actionButtonOffset: 46.0,
    usbPortOffset: 38.35,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 52.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: false,
  },
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    series: 'iPhone 15',
    width: 70.6,
    height: 146.6,
    depth: 8.25,
    cornerRadius: 14.0,
    displayWidth: 65.9,
    displayHeight: 141.9,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 36.0,
    cameraHeight: 36.0,
    cameraCornerRadius: 8.5,
    volumeButtonOffset: 52.0,
    volumeButtonLength: 30.0,
    powerButtonOffset: 52.0,
    powerButtonLength: 23.0,
    actionButtonOffset: 40.0,
    usbPortOffset: 35.3,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: true,
    hasCameraControl: false,
  },
  {
    id: 'iphone-15-plus',
    name: 'iPhone 15 Plus',
    brand: 'Apple',
    series: 'iPhone 15',
    width: 77.8,
    height: 160.9,
    depth: 7.80,
    cornerRadius: 13.5,
    displayWidth: 73.1,
    displayHeight: 156.2,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 45.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 60.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 60.0,
    powerButtonLength: 25.0,
    usbPortOffset: 38.9,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 53.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    brand: 'Apple',
    series: 'iPhone 15',
    width: 71.6,
    height: 147.6,
    depth: 7.80,
    cornerRadius: 13.0,
    displayWidth: 66.9,
    displayHeight: 143.0,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 45.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 54.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 54.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.8,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ iPhone 14 Series (2022) ============
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    brand: 'Apple',
    series: 'iPhone 14',
    width: 77.6,
    height: 160.7,
    depth: 7.85,
    cornerRadius: 13.5,
    displayWidth: 72.9,
    displayHeight: 156.0,
    cameraOffsetX: 11.5,
    cameraOffsetY: 11.5,
    cameraWidth: 38.0,
    cameraHeight: 38.0,
    cameraCornerRadius: 9.0,
    volumeButtonOffset: 58.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 58.0,
    powerButtonLength: 25.0,
    usbPortOffset: 38.8,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 52.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    brand: 'Apple',
    series: 'iPhone 14',
    width: 71.5,
    height: 147.5,
    depth: 7.85,
    cornerRadius: 13.0,
    displayWidth: 66.8,
    displayHeight: 142.8,
    cameraOffsetX: 11.5,
    cameraOffsetY: 11.5,
    cameraWidth: 36.0,
    cameraHeight: 36.0,
    cameraCornerRadius: 8.5,
    volumeButtonOffset: 52.0,
    volumeButtonLength: 30.0,
    powerButtonOffset: 52.0,
    powerButtonLength: 23.0,
    usbPortOffset: 35.75,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: true,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-14-plus',
    name: 'iPhone 14 Plus',
    brand: 'Apple',
    series: 'iPhone 14',
    width: 78.1,
    height: 160.8,
    depth: 7.80,
    cornerRadius: 13.5,
    displayWidth: 73.4,
    displayHeight: 156.1,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 45.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 58.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 58.0,
    powerButtonLength: 25.0,
    usbPortOffset: 39.05,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 52.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    brand: 'Apple',
    series: 'iPhone 14',
    width: 71.5,
    height: 146.7,
    depth: 7.80,
    cornerRadius: 13.0,
    displayWidth: 66.8,
    displayHeight: 142.0,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 34.0,
    cameraHeight: 45.0,
    cameraCornerRadius: 8.0,
    volumeButtonOffset: 52.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 52.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.75,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ iPhone 13 Series (2021) ============
  {
    id: 'iphone-13-pro-max',
    name: 'iPhone 13 Pro Max',
    brand: 'Apple',
    series: 'iPhone 13',
    width: 78.1,
    height: 160.8,
    depth: 7.65,
    cornerRadius: 13.0,
    displayWidth: 73.4,
    displayHeight: 156.1,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 38.0,
    cameraHeight: 38.0,
    cameraCornerRadius: 9.0,
    volumeButtonOffset: 56.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 56.0,
    powerButtonLength: 25.0,
    usbPortOffset: 39.05,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 52.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-13-pro',
    name: 'iPhone 13 Pro',
    brand: 'Apple',
    series: 'iPhone 13',
    width: 71.5,
    height: 146.7,
    depth: 7.65,
    cornerRadius: 13.0,
    displayWidth: 66.8,
    displayHeight: 142.0,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 36.0,
    cameraHeight: 36.0,
    cameraCornerRadius: 8.5,
    volumeButtonOffset: 50.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 50.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.75,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    brand: 'Apple',
    series: 'iPhone 13',
    width: 71.5,
    height: 146.7,
    depth: 7.65,
    cornerRadius: 13.0,
    displayWidth: 66.8,
    displayHeight: 142.0,
    cameraOffsetX: 12.0,
    cameraOffsetY: 12.0,
    cameraWidth: 32.0,
    cameraHeight: 32.0,
    cameraCornerRadius: 7.5,
    volumeButtonOffset: 50.0,
    volumeButtonLength: 28.0,
    powerButtonOffset: 50.0,
    powerButtonLength: 22.0,
    usbPortOffset: 35.75,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    brand: 'Apple',
    series: 'iPhone 13',
    width: 64.2,
    height: 131.5,
    depth: 7.65,
    cornerRadius: 11.0,
    displayWidth: 59.5,
    displayHeight: 126.8,
    cameraOffsetX: 10.0,
    cameraOffsetY: 10.0,
    cameraWidth: 28.0,
    cameraHeight: 28.0,
    cameraCornerRadius: 7.0,
    volumeButtonOffset: 44.0,
    volumeButtonLength: 24.0,
    powerButtonOffset: 44.0,
    powerButtonLength: 19.0,
    usbPortOffset: 32.1,
    speakerLeftOffset: 12.0,
    speakerRightOffset: 42.0,
    hasMagSafe: true,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ iPhone SE (2022) ============
  {
    id: 'iphone-se-3',
    name: 'iPhone SE (3rd gen)',
    brand: 'Apple',
    series: 'iPhone SE',
    width: 67.3,
    height: 138.4,
    depth: 7.30,
    cornerRadius: 10.0,
    displayWidth: 58.7,
    displayHeight: 104.4,
    cameraOffsetX: 8.0,
    cameraOffsetY: 8.0,
    cameraWidth: 15.0,
    cameraHeight: 15.0,
    cameraCornerRadius: 7.5,
    volumeButtonOffset: 42.0,
    volumeButtonLength: 25.0,
    powerButtonOffset: 42.0,
    powerButtonLength: 20.0,
    usbPortOffset: 33.65,
    speakerLeftOffset: 12.0,
    speakerRightOffset: 44.0,
    hasMagSafe: false,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ Samsung Galaxy S24 Series (2024) ============
  {
    id: 'samsung-galaxy-s24-ultra',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    series: 'Galaxy S24',
    width: 79.0,
    height: 162.3,
    depth: 8.6,
    cornerRadius: 12.0,
    displayWidth: 74.3,
    displayHeight: 157.6,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 28.0,
    cameraHeight: 65.0,
    cameraCornerRadius: 6.0,
    volumeButtonOffset: 75.0,
    volumeButtonLength: 35.0,
    powerButtonOffset: 60.0,
    powerButtonLength: 18.0,
    usbPortOffset: 39.5,
    speakerLeftOffset: 16.0,
    speakerRightOffset: 54.0,
    hasMagSafe: false,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'samsung-galaxy-s24-plus',
    name: 'Galaxy S24+',
    brand: 'Samsung',
    series: 'Galaxy S24',
    width: 75.9,
    height: 158.5,
    depth: 7.7,
    cornerRadius: 12.0,
    displayWidth: 71.2,
    displayHeight: 153.8,
    cameraOffsetX: 11.0,
    cameraOffsetY: 11.0,
    cameraWidth: 28.0,
    cameraHeight: 55.0,
    cameraCornerRadius: 6.0,
    volumeButtonOffset: 70.0,
    volumeButtonLength: 33.0,
    powerButtonOffset: 56.0,
    powerButtonLength: 16.0,
    usbPortOffset: 37.95,
    speakerLeftOffset: 15.0,
    speakerRightOffset: 52.0,
    hasMagSafe: false,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
  {
    id: 'samsung-galaxy-s24',
    name: 'Galaxy S24',
    brand: 'Samsung',
    series: 'Galaxy S24',
    width: 70.6,
    height: 147.0,
    depth: 7.6,
    cornerRadius: 11.0,
    displayWidth: 66.0,
    displayHeight: 142.3,
    cameraOffsetX: 10.0,
    cameraOffsetY: 10.0,
    cameraWidth: 26.0,
    cameraHeight: 50.0,
    cameraCornerRadius: 5.5,
    volumeButtonOffset: 62.0,
    volumeButtonLength: 30.0,
    powerButtonOffset: 50.0,
    powerButtonLength: 14.0,
    usbPortOffset: 35.3,
    speakerLeftOffset: 14.0,
    speakerRightOffset: 48.0,
    hasMagSafe: false,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },

  // ============ Samsung Galaxy A21s (from OpenSCAD file) ============
  {
    id: 'samsung-galaxy-a21s',
    name: 'Galaxy A21s',
    brand: 'Samsung',
    series: 'Galaxy A',
    width: 75.3,
    height: 163.7,
    depth: 8.9,
    cornerRadius: 10.0,
    displayWidth: 70.6,
    displayHeight: 159.0,
    cameraOffsetX: 10.0,
    cameraOffsetY: 10.0,
    cameraWidth: 26.0,
    cameraHeight: 55.0,
    cameraCornerRadius: 5.0,
    volumeButtonOffset: 72.0,
    volumeButtonLength: 35.0,
    powerButtonOffset: 58.0,
    powerButtonLength: 18.0,
    usbPortOffset: 37.65,
    speakerLeftOffset: 15.0,
    speakerRightOffset: 51.0,
    hasMagSafe: false,
    hasDynamicIsland: false,
    hasActionButton: false,
    hasCameraControl: false,
  },
]

// Filter to only show phones with original STEP models
const ENABLED_MODELS = ['iphone-14-pro', 'iphone-16-pro']
export const ENABLED_PHONE_MODELS = PHONE_MODELS.filter(m => 
  ENABLED_MODELS.includes(m.id)
)

// Helper function to get phone model by ID
export function getPhoneModel(id: PhoneModel): PhoneModelSpec | undefined {
  return ENABLED_PHONE_MODELS.find(m => m.id === id)
}

// Helper to group phones by brand
export function getPhonesByBrand(brand: 'Apple' | 'Samsung'): PhoneModelSpec[] {
  return ENABLED_PHONE_MODELS.filter(m => m.brand === brand)
}

// Helper to group phones by series
export function getPhonesBySeries(series: string): PhoneModelSpec[] {
  return ENABLED_PHONE_MODELS.filter(m => m.series === series)
}

// Get unique series names
export function getUniqueSeries(): string[] {
  return [...new Set(ENABLED_PHONE_MODELS.map(m => m.series))]
}

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

export interface PlacedDecal {
  id: string
  url: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  opacity: number
}

export interface CaseTexture {
  id: string
  type: 'color' | 'image' | 'gradient' | 'pattern'
  color?: string
  imageUrl?: string
  gradientColors?: string[]
  gradientAngle?: number
  patternType?: 'stripes' | 'dots' | 'checker' | 'carbon' | 'wood' | 'marble'
  roughness: number
  metalness: number
  opacity: number
}

export interface Placed3DPart {
  id: string
  partId: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  color?: string
  texture?: CaseTexture
  useCustomColor: boolean // If true, use own color; if false, use case texture
}

export interface PlacedText {
  id: string
  text: string
  font: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: number
  color: string
  depth: number
}

export interface Metaball {
  id: string
  type: 'sphere' | 'cube' | 'bump' | 'groove' | 'ridge' | 'wave' | 'fidget-bubble' | 'fidget-button'
  position: { x: number; y: number; z: number }
  scale: number
  influence: number // How much it blends with other metaballs
  color: string
  smoothness?: number // 0-1, how smooth the edges are
  depth?: number // for grooves, how deep they go
}

export interface Part3D {
  id: string
  name: string
  category: string
  thumbnail: string
  modelUrl?: string
}

export interface Design {
  id: string
  name: string
  timestamp: number
  caseColor: string
  caseTexture?: CaseTexture
  phoneModel: PhoneModel
  strokes: DrawStroke[]
  images: PlacedImage[]
  decals: PlacedDecal[]
  parts: Placed3DPart[]
  thumbnail?: string
}

export interface CartItem {
  id: string
  design: Design
  quantity: number
  price: number
}

export const TEXTURE_PRESETS: CaseTexture[] = [
  { id: 'matte', type: 'color', roughness: 0.8, metalness: 0, opacity: 1 },
  { id: 'glossy', type: 'color', roughness: 0.1, metalness: 0.3, opacity: 1 },
  { id: 'metallic', type: 'color', roughness: 0.3, metalness: 0.9, opacity: 1 },
  { id: 'frosted', type: 'color', roughness: 0.6, metalness: 0.1, opacity: 0.85 },
  { id: 'carbon', type: 'pattern', patternType: 'carbon', roughness: 0.4, metalness: 0.2, opacity: 1 },
  { id: 'wood', type: 'pattern', patternType: 'wood', roughness: 0.7, metalness: 0, opacity: 1 },
  { id: 'marble', type: 'pattern', patternType: 'marble', roughness: 0.3, metalness: 0.1, opacity: 1 },
]

export const MATERIAL_FINISHES = [
  { id: 'matte', name: 'Matte', roughness: 0.8, metalness: 0 },
  { id: 'glossy', name: 'Glossy', roughness: 0.1, metalness: 0.3 },
  { id: 'satin', name: 'Satin', roughness: 0.4, metalness: 0.1 },
  { id: 'metallic', name: 'Metallic', roughness: 0.3, metalness: 0.9 },
  { id: 'chrome', name: 'Chrome', roughness: 0.05, metalness: 1 },
  { id: 'brushed', name: 'Brushed Metal', roughness: 0.5, metalness: 0.8 },
]

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

export const FONT_OPTIONS = [
  { id: 'arial', name: 'Arial', family: 'Arial, sans-serif' },
  { id: 'times', name: 'Times New Roman', family: 'Times New Roman, serif' },
  { id: 'courier', name: 'Courier', family: 'Courier New, monospace' },
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
  { id: 'impact', name: 'Impact', family: 'Impact, sans-serif' },
  { id: 'comic', name: 'Comic Sans', family: 'Comic Sans MS, cursive' },
]

export const CASE_PRICE = 29.99
