// Style token registry for managing text styles and design tokens
export interface TextStyleDescriptor {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  color?: string;
}

export interface StyleTokenRegistry {
  textStyles: Map<string, TextStyleDescriptor>;
  colorTokens: Map<string, string>;
}

export function buildStyleTokenRegistry(): StyleTokenRegistry {
  return {
    textStyles: new Map(),
    colorTokens: new Map(),
  };
}
