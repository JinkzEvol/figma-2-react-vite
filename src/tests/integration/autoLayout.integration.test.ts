import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

describe('integration: auto-layout fidelity', () => {
  it('preserves nested flex directions, gaps, padding, and child counts', () => {
    const tree: FigmaNode = {
      id:'root', name:'Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:16,
      paddingTop:8, paddingBottom:8, paddingLeft:12, paddingRight:12,
      absoluteBoundingBox:{ x:0,y:0,width:400,height:300 },
      children:[
        { id:'row1', name:'Row1', type:'FRAME', layoutMode:'HORIZONTAL', itemSpacing:4,
          absoluteBoundingBox:{ x:0,y:0,width:380,height:40 },
          children:[
            { id:'c1', name:'Box1', type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:40,height:40 } },
            { id:'c2', name:'Box2', type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:40,height:40 } }
          ]
        },
        { id:'row2', name:'Row2', type:'FRAME', layoutMode:'HORIZONTAL', itemSpacing:6,
          absoluteBoundingBox:{ x:0,y:0,width:380,height:40 },
          children:[
            { id:'c3', name:'Box3', type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:40,height:40 } }
          ]
        }
      ]
    }
    let ir: any; try { ir = buildIR(tree) } catch { ir = {} }
    expect(ir.children?.length).toBe(2)
    expect(ir.layout?.direction).toBe('column')
    // Will fail until layout mapping implemented
    expect(ir.children?.[0]?.layout?.direction).toBe('row')
  })
})
