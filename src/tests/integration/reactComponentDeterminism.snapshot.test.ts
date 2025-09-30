import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'

// T048 Determinism snapshot test
// Generates React component source twice from same IR and checks identical output.
// (Will pass only after generateReactComponentSource exists & is deterministic.)

declare function buildIR(root: FigmaNode): any
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare function generateReactComponentSource(ir: any, options?: { componentName?: string; memo?: boolean }): string

function doc(): FigmaNode {
  return {
    id:'d1', name:'Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:6,
    absoluteBoundingBox:{ x:0,y:0,width:140,height:60 },
    children:[{
      id:'t1', name:'Text', type:'TEXT',
      absoluteBoundingBox:{ x:0,y:0,width:100,height:20 },
      characters:'Determinism', style:{ fontFamily:'Inter', fontSize:12, textAlignHorizontal:'LEFT' },
      fills:[{ type:'SOLID', color:{ r:0,g:0,b:0,a:1 }}]
    }]
  } as any;
}

describe('integration: react component determinism', () => {
  it('produces identical component source on repeated generation', () => {
    const ir = buildIR(doc())
    const a = generateReactComponentSource(ir, { componentName:'FigmaComponent' })
    const b = generateReactComponentSource(ir, { componentName:'FigmaComponent' })
    expect(b).toBe(a)
  })
})
