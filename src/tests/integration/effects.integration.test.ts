import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

describe('integration: effects', () => {
  it('captures multiple shadows and layer blur', () => {
    const root: FigmaNode = {
      id:'fxroot', name:'FX Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:4,
      absoluteBoundingBox:{ x:0,y:0,width:150,height:100 },
      children:[{
        id:'target', name:'Target', type:'RECTANGLE',
        absoluteBoundingBox:{ x:0,y:0,width:80,height:40 },
        fills:[{ type:'SOLID', color:{ r:1,g:1,b:1,a:1 } }],
        effects:[
          { type:'DROP_SHADOW', radius:2, offset:{ x:1,y:1 }, color:{ r:0,g:0,b:0,a:0.3 } },
          { type:'DROP_SHADOW', radius:6, offset:{ x:3,y:4 }, color:{ r:0,g:0,b:0,a:0.2 } },
          { type:'LAYER_BLUR', radius:5 }
        ]
      }]
    }
    let ir: any; try { ir = buildIR(root) } catch { ir = {} }
    // Force failing expectations until IR collects effects arrays
    expect(ir.children?.[0]?.effects?.shadows?.length).toBe(2)
    expect(ir.children?.[0]?.effects?.blur).toBe(5)
  })
})
