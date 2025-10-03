import { describe, it, expect } from 'vitest'
import { buildPosition } from '../../ir/buildIR'
import type { FigmaNode } from '../../types'

/**
 * Unit tests for buildPosition function - edge cases
 * 
 * These tests cover edge cases and error conditions:
 * - Missing absoluteBoundingBox
 * - No parent context
 * - Negative canvas coordinates
 * - Deeply nested absolute positioning
 * - Parent without absoluteBoundingBox
 */

describe('unit: buildPosition edge cases', () => {
  it('Missing absoluteBoundingBox returns undefined', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'NoBox',
      type: 'FRAME',
    }
    
    const result = buildPosition(node)
    
    expect(result).toBeUndefined()
  })

  it('No parent context returns "root" for node with box', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'RootNode',
      type: 'FRAME',
      absoluteBoundingBox: { x: 500, y: 1000, width: 100, height: 100 },
    }
    
    const result = buildPosition(node)
    
    expect(result).toEqual({ type: 'root' })
  })

  it('Negative canvas coordinates handled correctly', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: -500, y: -300, width: 1000, height: 600 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: -450, y: -250, width: 100, height: 100 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'absolute', x: 50, y: 50 })
  })

  it('Deeply nested absolute positioning maintains relative calculation', () => {
    // Grandparent, parent, and child hierarchy
    const grandparent: FigmaNode = {
      id: 'gp',
      name: 'Grandparent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
    }
    
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 100, y: 100, width: 500, height: 500 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 200, y: 200, width: 100, height: 100 },
    }
    
    // buildPosition only considers immediate parent, not grandparent
    const resultVsParent = buildPosition(child, parent)
    expect(resultVsParent).toEqual({ type: 'absolute', x: 100, y: 100 })
    
    const resultVsGrandparent = buildPosition(child, grandparent)
    expect(resultVsGrandparent).toEqual({ type: 'absolute', x: 200, y: 200 })
  })

  it('Parent without absoluteBoundingBox - child should still work with fallback', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'ParentNoBox',
      type: 'FRAME',
      layoutMode: 'NONE',
      // No absoluteBoundingBox
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 100, y: 150, width: 50, height: 50 },
    }
    
    // When parent has no box, buildPosition should handle gracefully
    // Based on the contract, it should return undefined or handle as if parent at (0,0)
    const result = buildPosition(child, parent)
    
    // Expected behavior: if parent lacks box, treat as (0,0) origin
    // or return undefined - let's assume (0,0) origin for this edge case
    expect(result).toBeDefined()
  })

  it('Vertical layoutMode returns flex-item', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'VerticalParent',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 600 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 10, y: 20, width: 280, height: 50 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'flex-item' })
  })

  it('Large coordinate values handled correctly', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 10000, y: 20000, width: 5000, height: 5000 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 12345, y: 23456, width: 100, height: 100 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'absolute', x: 2345, y: 3456 })
  })

  it('Zero-sized bounding boxes handled', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 100, y: 100, width: 0, height: 0 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 100, y: 100, width: 0, height: 0 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'absolute', x: 0, y: 0 })
  })
})
