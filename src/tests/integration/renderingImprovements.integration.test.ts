import { describe, it, expect } from 'vitest'
import { buildIR } from '../../ir/buildIR'
import { generateReactComponentSource, generateCodeFromIR } from '../../codeGenerator'
import type { FigmaNode } from '../../types'

// Integration test for v2 rendering improvements
describe('Rendering Fidelity Improvements v2', () => {
  it('renders text with color, shadows, and complete styling', () => {
    const node: FigmaNode = {
      id: 'test-1',
      name: 'Styled Text',
      type: 'TEXT',
      characters: 'Hello Figma',
      visible: true,
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 40 },
      fills: [
        {
          type: 'SOLID',
          color: { r: 0.2, g: 0.4, b: 0.8, a: 1 },
          visible: true
        }
      ],
      style: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 600,
        lineHeightPx: 24,
        letterSpacing: 0.5,
        textAlignHorizontal: 'CENTER'
      },
      effects: [
        {
          type: 'DROP_SHADOW',
          visible: true,
          offset: { x: 2, y: 4 },
          radius: 8,
          color: { r: 0, g: 0, b: 0, a: 0.25 }
        },
        {
          type: 'INNER_SHADOW',
          visible: true,
          offset: { x: 0, y: 1 },
          radius: 2,
          color: { r: 1, g: 1, b: 1, a: 0.5 }
        }
      ]
    }

    const ir = buildIR(node)
    expect(ir).toBeTruthy()
    
    // Verify IR captures all properties
    expect(ir!.text?.color).toContain('rgba(51, 102, 204')
    expect(ir!.text?.lineHeight).toBe(24)
    expect(ir!.text?.letterSpacing).toBe(0.5)
    expect(ir!.text?.textAlign).toBe('center')
    expect(ir!.effects?.shadows).toHaveLength(2)
    
    // Verify generateReactComponentSource renders all improvements
    const component = generateReactComponentSource(ir!)
    expect(component).toContain('color: ')
    expect(component).toContain('rgba(51, 102, 204')
    expect(component).toContain('box-shadow: ')
    expect(component).toContain('2px 4px 8px 0')
    expect(component).toContain('inset 0px 1px 2px 0')
    expect(component).toContain('line-height: ')
    expect(component).toContain('letter-spacing: ')
    expect(component).toContain('text-align: ')
    
    // Verify generateCodeFromIR also renders all improvements
    const code = generateCodeFromIR(ir!)
    expect(code).toContain('color: ')
    expect(code).toContain('box-shadow: ')  // CSS format uses kebab-case
    expect(code).toContain('line-height: ')
    expect(code).toContain('letter-spacing: ')
    expect(code).toContain('text-align: ')
  })
})
