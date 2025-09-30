import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T018 Opacity precision & alpha application unit test (FR-012)

describe('opacity precision', () => {
  it('rounds node.opacity to 3 decimals (future) while preserving fill alpha', () => {
    const node: FigmaNode = {
      id:'op1', name:'Opacity', type:'RECTANGLE',
      opacity:0.7534,
      absoluteBoundingBox:{ x:0,y:0,width:10,height:10 },
      fills:[{ type:'SOLID', color:{ r:0.2,g:0.4,b:0.6,a:0.8888 } }]
    }
    const css = extractAllStyles(node)
    // Current implementation will likely produce '0.7534' not '0.753'
    expect(css.opacity).toBe('0.753')
    expect(css.background).toBe('rgba(51, 102, 153, 0.889)')
  })
})

