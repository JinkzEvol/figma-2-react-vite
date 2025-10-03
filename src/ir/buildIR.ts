import type { FigmaNode } from '../types'

/**
 * Positioning information for a design node.
 * 
 * Determines how a node should be positioned in CSS:
 * - `absolute`: Use CSS `position: absolute` with `left` and `top` values
 * - `flex-item`: Child of an auto-layout container (uses flexbox)
 * - `root`: Top-level node without a parent
 * 
 * @property {string} type - The positioning strategy to use
 * @property {number} [x] - Horizontal position in pixels, relative to parent (only for `absolute`)
 * @property {number} [y] - Vertical position in pixels, relative to parent (only for `absolute`)
 * 
 * @example
 * ```typescript
 * // Absolute positioning at (50, 75)
 * { type: 'absolute', x: 50, y: 75 }
 * 
 * // Flex item (no coordinates needed)
 * { type: 'flex-item' }
 * 
 * // Root node
 * { type: 'root' }
 * ```
 */
export interface PositionInfo {
  type: 'absolute' | 'flex-item' | 'root'
  x?: number  // px, relative to parent
  y?: number  // px, relative to parent
}

/**
 * Intermediate representation (IR) of a Figma design node.
 * 
 * This normalized structure extracts relevant design properties from Figma's API format
 * into a clean, type-safe format suitable for code generation.
 * 
 * @property {string} id - Unique identifier from Figma
 * @property {string} name - Node name from Figma
 * @property {string} type - Normalized node type (FRAME, RECTANGLE, TEXT, etc.)
 * @property {number} [width] - Width in pixels
 * @property {number} [height] - Height in pixels
 * @property {number} [opacity] - Opacity value (0-1), only set if < 1
 * @property {PositionInfo} [position] - Positioning information (added in Feature 003)
 * @property {Object} [layout] - Auto-layout properties (flexbox)
 * @property {Object} [visual] - Visual styling (background, border, radius)
 * @property {Object} [effects] - Visual effects (shadows, blur)
 * @property {Object} [text] - Text content and typography
 * @property {Object} [placeholder] - Accessibility placeholder info
 * @property {DesignNode[]} [children] - Child nodes
 */
export interface DesignNode {
  id: string
  name: string
  type: string
  width?: number
  height?: number
  opacity?: number
  position?: PositionInfo
  layout?: {
    direction?: 'row' | 'column'
    gap?: number
    padding?: [number, number, number, number]
  }
  visual?: {
    background?: string
    border?: { weight: number; color: string } | null
    radius?: [number, number, number, number] | null
  }
  effects?: {
    shadows?: Array<{ x: number; y: number; blur: number; color: string; inset?: boolean }>
    blur?: number
  }
  text?: {
    characters: string
    fontFamily?: string
    fontSize?: number
    fontWeight?: number
    color?: string
    lineHeight?: number
    letterSpacing?: number
    textAlign?: string
  }
  placeholder?: { role: string; ariaLabel: string } | undefined
  children?: DesignNode[]
}

function colorToRgba(c?: { r:number; g:number; b:number; a:number }): string | undefined {
  if (!c) return undefined
  return `rgba(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)}, ${+c.a.toFixed(3)})`
}

function firstVisibleFill(node: FigmaNode): any | undefined {
  return node.fills?.find(f => (f as any).visible !== false)
}

function buildVisual(node: FigmaNode): DesignNode['visual'] | undefined {
  const fill = firstVisibleFill(node)
  const visual: DesignNode['visual'] = {}
  if (fill?.type === 'SOLID' && fill.color) {
    visual.background = colorToRgba(fill.color)
  } else if (fill?.type === 'GRADIENT_LINEAR' && (fill as any).gradientStops && (fill as any).gradientHandlePositions) {
    const stops = (fill as any).gradientStops as Array<{ position:number; color:{r:number;g:number;b:number;a:number} }>
    const handles = (fill as any).gradientHandlePositions as Array<{x:number;y:number}>
    const angle = computeLinearGradientAngle(handles)
    const stopStr = stops.map(s => `${colorToRgba(s.color)} ${Math.round(s.position*100)}%`).join(', ')
    visual.background = `linear-gradient(${angle}deg, ${stopStr})`
  }
  if (node.strokes && node.strokes.length && node.strokeWeight && node.strokes[0].color) {
    visual.border = { weight: node.strokeWeight, color: colorToRgba(node.strokes[0].color)! }
  } else {
    visual.border = null
  }
  if (node.rectangleCornerRadii) {
    visual.radius = node.rectangleCornerRadii
  } else if (typeof node.cornerRadius === 'number') {
    visual.radius = [node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius]
  } else {
    visual.radius = null
  }
  return visual
}

function buildEffects(node: FigmaNode): DesignNode['effects'] | undefined {
  if (!node.effects || !node.effects.length) return undefined
  const shadows: Array<{ x:number; y:number; blur:number; color:string; inset?: boolean }> = []
  let blur: number | undefined
  for (const eff of node.effects) {
    if (eff.visible === false) continue
    if (eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') {
      if (eff.offset && eff.color) {
        shadows.push({ x: eff.offset.x, y: eff.offset.y, blur: eff.radius || 0, color: colorToRgba(eff.color)!, inset: eff.type === 'INNER_SHADOW' || undefined })
      }
    } else if (eff.type === 'LAYER_BLUR') {
      blur = eff.radius
    }
  }
  return { shadows: shadows.length ? shadows : undefined, blur }
}

function buildLayout(node: FigmaNode): DesignNode['layout'] | undefined {
  if (!node.layoutMode || node.layoutMode === 'NONE') return undefined
  const direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'
  const gap = typeof node.itemSpacing === 'number' ? node.itemSpacing : undefined
  const hasPad = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].some(v => typeof v === 'number')
  const padding: [number, number, number, number] | undefined = hasPad ? [node.paddingTop||0, node.paddingRight||0, node.paddingBottom||0, node.paddingLeft||0] : undefined
  return { direction, gap, padding }
}

function buildText(node: FigmaNode): DesignNode['text'] | undefined {
  if (node.type !== 'TEXT' || !node.characters) return undefined
  // Extract text color from first visible solid fill
  const fill = node.fills?.find(f => (f as any).visible !== false && f.type === 'SOLID' && f.color)
  const color = fill && (fill as any).color ? colorToRgba((fill as any).color) : undefined
  return {
    characters: node.characters,
    fontFamily: node.style?.fontFamily,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
    color,
    lineHeight: node.style?.lineHeightPx,
    letterSpacing: node.style?.letterSpacing,
    textAlign: node.style?.textAlignHorizontal?.toLowerCase(),
  }
}

function isHidden(node: FigmaNode): boolean { return node.visible === false }

/**
 * Determines the positioning type for a node based on its parent context.
 * 
 * This function analyzes a Figma node and its parent to determine the appropriate
 * CSS positioning strategy. The logic follows these rules:
 * 
 * 1. If node has no `absoluteBoundingBox`, returns `undefined` (can't position)
 * 2. If node has no parent, returns `{ type: 'root' }` (top-level element)
 * 3. If parent uses auto-layout (`HORIZONTAL` or `VERTICAL`), returns `{ type: 'flex-item' }`
 * 4. Otherwise, calculates relative coordinates and returns `{ type: 'absolute', x, y }`
 * 
 * @param {FigmaNode} node - The Figma node to analyze
 * @param {FigmaNode} [parent] - Optional parent node for context
 * 
 * @returns {PositionInfo | undefined} Positioning information, or undefined if node lacks bounding box
 * 
 * @example
 * ```typescript
 * // Root node (no parent)
 * const pos1 = buildPosition(rootNode);
 * // Returns: { type: 'root' }
 * 
 * // Child of auto-layout parent
 * const pos2 = buildPosition(childNode, flexParent);
 * // Returns: { type: 'flex-item' }
 * 
 * // Child of manual layout parent
 * const pos3 = buildPosition(childNode, manualParent);
 * // Returns: { type: 'absolute', x: 50, y: 75 }
 * 
 * // Node without bounding box
 * const pos4 = buildPosition(invalidNode);
 * // Returns: undefined
 * ```
 * 
 * @remarks
 * - Coordinates are calculated relative to parent's `absoluteBoundingBox`
 * - If parent lacks `absoluteBoundingBox`, treats parent position as (0, 0)
 * - Logs warnings for missing positioning data (doesn't throw errors)
 * - Pure function: does not mutate input parameters
 * - Deterministic: same input always produces same output
 * 
 * @see {@link PositionInfo} for return type details
 * @since Feature 003 - Absolute Positioning
 */
export function buildPosition(node: FigmaNode, parent?: FigmaNode): PositionInfo | undefined {
  // If node has no bounding box, we can't position it
  if (!node.absoluteBoundingBox) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[buildPosition] Node missing absoluteBoundingBox', { 
        nodeId: node.id, 
        nodeName: node.name,
        nodeType: node.type
      })
    }
    return undefined
  }

  // If no parent, this is a root node
  if (!parent) {
    return { type: 'root' }
  }

  // If parent has auto-layout (HORIZONTAL or VERTICAL), child is a flex item
  if (parent.layoutMode === 'HORIZONTAL' || parent.layoutMode === 'VERTICAL') {
    return { type: 'flex-item' }
  }

  // Otherwise, it's absolutely positioned
  // Calculate position relative to parent
  // If parent lacks absoluteBoundingBox, treat as (0, 0) and log warning
  if (!parent.absoluteBoundingBox) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[buildPosition] Parent missing absoluteBoundingBox for absolute child', {
        nodeId: node.id,
        nodeName: node.name,
        parentId: parent.id,
        parentName: parent.name
      })
    }
  }
  const parentX = parent.absoluteBoundingBox?.x ?? 0
  const parentY = parent.absoluteBoundingBox?.y ?? 0
  const x = node.absoluteBoundingBox.x - parentX
  const y = node.absoluteBoundingBox.y - parentY

  return { type: 'absolute', x, y }
}

export function buildIR(raw: FigmaNode, parent?: FigmaNode): DesignNode | null {
  if (!raw || isHidden(raw)) return null
  const base: DesignNode = {
    id: raw.id,
    name: raw.name,
    type: normalizeType(raw.type),
    width: raw.absoluteBoundingBox?.width ? Math.round(raw.absoluteBoundingBox.width) : undefined,
    height: raw.absoluteBoundingBox?.height ? Math.round(raw.absoluteBoundingBox.height) : undefined,
    opacity: (typeof raw.opacity === 'number' && raw.opacity < 1) ? +raw.opacity.toFixed(3) : undefined,
  }
  const layout = buildLayout(raw); if (layout) base.layout = layout
  const visual = buildVisual(raw); if (visual) base.visual = visual
  const effects = buildEffects(raw); if (effects) base.effects = effects
  const text = buildText(raw); if (text) base.text = text
  
  // Add position information
  const position = buildPosition(raw, parent)
  if (position) base.position = position
  
  if (raw.fills?.some(f => f.type === 'IMAGE')) {
    base.placeholder = { role: 'img', ariaLabel: `${raw.name || 'image'} placeholder` }
  }
  if (raw.children && raw.children.length) {
    const childIR: DesignNode[] = []
    for (const c of raw.children) {
      // Pass current node as parent for children
      const built = buildIR(c, raw)
      if (built) childIR.push(built)
    }
    if (childIR.length) base.children = childIR
  }
  return base
}

function normalizeType(t: string): string {
  const known = ['FRAME','RECTANGLE','TEXT']
  if (!known.includes(t)) return 'UNKNOWN'
  return t
}

function computeLinearGradientAngle(handles: Array<{x:number;y:number}>): number {
  if (!handles || handles.length < 2) return 0
  const a = handles[0]
  const b = handles[1]
  const dx = b.x - a.x
  const dy = b.y - a.y
  let deg = Math.atan2(dy, dx) * (180/Math.PI)
  deg = (deg + 90 + 360) % 360
  return Math.round(deg)
}

// Placeholder for future normalization extraction (T029)
export function __internal_testing_only__colorToRgba(c:{r:number;g:number;b:number;a:number}) { return colorToRgba(c) }

// Provide global for tests that declare buildIR without import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof global !== 'undefined' && !(global as any).buildIR) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (global as any).buildIR = buildIR;
}
