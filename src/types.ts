export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  opacity?: number; // overall layer opacity
  blendMode?: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  constraints?: {
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
  };
  layoutAlign?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH';
  layoutGrow?: number; // flex grow equivalent
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE'; // auto-layout direction
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  itemSpacing?: number; // gap between auto-layout items
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  clipsContent?: boolean;
  backgroundColor?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    gradientHandlePositions?: Array<{ x: number; y: number }>;
    gradientStops?: Array<{
      position: number;
      color: { r: number; g: number; b: number; a: number };
    }>;
    imageRef?: string; // reference key for image fills
  }>;
  strokes?: Array<{
    type?: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  strokeJoin?: 'MITER' | 'BEVEL' | 'ROUND';
  strokeMiterAngle?: number;
  strokeDashes?: number[];
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number]; // TL, TR, BR, BL
  children?: FigmaNode[];
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    letterSpacing?: number; // in px
    lineHeightPx?: number;
    lineHeightPercentFontSize?: number;
    textCase?: string;
    textDecoration?: string;
  };
  effects?: Array<{
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    visible?: boolean;
    radius?: number;
    color?: { r: number; g: number; b: number; a: number };
    offset?: { x: number; y: number };
    blendMode?: string;
  }>;
  exportSettings?: Array<{
    format: string; // PNG, JPG, SVG, PDF
    suffix?: string;
    constraint?: {
      type: 'SCALE' | 'WIDTH' | 'HEIGHT';
      value: number;
    };
  }>;
}

export interface FigmaDocument {
  name: string;
  children: FigmaNode[];
}

export interface AppState {
  pat: string;
  figmaUrl: string;
  designData: FigmaDocument | null;
  generatedCode: string;
  step: 'pat' | 'url' | 'fetching' | 'generating' | 'preview';
}
