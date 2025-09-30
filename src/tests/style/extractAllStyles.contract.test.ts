import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T007 Contract test referencing contracts/style-extraction-contract.md
// Ensures required CSS fields appear when applicable.

describe('contract: extractAllStyles', () => {
  it('maps auto-layout + fills + text + effects into css object', () => {
    const node: FigmaNode = {
      id: 'n1', name: 'frame', type: 'FRAME',
      layoutMode: 'HORIZONTAL', itemSpacing: 8,
      primaryAxisAlignItems: 'SPACE_BETWEEN', counterAxisAlignItems: 'CENTER',
      paddingTop: 4, paddingRight: 6, paddingBottom: 4, paddingLeft: 6,
      absoluteBoundingBox: { x:0, y:0, width: 120, height: 40 },
      fills: [{ type: 'SOLID', color: { r: 0.2, g:0.4, b:0.6, a: 0.753 } }],
      strokes: [{ type: 'SOLID', color: { r:0, g:0, b:0, a:1 } }], strokeWeight: 2,
      rectangleCornerRadii: [2,3,4,5],
      children: [
        { id:'t1', name:'label', type:'TEXT', characters:'Hello',
          style: { fontFamily:'Inter', fontSize:14, fontWeight:500, textAlignHorizontal:'CENTER', letterSpacing:0.5, lineHeightPx:16 },
          fills:[{ type:'SOLID', color:{ r:0, g:0, b:0, a:1 } }],
          absoluteBoundingBox: { x:0, y:0, width: 60, height: 16 }
        }
      ],
      effects: [
        { type: 'DROP_SHADOW', radius: 4, offset:{ x:1, y:2 }, color:{ r:0, g:0, b:0, a:0.25 } },
        { type: 'LAYER_BLUR', radius: 3 }
      ]
    }

    const css = extractAllStyles(node)
    // Required fields assertions (placeholder failing expectation to satisfy TDD initial red)
    expect(css.display).toBe('flex')
    expect(css.flexDirection).toBe('row')
    expect(css.justifyContent).toBe('space-between')
    expect(css.alignItems).toBe('center')
    expect(css.gap).toBe('8px')
    expect(css.padding).toBe('4px 6px 4px 6px')
    expect(css.width).toBe('120px')
    expect(css.height).toBe('40px')
    expect(css.background).toBe('rgba(51, 102, 153, 0.753)') // ensures alpha rounding
    expect(css.border).toBe('2px solid rgb(0, 0, 0)')
    expect(css.borderRadius).toBe('2px 3px 4px 5px')
    expect(css.boxShadow).toContain('1px 2px 4px 0 rgba(0, 0, 0, 0.25)')
    expect(css.filter).toContain('blur(3px)')
  })
})
