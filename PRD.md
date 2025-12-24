# Planning Guide

A 3D phone case customization platform where users can visually design personalized phone cases by drawing, adding images, and snapping 3D decorative parts (hearts, stars, etc.) onto a realistic 3D model, then purchase or download their custom designs.

**Experience Qualities**:
1. **Playful** - The interface should feel like a creative playground where users experiment freely with colors, textures, and 3D embellishments without fear of mistakes.
2. **Immediate** - Every interaction (rotation, color change, part placement) provides instant visual feedback with the 3D model updating in real-time.
3. **Confident** - Clear visual hierarchy and intuitive controls make users feel empowered to create professional-looking designs without technical expertise.

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
  - This requires multiple interconnected features: 3D rendering and manipulation, drawing tools, image uploads, part snapping system, shopping cart, order management, and file export - all coordinated through a multi-view interface.

## Essential Features

### 3D Phone Case Viewer
- **Functionality**: Real-time 3D visualization of iPhone case with smooth rotation, zoom, camera controls, support for multiple iPhone models (iPhone 14 Pro and iPhone 16 Pro), and dedicated interaction modes that separate camera navigation from object manipulation
- **Purpose**: Allows users to see their design from all angles and understand how it will look in reality, with accurate dimensions for their specific phone model, without the frustration of camera controls interfering with part editing
- **Trigger**: Loads automatically when entering the customizer
- **Progression**: User enters customizer → Select phone model from dropdown → 3D case loads with correct dimensions for selected model → User uses "Camera" mode button to rotate/zoom view → Switches to "Select Part" mode to click parts without moving camera → Selected part shows Move/Rotate/Scale mode buttons → Camera lock button prevents accidental rotations → Model info displayed on canvas
- **Success criteria**: 60fps rendering, <100ms response to user input, smooth camera transitions, accurate model dimensions per phone type, clear separation between camera navigation and part manipulation, no conflicts between interaction modes

### Surface Drawing Tool
- **Functionality**: Freehand drawing directly on the 3D case surface with color picker and brush size controls
- **Purpose**: Enables personalized artistic expression and unique designs
- **Trigger**: User selects "Draw" tool from toolbar
- **Progression**: Select draw tool → Choose color and brush size → Click/drag on case surface → Strokes appear on 3D model → Can undo/redo strokes
- **Success criteria**: Strokes follow case contours, no lag during drawing, accurate placement

### Image Upload & Placement
- **Functionality**: Upload images (PNG/JPG) and position/scale them on case surfaces
- **Purpose**: Allows users to add photos, logos, or artwork to their cases
- **Trigger**: User clicks "Add Image" button
- **Progression**: Click add image → File picker opens → Select image → Image appears on case → Drag to reposition → Resize handles adjust scale → Rotate if needed
- **Success criteria**: Supports common formats, maintains aspect ratio, proper UV mapping

### 3D Parts Library & Snapping
- **Functionality**: Browse library of 3D decorative parts (hearts, stars, flowers, geometric shapes) and snap them onto case with intuitive mode-based controls for moving, rotating, and scaling
- **Purpose**: Adds dimensional, tactile elements to designs for visual interest with clear, non-conflicting controls
- **Trigger**: User opens parts panel
- **Progression**: Open parts library → Browse categories → Click part to select → Part appears on case → Switch to "Select Part" mode → Click part to select it → Use "Move" mode button to reposition → Use "Rotate" mode button to rotate → Use "Scale" mode button to resize → Switch back to "Camera" mode to view from different angles → ESC to deselect → Can duplicate/delete
- **Success criteria**: Smooth mode switching, no camera/manipulation conflicts, clear visual feedback for active mode, correct surface normals, no z-fighting, intuitive button-based mode selection

### Color Customization
- **Functionality**: Change base case color with preset palette and custom color picker
- **Purpose**: Provides foundational design control before adding details
- **Trigger**: User selects case background, then opens color panel
- **Progression**: Select case → Open color picker → Choose from presets or custom → Color updates instantly → Can apply to specific sections
- **Success criteria**: Instant preview, accurate color representation, material consistency

### Design Management
- **Functionality**: Save designs to account, browse saved designs in a gallery view, load previous designs for editing, delete unwanted designs
- **Purpose**: Enables iteration and prevents lost work with visual browsing of all saved creations
- **Trigger**: User clicks "Save Design" to save, or "My Designs" to view gallery
- **Progression**: Click save → Enter design name → Saves to account → Access "My Designs" → Browse gallery with thumbnails → Search designs by name → Click design card to load → Case state restores completely → Continue editing
- **Success criteria**: Complete state persistence, thumbnail generation, quick loading, visual gallery interface, search functionality

### Shopping Cart & Checkout
- **Functionality**: Add customized case to cart, review order, proceed to purchase with full checkout flow
- **Purpose**: Converts creative work into actual product orders with a seamless e-commerce experience
- **Trigger**: User clicks "Add to Cart" from customizer, or "View Cart" to review items
- **Progression**: Finalize design → Click add to cart → Toast confirmation → Click view cart → Review items with preview → Adjust quantities → View order summary → Click checkout → Enter shipping info → Enter payment details → Confirm order → Order confirmation screen
- **Success criteria**: Secure payment processing, order confirmation, design preservation in order, persistent cart across sessions, quantity adjustment, item removal

### 3D Model Export
- **Functionality**: Download customized case as 3D model file (.STL, .OBJ) for 3D printing
- **Purpose**: Allows users to self-manufacture or use third-party services
- **Trigger**: User clicks "Download 3D Model"
- **Progression**: Click download → Select format → Processing generates file → File downloads → Can be opened in CAD software
- **Success criteria**: Manufacturable geometry, proper scale, combined meshes

## Edge Case Handling
- **Empty Design State**: Show inspiring example designs and "Start Designing" prompt when case is blank
- **Large Image Files**: Automatically compress/optimize images >5MB while preserving visual quality
- **Part Collision**: When parts overlap, show subtle highlight and allow manual adjustment or auto-spacing
- **Unsaved Changes**: Prompt user to save before navigating away if modifications exist
- **Mobile Performance**: Reduce poly count and texture resolution on mobile devices while maintaining design fidelity
- **Export Failures**: Provide clear error messages with retry options and alternative formats
- **Browser Compatibility**: Fallback message for browsers without WebGL support with recommendation
- **Model Switching with Existing Design**: When user switches phone models mid-design, preserve all design elements (colors, parts, images) and adjust canvas dimensions accordingly
- **Legacy Designs**: Designs saved before phone model selection was added default to iPhone 16 Pro model for backwards compatibility
- **Mode Confusion**: Clear visual indicators and button labels prevent users from mixing up camera vs part manipulation modes, with contextual tips updating based on active mode
- **Accidental Camera Movement**: Camera lock button prevents unintended view changes during precise part editing
- **Part Selection During Camera Mode**: Clicking parts in camera mode does nothing to prevent accidental selections while navigating the view

## Design Direction
The design should evoke a sense of playful creativity meets modern craftsmanship - like a digital maker's studio that's approachable yet professional. It should feel tactile and inviting, encouraging experimentation while inspiring confidence in the final product quality.

## Color Selection

A vibrant, energetic palette that balances playful creativity with professional e-commerce trust.

- **Primary Color**: `oklch(0.55 0.22 275)` - A rich, confident purple that conveys creativity and premium quality without being overly serious
- **Secondary Colors**: 
  - Base: `oklch(0.95 0.01 275)` - Soft lavender background that's gentle on eyes during extended design sessions
  - Accent panels: `oklch(0.98 0.005 275)` - Near-white with subtle purple tint for elevated surfaces
- **Accent Color**: `oklch(0.65 0.19 145)` - Fresh teal for CTAs, success states, and active tools - creates energetic contrast with purple
- **Foreground/Background Pairings**:
  - Primary Purple (`oklch(0.55 0.22 275)`): White text (`oklch(1 0 0)`) - Ratio 7.2:1 ✓
  - Accent Teal (`oklch(0.65 0.19 145)`): White text (`oklch(1 0 0)`) - Ratio 5.8:1 ✓
  - Background (`oklch(0.95 0.01 275)`): Dark text (`oklch(0.25 0.02 275)`) - Ratio 11.4:1 ✓
  - Muted UI (`oklch(0.88 0.02 275)`): Medium text (`oklch(0.45 0.04 275)`) - Ratio 4.9:1 ✓

## Font Selection
Typography should be contemporary and geometric to reflect the precision of 3D design, while remaining friendly and approachable for creative users.

- **Primary Font**: Space Grotesk - A geometric sans-serif with technical precision that feels modern and approachable
- **Secondary Font**: Inter - For UI elements and body text where maximum readability matters

- **Typographic Hierarchy**:
  - H1 (App Title): Space Grotesk Bold / 32px / -0.02em letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em letter spacing  
  - H3 (Panel Titles): Space Grotesk Medium / 18px / normal spacing
  - Body (UI Labels): Inter Medium / 14px / normal spacing
  - Small (Tool Tips): Inter Regular / 12px / normal spacing
  - Button Text: Space Grotesk Medium / 15px / 0.01em letter spacing

## Animations
Animations should emphasize the physicality of 3D objects and the satisfaction of creation - parts should feel like they have weight and snap into place with subtle spring physics, while camera movements flow smoothly like a handheld inspection of a physical object.

- Tool selections: 150ms ease-out scale with subtle glow
- Part snapping: 200ms spring animation (slight overshoot) when locking to surface
- Camera transitions: 400ms ease-in-out for preset views with momentum
- Button interactions: 100ms scale down on press, 200ms spring back
- Panel slides: 300ms ease-out with slight parallax
- Success confirmations: Celebratory 500ms bounce with particle burst for cart additions

## Component Selection

### Components
- **Dialog**: For image upload flow, design saving, checkout process
- **Popover**: For color picker, brush settings, part details
- **Tabs**: Switching between Draw/Image/Parts/Color modes
- **Card**: Display parts library items, saved designs gallery
- **Button**: Primary CTAs (Add to Cart, Save Design), tool selections, icon buttons for canvas controls
- **Slider**: Brush size, zoom level, part scale controls
- **Input**: Design name, search parts library
- **Badge**: Show part counts, new items indicator
- **Scroll-Area**: Parts library, saved designs list
- **Separator**: Visual breaks between tool sections
- **Tooltip**: Tool explanations, keyboard shortcuts
- **Alert-Dialog**: Unsaved changes warning, delete confirmations

### Customizations
- **3D Canvas Container**: Custom Three.js integration component with orbit controls, raycasting for surface interaction
- **Color Palette Grid**: Custom grid of preset color swatches with selected state
- **Part Preview Cards**: 3D thumbnail renders with hover rotation preview
- **Undo/Redo Stack UI**: Custom history visualization with timeline scrubber

### States
- **Buttons**: Distinct pressed state with 2px inset shadow, hover lifts 1px, disabled at 40% opacity
- **Tool Selection**: Active tool gets thick accent border and subtle glow
- **Parts**: Hover shows info popover, selected gets highlight outline, placed on canvas gets manipulation handles
- **Canvas**: Crosshair cursor for drawing, pointer for selection, grab cursor for rotation

### Icon Selection
- **Pencil**: Draw tool
- **Image**: Upload image
- **Cube**: 3D parts library  
- **PaintBucket**: Color picker
- **ArrowCounterClockwise**: Undo
- **ArrowClockwise**: Redo
- **FloppyDisk**: Save design
- **ShoppingCart**: Add to cart
- **Download**: Export 3D model
- **Eye**: Toggle part visibility
- **Trash**: Delete part/design
- **Plus**: Add new item
- **MagnifyingGlass**: Search parts

### Spacing
- Canvas padding: 0 (fullscreen)
- Toolbar: p-4 (16px)
- Tool buttons: p-3 gap-2 (12px padding, 8px gap)
- Panel sections: space-y-4 (16px vertical)
- Card grid: gap-3 (12px)
- Form elements: space-y-3 (12px)

### Mobile
- **Desktop**: Toolbar on left side (280px), canvas fills remaining space, property panel on right (320px)
- **Tablet**: Bottom toolbar tabs, canvas above, context panel slides up as sheet
- **Mobile**: Single view mode - canvas fullscreen with floating action button to access tools drawer, simplified tool set prioritizing essential functions
