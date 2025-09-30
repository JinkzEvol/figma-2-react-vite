import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T013 Auto-layout layout + padding + gap mapping

describe('auto-layout mapping', () => {
  it('maps horizontal layout properties', () => {
    const node: FigmaNode = {
      id:'lay1', name:'Row', type:'FRAME',
      layoutMode:'HORIZONTAL', itemSpacing:12,
      primaryAxisAlignItems:'CENTER', counterAxisAlignItems:'MAX',
      paddingTop:4, paddingBottom:4, paddingLeft:10, paddingRight:10,
      absoluteBoundingBox:{ x:0,y:0,width:300,height:40 }
    }
    const css = extractAllStyles(node)
    expect(css.display).toBe('flex')
    expect(css.flexDirection).toBe('row')
    expect(css.gap).toBe('12px')
    expect(css.alignItems).toBe('flex-end')
    expect(css.padding).toBe('4px 10px 4px 10px')
  })
})
