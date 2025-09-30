import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T019 No-fill negative case unit test (FR-008)

describe('no fill background', () => {
  it('emits no background style when fills array present but empty (no fallback to backgroundColor)', () => {
    const node: FigmaNode = {
      id:'nf1', name:'EmptyFill', type:'FRAME',
      absoluteBoundingBox:{ x:0,y:0,width:20,height:20 },
      fills: [],
      backgroundColor:{ r:1,g:0,b:0,a:1 }
    }
    const css = extractAllStyles(node)
    expect(css.background).toBeUndefined()
  })
})

