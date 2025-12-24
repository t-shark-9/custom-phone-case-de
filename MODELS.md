# Phone Case 3D Models

## Available Models

This project includes STL (.stl) model files for accurate iPhone case representations:

1. **iPhone 14 Pro Case** - `/public/models/iphone_14_pro.stl`
2. **iPhone 16 Pro Case** - `/public/models/iphone_16_pro.stl`

## Current Implementation

### Model Selection
Users can select their desired phone model from a dropdown in the Properties Panel. The application loads the corresponding STL model and tracks which model is being used throughout the design process:

- Model selection persists across designs
- Each saved design remembers which phone model was used
- Cart items display the specific phone model
- Saved designs gallery shows the phone model for each design

### 3D Rendering
The application now uses **actual STL models** loaded via Three.js STLLoader to render the phone cases in the 3D canvas:

- **iPhone 14 Pro**: Loaded from `/public/models/iphone_14_pro.stl`
- **iPhone 16 Pro**: Loaded from `/public/models/iphone_16_pro.stl`

The STL models are:
- Centered and auto-scaled to fit the viewport
- Rendered with proper normals for realistic lighting
- Support custom coloring via material color override
- Include shadows and receive lighting from multiple angles

### Visual Feedback
A model information badge is displayed on the 3D canvas showing:
- Current model name
- Confirmation that STL model is loaded

### Loading States
- Loading spinner with model name during STL file load
- Error handling with clear messages if model fails to load
- Progress tracking in console during model loading

## STL File Format

STL (Standard Tessellation Language) is a widely-supported 3D file format that represents surfaces as triangulated meshes. Unlike STEP files, STL files are:

✅ **Browser Compatible**: Three.js STLLoader natively supports STL files
✅ **Web Optimized**: Efficient for real-time rendering in WebGL
✅ **Fast Loading**: Binary STL format provides quick load times
✅ **Universal**: Supported by all 3D modeling software and browsers

## Technical Implementation

### STLLoader Integration
```typescript
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const loader = new STLLoader()
loader.load(
  '/models/iphone_14_pro.stl',
  (geometry) => {
    geometry.center()
    geometry.computeVertexNormals()
    
    const material = new THREE.MeshStandardMaterial({
      color: caseColor,
      roughness: 0.4,
      metalness: 0.1,
    })
    
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
  }
)
```

### Camera & Lighting Setup
- Camera positioned at z=150 for full model visibility
- Orbit controls with damping for smooth interaction
- Ambient light (0.7) + Directional lights (1.0, 0.5, 0.3) for even illumination
- Shadow mapping enabled for depth perception

### Performance Optimizations
- Models are served from `/public/models/` for direct access
- Geometry normals computed once after load
- Pixel ratio capped at 2x for high-DPI displays
- Efficient render loop with proper cleanup on unmount

## Model Customization Features

✅ **Implemented:**
- Real-time color customization of case material
- 3D part placement on case surface (hearts, stars, etc.)
- Orbit controls for 360° viewing
- Zoom and pan capabilities
- Shadow and lighting effects
- Model switching between iPhone models
- Loading states with progress feedback

⏳ **Future Enhancements:**
- Surface drawing directly on STL mesh
- Image texture mapping onto case
- Custom decal placement
- Export customized STL with modifications

## File Specifications

### iPhone 14 Pro STL
- **Size**: ~393 KB
- **Format**: Binary STL
- **Location**: `/public/models/iphone_14_pro.stl`
- **Dimensions**: Accurate to actual iPhone 14 Pro case

### iPhone 16 Pro STL  
- **Size**: ~474 KB
- **Format**: Binary STL
- **Location**: `/public/models/iphone_16_pro.stl`
- **Dimensions**: Accurate to actual iPhone 16 Pro case

## Conversion Process

The original STEP files were converted to STL format for web compatibility:

**Original Files:**
- `Iphone 14 Pro Phone case v7.step`
- `iPhone 16 Pro case .step`

**Conversion Method:**
Converted using CAD software (likely FreeCAD or Blender) to binary STL format with optimized triangle count for web performance.

## Resources

- [Three.js STLLoader Documentation](https://threejs.org/docs/#examples/en/loaders/STLLoader)
- [STL Format Specification](https://en.wikipedia.org/wiki/STL_(file_format))
- [Three.js Examples](https://threejs.org/examples/#webgl_loader_stl)
