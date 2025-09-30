import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'

// T046 Contract test for React component generation (expected to FAIL until implemented)
// Requirements:
// - generateReactComponentSource(ir, { componentName? }) returns TSX string
// - Exports FigmaComponent (default or named) as React.FC with optional className prop
// - Includes fidelity styles: opacity, white-space, gradients preserved
// - Deterministic ordering of style keys (alphabetical) and child element order
// - Avoids using window / document (purity check by scanning output)

// Declare future function (implemented in T047)
declare function buildIR(root: FigmaNode): any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare function generateReactComponentSource(ir: any, options?: { componentName?: string; memo?: boolean; }): string

function sampleTree(): FigmaNode {
  return {
    id:'r1', name:'Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:4,
    absoluteBoundingBox:{ x:0,y:0,width:120,height:80 },
    children:[{
      id:'t1', name:'Title', type:'TEXT',
      absoluteBoundingBox:{ x:0,y:0,width:100,height:20 },
      characters:'Hello', opacity:0.9,
      style:{ fontFamily:'Inter', fontSize:16, textAlignHorizontal:'CENTER', fontWeight:600 },
      fills:[{ type:'SOLID', color:{ r:0,g:0,b:0,a:1 } }]
    },{
      id:'g1', name:'GradientBox', type:'RECTANGLE',
      absoluteBoundingBox:{ x:0,y:20,width:100,height:40 },
      fills:[{ type:'GRADIENT_LINEAR', gradientHandlePositions:[{x:0,y:0},{x:1,y:0},{x:1,y:1}], gradientStops:[
        { position:0, color:{ r:1,g:0,b:0,a:1 } },
        { position:1, color:{ r:0,g:0,b:1,a:1 } }
      ] }]
    }]
  } as any;
}

describe('contract: react component generation', () => {
  it('produces TSX exporting FigmaComponent with deterministic styles', () => {
    const ir = buildIR(sampleTree())
    let tsx = ''
    try { tsx = generateReactComponentSource(ir, { componentName:'FigmaComponent' }) } catch { tsx = '' }
    expect(tsx).toContain('FigmaComponent')
    expect(tsx).toMatch(/export const FigmaComponent\s*:/)
    // className prop handling
    expect(tsx).toMatch(/className\?: string/)
    // style fidelity
    expect(tsx.toLowerCase()).toContain('white-space')
    expect(tsx).toMatch(/opacity:\s*0.9/) // numeric opacity in styles
    expect(tsx).toMatch(/linear-gradient\(/) // gradient preservation
    // deterministic ordering: width before word-break alphabetically etc.
    const firstStyleBlock = tsx.match(/style={{([^}]*)}}/)
    if (firstStyleBlock) {
      const keys = firstStyleBlock[1].split(',').map(s => s.split(':')[0].trim()).filter(Boolean)
      const sorted = [...keys].sort()
      expect(keys).toEqual(sorted)
    }
    // purity heuristic
    expect(tsx).not.toMatch(/window|document/)
  })
})
