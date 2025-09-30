import type { FigmaNode } from './types';
import { extractAllStyles } from './styleExtractors';
import type { DesignNode } from './ir/buildIR';

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
  function styleFor(node: DesignNode): Record<string,string> {
    const s: Record<string,string> = {};
    if (node.width) s.width = node.width + 'px';
    if (node.height) s.height = node.height + 'px';
    if (node.layout) {
      s.display = 'flex';
      if (node.layout.direction) s.flexDirection = node.layout.direction;
      if (typeof node.layout.gap === 'number') s.gap = node.layout.gap + 'px';
      if (node.layout.padding) s.padding = node.layout.padding.map(p=>p+'px').join(' ');
    }
    if (node.visual?.background) s.background = node.visual.background;
    if (node.visual?.border) s.border = `${node.visual.border.weight}px solid ${node.visual.border.color}`;
    if (node.visual?.radius) s.borderRadius = node.visual.radius.join('px ') + 'px';
    if (node.effects?.blur) s.filter = `blur(${node.effects.blur}px)`;
    if (node.text) {
      if (node.text.fontFamily) s.fontFamily = node.text.fontFamily;
      if (node.text.fontSize) s.fontSize = node.text.fontSize + 'px';
      if (node.text.fontWeight) s.fontWeight = String(node.text.fontWeight);
      // text fidelity extras
      s.whiteSpace = 'pre-wrap';
      s.wordBreak = 'break-word';
    }
    if (typeof node.opacity === 'number') {
      s.opacity = node.opacity.toString();
    }
    return s;
  }
  function emit(node: DesignNode, level = 0): string {
    const indent = '  '.repeat(level);
    const styleObj = styleFor(node);
    if (node.text?.characters && /\S/.test(node.text.characters) === false) {
      // keep whitespace only text as-is
    }
    const children = node.children?.map(c => emit(c, level + 1)) || [];
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
    return `${indent}createElement('div', { style: { ${styleSerialized} }${node.placeholder ? `, role: '${node.placeholder.role}', ariaLabel: '${node.placeholder.ariaLabel}'` : ''}}${textChild}${childrenBlock})`;
  }
  return emit(ir);
}

// Expose globals in test environment (vitest uses node env with globals flag)
// so that declaration-based tests can call generateCodeFromIR without importing.
// This is a light shim; in real app you'd import explicitly.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof global !== 'undefined' && !(global as any).generateCodeFromIR) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (global as any).generateCodeFromIR = generateCodeFromIR;
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
    if (node.layout) {
      s.display = 'flex';
      if (node.layout.direction) s['flex-direction'] = node.layout.direction;
      if (typeof node.layout.gap === 'number') s.gap = node.layout.gap + 'px';
      if (node.layout.padding) s.padding = node.layout.padding.map(p=>p+'px').join(' ');
    }
    if (node.visual?.background) s.background = node.visual.background;
    if (node.visual?.border) s.border = `${node.visual.border.weight}px solid ${node.visual.border.color}`;
    if (node.visual?.radius) s['border-radius'] = node.visual.radius.join('px ') + 'px';
    if (node.effects?.blur) s.filter = `blur(${node.effects.blur}px)`;
    if (typeof node.opacity === 'number') s.opacity = node.opacity;
    if (node.text) {
      if (node.text.fontFamily) s['font-family'] = node.text.fontFamily;
      if (node.text.fontSize) s['font-size'] = node.text.fontSize + 'px';
      if (node.text.fontWeight) s['font-weight'] = node.text.fontWeight;
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
  function emit(node: DesignNode): string {
    const styleBlock = serializeStyle(styleFor(node));
    const roleAria = node.placeholder ? ` role=\"${node.placeholder.role}\" aria-label=\"${node.placeholder.ariaLabel}\"` : '';
    const tag = node.text ? 'span' : 'div';
    const children = node.children?.map(c => emit(c)) || [];
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (typeof global !== 'undefined' && !(global as any).generateReactComponentSource) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  (global as any).generateReactComponentSource = generateReactComponentSource;
}
