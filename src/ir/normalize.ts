import type { FigmaNode } from '../types'

export function colorToRgba(c?: { r:number; g:number; b:number; a:number }): string | undefined {
  if (!c) return undefined
  return `rgba(${Math.round(c.r*255)}, ${Math.round(c.g*255)}, ${Math.round(c.b*255)}, ${+c.a.toFixed(3)})`
}

export function getFirstVisibleFill(node: FigmaNode): any | undefined {
  return node.fills?.find(f => (f as any).visible !== false)
}

export function normalizeType(t: string): string {
  const known = ['FRAME','RECTANGLE','TEXT']
  return known.includes(t) ? t : 'UNKNOWN'
}

export function extractLayout(node: FigmaNode) {
  if (!node.layoutMode || node.layoutMode === 'NONE') return undefined
  const direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column'
  const gap = typeof node.itemSpacing === 'number' ? node.itemSpacing : undefined
  const hasPad = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].some(v => typeof v === 'number')
  const padding = hasPad ? [node.paddingTop||0, node.paddingRight||0, node.paddingBottom||0, node.paddingLeft||0] as [number,number,number,number] : undefined
  return { direction, gap, padding }
}

export function extractVisual(node: FigmaNode) {
  const fill = getFirstVisibleFill(node)
  const visual: any = {}
  if (fill?.type === 'SOLID' && fill.color) visual.background = colorToRgba(fill.color)
  if (node.strokes && node.strokes.length && node.strokeWeight && node.strokes[0].color) {
    visual.border = { weight: node.strokeWeight, color: colorToRgba(node.strokes[0].color)! }
  } else visual.border = null
  if (node.rectangleCornerRadii) visual.radius = node.rectangleCornerRadii
  else if (typeof node.cornerRadius === 'number') visual.radius = [node.cornerRadius, node.cornerRadius, node.cornerRadius, node.cornerRadius]
  else visual.radius = null
  return visual
}

export function extractEffects(node: FigmaNode) {
  if (!node.effects || !node.effects.length) return undefined
  const shadows: Array<{ x:number; y:number; blur:number; color:string; inset?: boolean }> = []
  let blur: number | undefined
  for (const eff of node.effects) {
    if (eff.visible === false) continue
    if ((eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') && eff.offset && eff.color) {
      shadows.push({ x: eff.offset.x, y: eff.offset.y, blur: eff.radius || 0, color: colorToRgba(eff.color)!, inset: eff.type === 'INNER_SHADOW' || undefined })
    } else if (eff.type === 'LAYER_BLUR') blur = eff.radius
  }
  return { shadows: shadows.length ? shadows : undefined, blur }
}

export function extractText(node: FigmaNode) {
  if (node.type !== 'TEXT' || !node.characters) return undefined
  return {
    characters: node.characters,
    fontFamily: node.style?.fontFamily,
    fontSize: node.style?.fontSize,
    fontWeight: node.style?.fontWeight,
  }
}
