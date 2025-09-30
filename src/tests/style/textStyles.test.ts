import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T012 Text styling fidelity

describe('text styles', () => {
  it('maps font properties and alignment', () => {
    const node: FigmaNode = {
      id:'txt1', name:'Title', type:'TEXT',
      absoluteBoundingBox:{ x:0,y:0,width:100,height:28 },
      style:{ fontFamily:'Inter', fontSize:24, fontWeight:700, textAlignHorizontal:'CENTER', letterSpacing:0.5, lineHeightPx:26, textCase:'UPPER' },
      fills:[{ type:'SOLID', color:{ r:0,g:0,b:0,a:1 } }]
    }
    const css = extractAllStyles(node)
    expect(css.fontFamily).toBe('Inter')
    expect(css.fontSize).toBe('24px')
    expect(css.fontWeight).toBe('700')
    expect(css.textAlign).toBe('center')
    expect(css.textTransform).toBe('uppercase')
    // Force failure: expecting color field which is not yet implemented in extractor
    expect((css as any).color).toBe('rgb(0, 0, 0)')
  })
})
