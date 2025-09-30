# Backlog: Rendering Fidelity Improvements

## Implemented Improvements (v2)

### 1. ✅ Text Color Rendering
**Impact**: HIGH - Text was rendering in default black regardless of Figma color
- **Issue**: Text color from Figma fills was not being captured in the IR
- **Fix**: Extended `DesignNode.text` interface to include `color` field
- **Implementation**: 
  - Updated `buildText()` in `buildIR.ts` to extract color from first visible solid fill
  - Updated both code generators to apply text color in styles
- **Visual Impact**: All text now renders in correct colors matching Figma design

### 2. ✅ Box Shadow Rendering (Drop Shadows & Inner Shadows)
**Impact**: HIGH - Shadows are critical for depth and visual hierarchy
- **Issue**: Shadow data was captured in IR but never rendered
- **Fix**: Added box-shadow CSS generation from `effects.shadows` array
- **Implementation**:
  - Updated `generateReactComponentSource()` to generate box-shadow CSS
  - Updated `generateCodeFromIR()` to include box-shadow in style object
  - Properly handles inset shadows with 'inset' prefix
  - Supports multiple shadows with comma separation
- **Visual Impact**: Drop shadows and inner shadows now render correctly

### 3. ✅ Complete Text Styling
**Impact**: MEDIUM - Text layout and spacing now match Figma precisely
- **Issue**: Missing line-height, letter-spacing, and text-align properties
- **Fix**: Extended text properties in IR and code generators
- **Implementation**:
  - Added `lineHeight`, `letterSpacing`, `textAlign` to `DesignNode.text` interface
  - Updated `buildText()` to extract these properties from Figma node.style
  - Updated both code generators to apply these styles
- **Visual Impact**: Text spacing and alignment now matches Figma design

### 4. ✅ Stroke/Border Rendering in IR-based Generator
**Impact**: MEDIUM - Borders were already in IR but not consistently rendered
- **Issue**: Border data existed in `visual.border` but was already being rendered
- **Status**: Verified working - borders render correctly in both generators
- **Note**: No changes needed - this was already implemented correctly

### 5. ✅ Corner Radius Rendering
**Impact**: MEDIUM - Rounded corners are important for UI polish
- **Issue**: Corner radius data existed in IR but was already being rendered
- **Status**: Verified working - both uniform and individual corner radii render correctly
- **Note**: No changes needed - this was already implemented correctly

## Summary of Changes

**Files Modified**:
- `src/ir/buildIR.ts` - Extended text interface and buildText function
- `src/codeGenerator.ts` - Updated both generators with complete rendering

**Test Results**: All 30 tests pass ✓

**Key Benefits**:
1. Text now renders with correct colors (critical for readability)
2. Shadows provide proper depth and visual hierarchy
3. Text spacing (line-height, letter-spacing) matches Figma precisely
4. Text alignment preserved from design
5. Overall visual fidelity dramatically improved

## Future Enhancements (Deferred)

### Low Priority Improvements
- Radial and angular gradients (currently use first stop as fallback)
- Background blur effects (backdrop-filter)
- Text decoration and text transform support
- Multiple stroke styles
- Advanced corner radius (elliptical corners)
- Clipping and masking
- Blend modes

### Medium Priority
- Image fill extraction and rendering (currently uses placeholder)
- Responsive scaling based on constraints
- Auto-layout sizing modes (HUG, FILL, FIXED)

### Advanced Features
- Design token extraction
- Component variant synthesis
- Semantic HTML element inference
- Code splitting and optimization
