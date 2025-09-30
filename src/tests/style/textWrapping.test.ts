import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T016 Text wrapping under fixed width

describe('text wrapping', () => {
  it('applies whiteSpace pre-wrap and (future) wordBreak style', () => {
    const node: FigmaNode = {
      id:'wrap1', name:'Paragraph', type:'TEXT',
      characters:'Some long content that should wrap to the next line',
      style:{ fontFamily:'Inter', fontSize:14 },
      absoluteBoundingBox:{ x:0,y:0,width:120,height:60 },
      fills:[{ type:'SOLID', color:{ r:0,g:0,b:0,a:1 } }]
    }
    const css = extractAllStyles(node)
    expect(css.whiteSpace).toBe('pre-wrap')
    // Force failure pending implementation of wrapping tuning
    expect((css as any).wordBreak).toBe('break-word')
  })
})
