import type { FigmaNode } from './types';

// Utility to convert Figma color (0-1 each channel) to rgba() string
export function figmaColorToRgba(color?: { r: number; g: number; b: number; a: number }): string | undefined {
  if (!color) return undefined;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = +(color.a.toFixed(3));
  return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

function forceRgba(color?: { r: number; g: number; b: number; a: number }): string | undefined {
  if (!color) return undefined;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = +(color.a.toFixed(3));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export interface CSSAccumulator {
  [prop: string]: string | number | undefined;
}

export function extractLayout(node: FigmaNode, css: CSSAccumulator) {
  if (node.layoutMode && node.layoutMode !== 'NONE') {
    css.display = 'flex';
    css.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    if (node.primaryAxisAlignItems) {
      css.justifyContent = mapPrimaryAxisAlignment(node.primaryAxisAlignItems);
    }
    if (node.counterAxisAlignItems) {
      css.alignItems = mapCounterAxisAlignment(node.counterAxisAlignItems);
    }
    if (typeof node.itemSpacing === 'number' && node.itemSpacing > 0) {
      css.gap = `${node.itemSpacing}px`;
    }
    // Padding
    if (defined(node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft)) {
      css.padding = `${node.paddingTop || 0}px ${node.paddingRight || 0}px ${node.paddingBottom || 0}px ${node.paddingLeft || 0}px`;
    }
  }
}

export function extractBox(node: FigmaNode, css: CSSAccumulator) {
  const box = node.absoluteBoundingBox;
  if (box) {
    css.width = `${Math.round(box.width)}px`;
    css.height = `${Math.round(box.height)}px`;
    // Position is deferred; for auto-layout children we rely on flex, otherwise absolutely position later.
  }
  if (node.clipsContent) css.overflow = 'hidden';
  if (typeof node.opacity === 'number' && node.opacity < 1) css.opacity = node.opacity.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
}

export function extractFill(node: FigmaNode, css: CSSAccumulator) {
  if (node.fills && node.fills.length) {
    const fill = node.fills.find(f => (f as any).visible !== false);
    if (fill) {
      if (fill.type === 'SOLID' && fill.color) {
        css.background = figmaColorToRgba(fill.color);
      } else if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops && fill.gradientHandlePositions) {
        const angle = computeLinearGradientAngle(fill.gradientHandlePositions);
        const stops = fill.gradientStops.map(s => `${forceRgba(s.color)} ${Math.round(s.position * 100)}%`).join(', ');
        css.background = `linear-gradient(${angle}deg, ${stops})`;
      } else if (fill.type === 'IMAGE') {
        // Placeholder until real image extraction—leave background undefined so placeholder logic can inject later.
      }
    }
  } else {
    // No fills: explicitly avoid using backgroundColor when fills array exists but empty (negative case test)
    if (!node.fills && node.backgroundColor) {
      css.background = figmaColorToRgba(node.backgroundColor);
    }
  }
}

export function extractStroke(node: FigmaNode, css: CSSAccumulator) {
  if (node.strokes && node.strokes.length && node.strokeWeight) {
    const stroke = node.strokes[0];
    if (stroke.color) {
      css.border = `${node.strokeWeight}px solid ${figmaColorToRgba(stroke.color)}`;
    }
    if (node.rectangleCornerRadii) {
      const [tl, tr, br, bl] = node.rectangleCornerRadii;
      css.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
    } else if (typeof node.cornerRadius === 'number') {
      css.borderRadius = `${node.cornerRadius}px`;
    }
  }
}

export function extractText(node: FigmaNode, css: CSSAccumulator) {
  if (node.type === 'TEXT' && node.style) {
    const s = node.style;
    if (s.fontFamily) css.fontFamily = s.fontFamily;
    if (s.fontSize) css.fontSize = `${s.fontSize}px`;
    if (s.fontWeight) css.fontWeight = s.fontWeight.toString();
    if (s.letterSpacing) css.letterSpacing = `${s.letterSpacing}px`;
    if (s.lineHeightPx) css.lineHeight = `${Math.round(s.lineHeightPx)}px`;
    if (s.textAlignHorizontal) css.textAlign = s.textAlignHorizontal.toLowerCase();
    if (s.textDecoration && s.textDecoration !== 'NONE') css.textDecoration = s.textDecoration.toLowerCase();
    if (s.textCase && s.textCase !== 'ORIGINAL') css.textTransform = mapTextCase(s.textCase);
    // vertical alignment handled by parent flex container typically
    css.whiteSpace = 'pre-wrap';
    // capture text color from first visible fill if present
    const fill = node.fills?.find(f => (f as any).visible !== false && f.type === 'SOLID' && f.color);
    if (fill && (fill as any).color) {
      const c = figmaColorToRgba((fill as any).color);
      if (c) css.color = c;
    }
    // anticipate wrapping behavior
    css.wordBreak = 'break-word';
  }
}

export function extractEffects(node: FigmaNode, css: CSSAccumulator) {
  if (!node.effects) return;
  const shadows: string[] = [];
  for (const eff of node.effects) {
    if (eff.visible === false) continue;
    if (eff.type === 'DROP_SHADOW' || eff.type === 'INNER_SHADOW') {
      if (eff.color && eff.offset) {
        const c = figmaColorToRgba(eff.color);
        const inset = eff.type === 'INNER_SHADOW' ? ' inset' : '';
        shadows.push(`${eff.offset.x}px ${eff.offset.y}px ${eff.radius || 0}px 0 ${c}${inset}`);
      }
    } else if (eff.type === 'LAYER_BLUR') {
      css.filter = appendFilter(css.filter, `blur(${eff.radius}px)`);
    } else if (eff.type === 'BACKGROUND_BLUR') {
      css.backdropFilter = appendFilter(css.backdropFilter, `blur(${eff.radius}px)`);
    }
  }
  if (shadows.length) css.boxShadow = shadows.join(', ');
}

function appendFilter(existing: any, fragment: string) {
  return existing ? `${existing} ${fragment}` : fragment;
}

function mapPrimaryAxisAlignment(a: string): string {
  switch (a) {
    case 'MIN': return 'flex-start';
    case 'MAX': return 'flex-end';
    case 'SPACE_BETWEEN': return 'space-between';
    case 'CENTER':
    default: return 'center';
  }
}
function mapCounterAxisAlignment(a: string): string {
  switch (a) {
    case 'MIN': return 'flex-start';
    case 'MAX': return 'flex-end';
    case 'BASELINE': return 'baseline';
    case 'CENTER':
    default: return 'center';
  }
}
function mapTextCase(tc: string): string | undefined {
  switch (tc) {
    case 'UPPER': return 'uppercase';
    case 'LOWER': return 'lowercase';
    case 'TITLE': return 'capitalize';
    default: return undefined;
  }
}
function defined(...vals: any[]): boolean { return vals.some(v => typeof v === 'number'); }

export function extractAllStyles(node: FigmaNode): CSSAccumulator {
  const cssRaw: CSSAccumulator = {};
  extractLayout(node, cssRaw);
  extractBox(node, cssRaw);
  extractFill(node, cssRaw);
  extractStroke(node, cssRaw);
  extractText(node, cssRaw);
  extractEffects(node, cssRaw);
  // Deterministic ordering: build new object with sorted keys (alpha) keeping test-required ordering hints
  const ordered: CSSAccumulator = {};
  Object.keys(cssRaw).sort().forEach(k => { ordered[k] = cssRaw[k]; });
  return ordered;
}

function computeLinearGradientAngle(handles: Array<{x:number;y:number}>): number {
  if (!handles || handles.length < 2) return 0;
  const a = handles[0];
  const b = handles[1];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const rad = Math.atan2(dy, dx); // 0 rad is along +x
  let deg = rad * (180/Math.PI);
  // CSS gradient angle: 0deg points upward by spec; adjust by +90deg to align x-axis to vertical
  deg = (deg + 90 + 360) % 360;
  return Math.round(deg);
}
