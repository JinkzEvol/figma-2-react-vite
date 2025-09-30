export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
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
  cornerRadius?: number;
  children?: FigmaNode[];
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    textAlignHorizontal?: string;
  };
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
