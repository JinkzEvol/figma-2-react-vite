import type { FigmaNode } from './types';
import { buildStyleTokenRegistry, type TextStyleDescriptor } from './styles/styleTokenRegistry';
import { exportIcon, type IconNode } from './icons/exportIcon';
import { logPerformanceSample } from './logging/events';
import { extractAllStyles } from './styleExtractors';
import type { DesignNode } from './ir/buildIR';
import { BRAND_PALETTE, NEUTRAL_COLOR, PLACEHOLDER_COLOR } from './styles/brandPalette';

function cssObjToInlineString(obj: Record<string, string | number | undefined>): string {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

function generateComponentCode(node: FigmaNode, level = 0): string {
  const indent = '  '.repeat(level);
  const cssObj = extractAllStyles(node);

  // For non auto-layout nodes with absolute coordinates relative to first positioned ancestor,
  // you may later compute positioning. Placeholder: we only capture width/height now; enhancement todo.
  const styleInline = cssObjToInlineString(cssObj);
  const styleObj = styleInline
    ? `{ ${Object.entries(cssObj).map(([k, v]) => `${camelCase(k)}: '${v}'`).join(', ')} }`
    : 'null';
  const propsObj = styleInline ? `{ style: ${styleObj} }` : 'null';

  if (node.type === 'TEXT' && node.characters) {
    // For text nodes, pass the text as the third argument (children)
    return `${indent}createElement('div', ${propsObj}, '${node.characters.replace(/'/g, "\\'")}')`;
  }

  if (!node.children || node.children.length === 0) {
    return `${indent}createElement('div', ${propsObj})`;
  }

  const childrenCode = node.children
    .map(child => generateComponentCode(child, level + 1))
    .join(',\n');

  return `${indent}createElement('div', ${propsObj},\n${childrenCode}\n${indent})`;
}

export function generateReactCode(designData: {
  nodes?: Record<string, { document: unknown }>;
  document?: unknown;
}): string {
  let rootNode: FigmaNode | null = null;

  // Handle different response structures
  if (designData.nodes) {
    // Response from nodes API
    const firstNodeKey = Object.keys(designData.nodes)[0];
    if (firstNodeKey && designData.nodes[firstNodeKey].document) {
      rootNode = designData.nodes[firstNodeKey].document as FigmaNode;
    }
  } else if (designData.document) {
    // Response from file API
    rootNode = designData.document as FigmaNode;
  }

  if (!rootNode) {
    return '// Error: Could not parse Figma design data';
  }

  const componentName = 'FigmaComponent';
  const componentCode = generateComponentCode(rootNode, 2);

  return `(function(createElement) {
  function ${componentName}() {
    return ${componentCode};
  }
  return ${componentName};
})`;
}

function camelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// New IR-based generator for tests (T032)
// Accepts root DesignNode IR and returns a simple string of nested createElement calls
// capturing text content, inline style (including white-space & opacity), and layout.
export function generateCodeFromIR(ir: DesignNode | null | undefined): string {
  if (!ir) return '';
  const start = Date.now();
  // Brand & neutral colors centralized in brandPalette.ts (FR-015)

  function rgbaToHex(rgba?: string): string | null {
    if (!rgba) return null;
    const m = /rgba?\(([^)]+)\)/.exec(rgba);
    if (!m) return null;
    const parts = m[1].split(/\s*,\s*/).map(p=>+p);
    const [r,g,b] = parts;
    if ([r,g,b].some(x=>Number.isNaN(x))) return null;
    const hex = '#' + [r,g,b].map(v=> v.toString(16).padStart(2,'0')).join('');
    return hex.toLowerCase();
  }
  function resolveTextColor(node: DesignNode, ancestorColor?: string): string {
    // Fallback chain: node explicit -> ancestor -> first brand -> neutral -> placeholder
    const explicit = node.text?.color && (rgbaToHex(node.text.color) || node.text.color);
    return (explicit as string) || ancestorColor || BRAND_PALETTE[0] || NEUTRAL_COLOR || PLACEHOLDER_COLOR;
  }
  function effectiveOpacity(node: DesignNode, parentOpacity: number): number {
    const own = typeof node.opacity === 'number' ? node.opacity : 1;
    return +(parentOpacity * own).toFixed(3);
  }
  function traverse(node: DesignNode, fn:(n:DesignNode)=>void) {
    fn(node);
    if (node.children) for (const c of node.children) traverse(c, fn);
  }
  // Collect text styles deterministically (pre-order traversal)
  const textStyles: TextStyleDescriptor[] = [];
  const icons: IconNode[] = [];
  traverse(ir, n => {
    if (n.text) {
      const colorResolved = resolveTextColor(n);
  const hex = (rgbaToHex(colorResolved) || colorResolved || NEUTRAL_COLOR).toLowerCase();
      textStyles.push({
        fontFamily: n.text.fontFamily || 'sans-serif',
        weight: n.text.fontWeight || 400,
        size: n.text.fontSize || 14,
        lineHeight: n.text.lineHeight || (n.text.fontSize ? n.text.fontSize * 1.2 : 16),
        letterSpacing: n.text.letterSpacing || 0,
        colorHex: hex,
        paragraphSpacing: 0
      });
    }
    if (n.name && /icon/i.test(n.name) && !n.text) {
      icons.push({ id: n.id, name: n.name, width: n.width || 16, height: n.height || 16, vectorData: { paths: [1] } });
    }
  });
  const tokenRegistry = buildStyleTokenRegistry(textStyles);
  const iconExports = icons.map(i => exportIcon(i));
  function styleFor(node: DesignNode, inherited: { color?: string; opacity: number }): Record<string,string> {
    const s: Record<string,string> = {};
    if (node.width) s.width = node.width + 'px';
    if (node.height) s.height = node.height + 'px';
    
    // Position CSS generation (T009)
    if (node.position?.type === 'absolute') {
      s.position = 'absolute';
      if (typeof node.position.x === 'number') s.left = node.position.x + 'px';
      if (typeof node.position.y === 'number') s.top = node.position.y + 'px';
    }
    // If node has absolute children and isn't already absolute, make it relative
    if (s.position !== 'absolute' && node.children?.some(c => c.position?.type === 'absolute')) {
      s.position = 'relative';
    }
    
    if (node.layout) {
      s.display = 'flex';
      if (node.layout.direction) s.flexDirection = node.layout.direction;
      if (typeof node.layout.gap === 'number') s.gap = node.layout.gap + 'px';
      if (node.layout.padding) s.padding = node.layout.padding.map(p=>p+'px').join(' ');
    }
    if (node.visual?.background) s.background = node.visual.background;
    if (node.visual?.border) s.border = `${node.visual.border.weight}px solid ${node.visual.border.color}`;
    if (node.visual?.radius) s.borderRadius = node.visual.radius.join('px ') + 'px';
    if (node.effects?.shadows && node.effects.shadows.length) {
      s.boxShadow = node.effects.shadows.map(sh => {
        const inset = sh.inset ? 'inset ' : '';
        return `${inset}${sh.x}px ${sh.y}px ${sh.blur}px 0 ${sh.color}`;
      }).join(', ');
    }
    if (node.effects?.blur) s.filter = `blur(${node.effects.blur}px)`;
    const resolvedColor = resolveTextColor(node, inherited.color);
    if (node.text) {
      if (node.text.fontFamily) s.fontFamily = node.text.fontFamily;
      if (node.text.fontSize) s.fontSize = node.text.fontSize + 'px';
      if (node.text.fontWeight) s.fontWeight = String(node.text.fontWeight);
      s.color = resolvedColor;
      if (node.text.lineHeight) s.lineHeight = node.text.lineHeight + 'px';
      if (node.text.letterSpacing) s.letterSpacing = node.text.letterSpacing + 'px';
      if (node.text.textAlign) s.textAlign = node.text.textAlign;
      // text fidelity extras
      s.whiteSpace = 'pre-wrap';
      s.wordBreak = 'break-word';
    }
    const effOpacity = effectiveOpacity(node, inherited.opacity);
    if (effOpacity < 1) s.opacity = effOpacity.toString();
    return s;
  }
  function emit(node: DesignNode, level = 0, inherited: { color?: string; opacity: number } = { color: undefined, opacity: 1 }): string {
    const indent = '  '.repeat(level);
    const styleObj = styleFor(node, inherited);
    // Apply token class if applicable
    let tokenClass = '';
    if (node.text) {
      const sigCandidate: TextStyleDescriptor = {
        fontFamily: node.text.fontFamily || 'sans-serif',
        weight: node.text.fontWeight || 400,
        size: node.text.fontSize || 14,
        lineHeight: node.text.lineHeight || (node.text.fontSize ? node.text.fontSize*1.2 : 16),
        letterSpacing: node.text.letterSpacing || 0,
  colorHex: rgbaToHex(styleObj.color) || styleObj.color || NEUTRAL_COLOR,
        paragraphSpacing: 0
      };
      const sig = ['fontFamily','weight','size','lineHeight','letterSpacing','colorHex','paragraphSpacing']
        .map(k=>`${k}:${(sigCandidate as any)[k] ?? ''}`).join('|');
      const name = tokenRegistry.map[sig];
      if (name) tokenClass = name;
    }
    // Icon injection
    let iconMarkup = '';
    const iconMatch = iconExports.find(i => i.id === node.id);
    if (iconMatch) {
      if (iconMatch.fallback) {
        iconMarkup = `<span role="img" aria-label="${iconMatch.label}">□</span>`;
      } else {
        iconMarkup = iconMatch.svg || '';
      }
    }
    if (node.text?.characters && /\S/.test(node.text.characters) === false) {
      // keep whitespace only text as-is
    }
  const nextInherited = { color: styleObj.color || inherited.color, opacity: +( (inherited.opacity) * (typeof node.opacity === 'number' ? node.opacity : 1) ).toFixed(3) };
  const children = node.children?.map(c => emit(c, level + 1, nextInherited)) || [];
  const textChild = node.text?.characters ? `, '${node.text.characters.replace(/'/g, "\\'")}'` : (children.length ? '' : '');
    let childrenBlock = '';
    if (children.length) {
      childrenBlock = ',\n' + children.join(',\n') + '\n' + indent;
    }
    const styleSerialized = Object.keys(styleObj).sort().map(k => {
      const v = styleObj[k];
      const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (/^[0-9]+(\.[0-9]+)?$/.test(v)) return `${cssKey}: ${v}`; // numeric literal
      const esc = v.replace(/'/g, "\\'");
      return `${cssKey}: '${esc}'`;
    }).join(', ');
    const classProp = tokenClass ? `, className: '${tokenClass}'` : '';
    const iconProp = iconMarkup ? `, icon: ${JSON.stringify(iconMarkup)}` : '';
    return `${indent}createElement('div', { style: { ${styleSerialized} }${classProp}${iconProp}${node.placeholder ? `, role: '${node.placeholder.role}', ariaLabel: '${node.placeholder.ariaLabel}'` : ''}}${textChild}${childrenBlock})`;
  }
  const out = emit(ir);
  const dur = Date.now() - start;
  // Rough msPerColumn: treat top-level children as columns heuristic
  const columns = ir.children ? ir.children.length : 1;
  logPerformanceSample('footer', columns, +(dur/columns).toFixed(2));
  return out;
}

// Expose globals in test environment (vitest) via ambient declarations (see global.d.ts)
if (typeof global !== 'undefined') {
  const g = global as Record<string, unknown>;
  if (!g.generateCodeFromIR) g.generateCodeFromIR = generateCodeFromIR;
  if (!g.buildStyleTokenRegistry) g.buildStyleTokenRegistry = buildStyleTokenRegistry;
}

// === React Component Source Generator (T047) ===
export interface ReactComponentGenOptions { componentName?: string; memo?: boolean }

export function generateReactComponentSource(ir: DesignNode | null | undefined, options: ReactComponentGenOptions = {}): string {
  const name = options.componentName || 'FigmaComponent';
  if (!ir) return `// Empty IR\nexport const ${name} = () => null;`;

  function styleFor(node: DesignNode): Record<string,string|number> {
    const s: Record<string,string|number> = {};
    if (node.width) s.width = node.width + 'px';
    if (node.height) s.height = node.height + 'px';
    
    // Position CSS generation (T010)
    if (node.position?.type === 'absolute') {
      s.position = 'absolute';
      if (typeof node.position.x === 'number') s.left = node.position.x + 'px';
      if (typeof node.position.y === 'number') s.top = node.position.y + 'px';
    }
    // If node has absolute children and isn't already absolute, make it relative
    if (s.position !== 'absolute' && node.children?.some(c => c.position?.type === 'absolute')) {
      s.position = 'relative';
    }
    
    if (node.layout) {
      s.display = 'flex';
      if (node.layout.direction) s['flex-direction'] = node.layout.direction;
      if (typeof node.layout.gap === 'number') s.gap = node.layout.gap + 'px';
      if (node.layout.padding) s.padding = node.layout.padding.map(p=>p+'px').join(' ');
    }
    if (node.visual?.background) s.background = node.visual.background;
    if (node.visual?.border) s.border = `${node.visual.border.weight}px solid ${node.visual.border.color}`;
    if (node.visual?.radius) s['border-radius'] = node.visual.radius.join('px ') + 'px';
    if (node.effects?.shadows && node.effects.shadows.length) {
      s['box-shadow'] = node.effects.shadows.map(sh => {
        const inset = sh.inset ? 'inset ' : '';
        return `${inset}${sh.x}px ${sh.y}px ${sh.blur}px 0 ${sh.color}`;
      }).join(', ');
    }
    if (node.effects?.blur) s.filter = `blur(${node.effects.blur}px)`;
    if (typeof node.opacity === 'number') s.opacity = node.opacity;
    if (node.text) {
      if (node.text.fontFamily) s['font-family'] = node.text.fontFamily;
      if (node.text.fontSize) s['font-size'] = node.text.fontSize + 'px';
      if (node.text.fontWeight) s['font-weight'] = node.text.fontWeight;
      if (node.text.color) s.color = node.text.color;
      if (node.text.lineHeight) s['line-height'] = node.text.lineHeight + 'px';
      if (node.text.letterSpacing) s['letter-spacing'] = node.text.letterSpacing + 'px';
      if (node.text.textAlign) s['text-align'] = node.text.textAlign;
      s['white-space'] = 'pre-wrap';
      s['word-break'] = 'break-word';
    }
    return s;
  }
  function serializeStyle(obj: Record<string,string|number>): string {
    const keys = Object.keys(obj).sort();
    return keys.map(k => {
      const v = obj[k];
      return typeof v === 'number' ? `${k}: ${v}` : `${k}: '${(v as string).replace(/'/g,"\\'")}'`;
    }).join(', ');
  }
  function semanticTag(node: DesignNode): string {
    // Heuristic: root named Footer => footer landmark
    if (/footer/i.test(node.name) && !node.text) return 'footer';
    // Text nodes become spans
    if (node.text) return 'span';
    return 'div';
  }
  function isColumnContainer(node: DesignNode): boolean {
    // column if vertical layout with text children
    return !!(node.layout && node.layout.direction === 'column' && node.children && node.children.some(c=>!!c.text));
  }
  function isHeading(node: DesignNode): boolean {
    // name convention: ends with -heading OR first text child inside a column
    if (!node.text) return false;
    if (/-heading$/i.test(node.name)) return true;
    return false;
  }
  function emit(node: DesignNode): string {
    const styleBlock = serializeStyle(styleFor(node));
    const tag = semanticTag(node);
    const roleAria = node.placeholder ? ` role=\"${node.placeholder.role}\" aria-label=\"${node.placeholder.ariaLabel}\"` : '';
    // If this is a column container, group its text children under a list
    let children: string[] = [];
    if (node.children) {
      if (isColumnContainer(node)) {
        const items: string[] = [];
        for (const c of node.children) {
          if (c.text) {
            const heading = isHeading(c);
            const t = heading ? 'h3' : 'span';
            const contentTxt = c.text.characters.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            items.push(`<li><${t}>${contentTxt}</${t}></li>`);
          } else {
            items.push(`<li>${emit(c)}</li>`);
          }
        }
        children = [`<ul>${items.join('')}</ul>`];
      } else {
        children = node.children.map(c => emit(c));
      }
    }
    const content = node.text?.characters ? node.text.characters.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
    if (!children.length) {
      return `<${tag} style={{ ${styleBlock} }}${roleAria}>${content}</${tag}>`;
    }
    return `<${tag} style={{ ${styleBlock} }}${roleAria}>${content}${children.join('')}</${tag}>`;
  }
  const bodyTree = emit(ir);
  let component = `import * as React from 'react'\n\nexport interface ${name}Props { className?: string }\nexport const ${name}: React.FC<${name}Props> = (props) => {\n  return (\n    <div className={props.className || undefined}>${bodyTree}</div>\n  );\n};\n`;
  if (options.memo) {
    component += `\nexport const ${name}Memo = React.memo(${name});\n`;
  }
  return component;
}

// global for tests (declaration style)
if (typeof global !== 'undefined') {
  const g = global as Record<string, unknown>;
  if (!g.generateReactComponentSource) g.generateReactComponentSource = generateReactComponentSource;
}
