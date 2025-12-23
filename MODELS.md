# Phone Case 3D Models

## Available Models

This project includes STEP (.step) model files for accurate iPhone case representations:

1. **iPhone 14 Pro Case** - `Iphone 14 Pro Phone case v7.step`
2. **iPhone 16 Pro Case** - `iPhone 16 Pro case .step`

## Current Implementation

### Model Selection
Users can select their desired phone model from a dropdown in the Properties Panel. The application tracks which model is being used throughout the design process:

- Model selection persists across designs
- Each saved design remembers which phone model was used
- Cart items display the specific phone model
- Saved designs gallery shows the phone model for each design

### 3D Rendering
Currently, the application uses **procedural geometry** (Three.js primitives) to render the phone cases in the 3D canvas. The dimensions are adjusted based on the selected phone model:

- **iPhone 14 Pro**: 3.4cm × 7.0cm × 0.5cm
- **iPhone 16 Pro**: 3.5cm × 7.2cm × 0.48cm

### Visual Feedback
A model information badge is displayed on the 3D canvas showing:
- Current model name
- STEP file being referenced

## STEP File Format

STEP (Standard for the Exchange of Product Data) is a CAD file format commonly used for 3D modeling. However, **STEP files are not natively supported in web browsers**.

### Why STEP Files Cannot Be Used Directly

1. **Browser Compatibility**: Web browsers (via WebGL/Three.js) cannot load STEP files directly
2. **Format Complexity**: STEP is a CAD exchange format designed for engineering software, not web rendering
3. **Performance**: STEP files contain complex geometric data that needs conversion for efficient web rendering

### Options for Using Your STEP Models

To actually use your STEP models in the web application, you would need to:

#### Option 1: Convert to Web-Compatible Formats (Recommended)
Convert the STEP files to formats Three.js can load:

1. **GLB/GLTF** (Recommended)
   - Industry-standard web 3D format
   - Supports materials, textures, and animations
   - Excellent compression and loading performance
   - Tools: Blender (free), FreeCAD (free), or online converters

2. **OBJ + MTL**
   - Widely supported format
   - Separate geometry (.obj) and material (.mtl) files
   - Good compatibility but larger file sizes

3. **FBX**
   - Common in game development
   - Good material support
   - Tools: Blender, Autodesk FBX Converter

**Conversion Steps Using Blender (Free):**
```bash
1. Install Blender (blender.org)
2. File → Import → STEP (.step)
3. Select your iPhone case STEP file
4. File → Export → glTF 2.0 (.glb/.gltf)
5. Choose "glTF Binary (.glb)" for single-file export
6. Save to: /workspaces/spark-template/src/assets/models/
```

#### Option 2: Use a Conversion Service
Online services like:
- CAD Exchanger (cadexchanger.com)
- AnyConv (anyconv.com/step-to-gltf-converter)
- Aspose Conversion Tools

#### Option 3: Server-Side Conversion
Set up a backend service that:
1. Accepts STEP files
2. Converts them using libraries like Open Cascade
3. Returns GLB files to the frontend

This would be more complex but allows dynamic conversion.

## Integration Guide (After Conversion)

Once you have GLB files, follow these steps:

### 1. Create Assets Directory Structure
```
src/
  assets/
    models/
      iphone-14-pro-case.glb
      iphone-16-pro-case.glb
```

### 2. Install GLTFLoader (Already Available)
Three.js includes GLTFLoader in its examples. It's already available in the project.

### 3. Update PhoneCaseCanvas.tsx
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Import the model files
import iphone14ProModel from '@/assets/models/iphone-14-pro-case.glb'
import iphone16ProModel from '@/assets/models/iphone-16-pro-case.glb'

// In your useEffect:
const loader = new GLTFLoader()
const modelPath = phoneModel === 'iphone-14-pro' ? iphone14ProModel : iphone16ProModel

loader.load(modelPath, (gltf) => {
  const caseMesh = gltf.scene.children[0]
  
  // Apply color
  caseMesh.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(caseColor)
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  scene.add(gltf.scene)
  caseMeshRef.current = caseMesh
  setIsLoading(false)
})
```

### 4. Update Vite Config (If Needed)
Ensure Vite handles GLB files correctly. Add to `vite.config.ts` if needed:
```typescript
export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf'],
})
```

## Current Status

✅ **Implemented:**
- Phone model selection UI
- Model tracking in designs
- Dimension adjustments per model
- Model display in cart and gallery
- Visual model indicator on canvas

⏳ **Pending:**
- Actual STEP model loading (requires conversion to GLB/GLTF)
- Replace procedural geometry with real models

## Next Steps

To fully integrate your STEP models:

1. **Convert STEP files to GLB format** using Blender or another tool
2. **Place GLB files** in `src/assets/models/` directory
3. **Update PhoneCaseCanvas.tsx** to load GLB files instead of using procedural geometry
4. **Test** that models load correctly and materials can be colored
5. **Optimize** model polygon count if needed for web performance

## Technical Notes

- Current procedural geometry provides correct proportions for each model
- All design features (colors, parts, images) work with current implementation
- Switching to real models will enhance visual accuracy
- Model file sizes should ideally be under 1MB each for web performance
- Consider using Draco compression for GLB files to reduce file size further

## Resources

- [Three.js GLTFLoader Documentation](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)
- [Blender Download](https://www.blender.org/download/)
- [glTF Specification](https://github.com/KhronosGroup/glTF)
- [Draco 3D Compression](https://github.com/google/draco)
