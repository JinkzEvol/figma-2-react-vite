import type { FigmaNode } from './types';

function rgbaToString(color?: { r: number; g: number; b: number; a: number }): string {
  if (!color) return 'transparent';
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return color.a === 1 
    ? `rgb(${r}, ${g}, ${b})` 
    : `rgba(${r}, ${g}, ${b}, ${color.a})`;
}

function generateNodeStyles(node: FigmaNode): string {
  const styles: string[] = [];
  
  if (node.absoluteBoundingBox) {
    const box = node.absoluteBoundingBox;
    styles.push(`width: ${box.width}px`);
    styles.push(`height: ${box.height}px`);
  }

  // Background color
  if (node.backgroundColor) {
    styles.push(`background-color: ${rgbaToString(node.backgroundColor)}`);
  } else if (node.fills && node.fills.length > 0 && node.fills[0].color) {
    styles.push(`background-color: ${rgbaToString(node.fills[0].color)}`);
  }

  // Border radius
  if (node.cornerRadius) {
    styles.push(`border-radius: ${node.cornerRadius}px`);
  }

  // Stroke
  if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
    const strokeColor = node.strokes[0].color || { r: 0, g: 0, b: 0, a: 1 };
    styles.push(`border: ${node.strokeWeight}px solid ${rgbaToString(strokeColor)}`);
  }

  // Text styles
  if (node.type === 'TEXT' && node.style) {
    if (node.style.fontFamily) {
      styles.push(`font-family: ${node.style.fontFamily}`);
    }
    if (node.style.fontSize) {
      styles.push(`font-size: ${node.style.fontSize}px`);
    }
    if (node.style.fontWeight) {
      styles.push(`font-weight: ${node.style.fontWeight}`);
    }
    if (node.style.textAlignHorizontal) {
      styles.push(`text-align: ${node.style.textAlignHorizontal.toLowerCase()}`);
    }
  }

  return styles.join('; ');
}

function generateComponentCode(node: FigmaNode, level = 0): string {
  const indent = '  '.repeat(level);
  const styles = generateNodeStyles(node);
  
  // Generate style object for createElement
  const styleObj = styles ? `{ ${styles.split('; ').map(s => {
    const [key, value] = s.split(': ');
    const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
    return `${camelKey}: '${value}'`;
  }).join(', ')} }` : 'null';

  const propsObj = styles ? `{ style: ${styleObj} }` : 'null';

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
