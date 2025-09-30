import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'

// T011 Image placeholder unit test (future placeholder logic)
// We reference a future function to derive placeholder styles.

declare function buildImagePlaceholder(node: FigmaNode): { role: string; ariaLabel: string; style: Record<string,string> }

describe('image placeholder', () => {
  it('produces mid-gray background and role img', () => {
    const node: FigmaNode = { id:'img1', name:'Image', type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:64,height:64 }, fills:[{ type:'IMAGE', imageRef:'abc' }]} as any
    let placeholder: any
    try { placeholder = buildImagePlaceholder(node) } catch { placeholder = {} }
    expect(placeholder.role).toBe('img')
    expect(placeholder.ariaLabel).toMatch(/placeholder/i)
    expect(placeholder.style?.background).toMatch(/#ccc|rgb/)
  })
})
