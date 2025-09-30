import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'

// T023 Integration: text styling + wrapping + opacity interplay

declare function buildIR(root: FigmaNode): any
declare function generateCodeFromIR(ir: any): string

describe('integration: text fidelity + wrapping + opacity', () => {
  it('produces code including wrapped text with opacity styling', () => {
    const doc: FigmaNode = {
      id:'txtroot', name:'Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:8,
      absoluteBoundingBox:{ x:0,y:0,width:300,height:200 },
      children:[{
        id:'txt', name:'Paragraph', type:'TEXT',
        absoluteBoundingBox:{ x:0,y:0,width:200,height:60 },
        characters:'Some long paragraph that should wrap across lines for fidelity testing',
        opacity:0.7534,
        style:{ fontFamily:'Inter', fontSize:14, lineHeightPx:18, textAlignHorizontal:'LEFT' },
        fills:[{ type:'SOLID', color:{ r:0,g:0,b:0,a:1 } }]
      }]
    }
    let ir: any; try { ir = buildIR(doc) } catch { ir = {} }
    let code = ''
    try { code = generateCodeFromIR(ir) } catch { code = '' }
    expect(code).toContain('Some long paragraph')
    expect(code).toMatch(/opacity:\s*0.753/) // requires opacity rounding
    expect(code.toLowerCase()).toContain('white-space')
  })
})
