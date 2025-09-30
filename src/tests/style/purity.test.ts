import { describe, it, expect } from 'vitest'
import { extractAllStyles } from '../../styleExtractors'
import type { FigmaNode } from '../../types'

// T005 Purity test: ensure extractAllStyles produces output purely from input node
// and does not mutate input or access DOM / global side effects (heuristic checks).

describe('extractAllStyles purity', () => {
  it('does not mutate input node object', () => {
    const node: FigmaNode = {
      id: '1', name: 'rect', type: 'RECTANGLE',
      absoluteBoundingBox: { x:0, y:0, width:100, height:50 },
      fills: [{ type: 'SOLID', color: { r:1, g:0, b:0, a:1 } }],
    }
    const clone = structuredClone(node)
    const css = extractAllStyles(node)
    expect(css).toBeTruthy()
    expect(node).toEqual(clone) // mutation would fail equality
  })

  it('output depends only on provided node (no Date/Math randomness check)', () => {
    const node: FigmaNode = {
      id: '2', name: 'text', type: 'TEXT',
      absoluteBoundingBox: { x:0, y:0, width:80, height:20 },
      style: { fontFamily: 'Inter', fontSize: 12 },
      fills: [{ type: 'SOLID', color: { r:0, g:0, b:0, a:1 } }],
    }
    const a = extractAllStyles(node)
    const b = extractAllStyles(structuredClone(node))
    expect(a).toEqual(b)
  })
})
