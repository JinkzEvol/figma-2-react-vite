import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T010 Shadow + blur combination test

describe('effects combination', () => {
  it('includes both boxShadow and filter blur fragments', () => {
    const node: FigmaNode = {
      id:'fx1', name:'fx', type:'RECTANGLE',
      absoluteBoundingBox:{ x:0,y:0,width:50,height:50 },
      fills:[{ type:'SOLID', color:{ r:0.5,g:0.5,b:0.5,a:1 } }],
      effects:[
        { type:'DROP_SHADOW', radius:4, offset:{ x:1,y:1 }, color:{ r:0,g:0,b:0,a:0.4 } },
        { type:'LAYER_BLUR', radius:5 }
      ]
    }
    const css = extractAllStyles(node)
    expect(css.boxShadow).toContain('1px 1px 4px 0')
    // Force failure until blur appended in implementation or correct formatting
    expect(css.filter).toContain('blur(5px)')
  })
})
