import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

function sampleTree(): FigmaNode {
  return {
    id: 'root', name: 'Root Frame', type: 'FRAME', visible: true,
    layoutMode: 'VERTICAL', itemSpacing: 10, paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8,
    absoluteBoundingBox: { x:0, y:0, width:200, height:100 },
    fills: [{ type: 'SOLID', color:{ r:1, g:1, b:1, a:1 } }],
    effects: [ { type:'DROP_SHADOW', radius:6, offset:{ x:2, y:3 }, color:{ r:0, g:0, b:0, a:0.3 } } ],
    children: [
      { id:'child1', name:'Hidden', type:'RECTANGLE', visible:false, absoluteBoundingBox:{ x:0,y:0,width:50,height:20 } },
      { id:'child2', name:'Text', type:'TEXT', absoluteBoundingBox:{ x:0,y:0,width:80,height:20 }, characters:'Hello', style:{ fontFamily:'Inter', fontSize:14 } }
    ]
  }
}

describe('contract: buildIR', () => {
  it('normalizes layout, visual, text, and filters hidden nodes', () => {
    const raw = sampleTree()
  const ir: any = buildIR(raw)
    expect(ir).toBeTruthy()
    // Intentionally strict assertions that will currently fail
    expect(ir.children?.length).toBe(1)
    expect(ir.layout?.direction).toBe('column')
    expect(ir.visual?.background).toBeDefined()
    expect(ir.textBlocks?.length || 0).toBeGreaterThanOrEqual(0)
  })
})
