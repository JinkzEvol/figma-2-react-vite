import { describe, it, expect } from 'vitest'
import { buildPosition } from '../../ir/buildIR'
import type { FigmaNode } from '../../types'

/**
 * Contract tests for buildPosition function
 * Reference: specs/003-implement-absolute-positioning/contracts/position-ir-building.md
 * 
 * These tests define the expected behavior of buildPosition:
 * - Returns 'root' for nodes without parent
 * - Returns 'absolute' with x,y for layoutMode: NONE
 * - Returns 'flex-item' for children of auto-layout parents
 * - Returns undefined for nodes without absoluteBoundingBox
 * - Calculates relative coordinates correctly
 */

describe('contract: buildPosition', () => {
  it('Test 1: Returns "root" for nodes without parent', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'Root',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    }
    
    const result = buildPosition(node)
    
    expect(result).toEqual({ type: 'root' })
  })

  it('Test 2: Returns "absolute" with correct x,y for layoutMode: NONE', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 100, y: 200, width: 500, height: 500 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 150, y: 250, width: 100, height: 100 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'absolute', x: 50, y: 50 })
  })

  it('Test 3: Returns "flex-item" for children of auto-layout parents', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'HORIZONTAL',
      absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 100 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 10, y: 10, width: 50, height: 50 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'flex-item' })
  })

  it('Test 4: Returns undefined for nodes without absoluteBoundingBox', () => {
    const node: FigmaNode = {
      id: '1',
      name: 'NoBox',
      type: 'FRAME',
    }
    
    const result = buildPosition(node)
    
    expect(result).toBeUndefined()
  })

  it('Test 5: Calculates relative coordinates correctly (positive and negative)', () => {
    // Positive offset
    const parent1: FigmaNode = {
      id: 'p1',
      name: 'Parent1',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
    }
    const child1: FigmaNode = {
      id: 'c1',
      name: 'Child1',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 100, y: 150, width: 50, height: 50 },
    }
    
    const result1 = buildPosition(child1, parent1)
    expect(result1).toEqual({ type: 'absolute', x: 100, y: 150 })
    
    // Negative offset (child positioned before parent's origin - edge case)
    const parent2: FigmaNode = {
      id: 'p2',
      name: 'Parent2',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 200, y: 200, width: 500, height: 500 },
    }
    const child2: FigmaNode = {
      id: 'c2',
      name: 'Child2',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 150, y: 180, width: 50, height: 50 },
    }
    
    const result2 = buildPosition(child2, parent2)
    expect(result2).toEqual({ type: 'absolute', x: -50, y: -20 })
  })

  it('Test 6: Handles edge case: parent and child at same position (x=0, y=0)', () => {
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
      absoluteBoundingBox: { x: 100, y: 100, width: 50, height: 50 },
    }
    
    const result = buildPosition(child, parent)
    
    expect(result).toEqual({ type: 'absolute', x: 0, y: 0 })
  })

  it('Test 7: Does not mutate input parameters', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 10, y: 10, width: 50, height: 50 },
    }
    
    const parentCopy = JSON.parse(JSON.stringify(parent))
    const childCopy = JSON.parse(JSON.stringify(child))
    
    buildPosition(child, parent)
    
    expect(parent).toEqual(parentCopy)
    expect(child).toEqual(childCopy)
  })

  it('Test 8: Is deterministic (multiple calls with same input → same output)', () => {
    const parent: FigmaNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 50, y: 75, width: 500, height: 500 },
    }
    
    const child: FigmaNode = {
      id: 'child',
      name: 'Child',
      type: 'RECTANGLE',
      absoluteBoundingBox: { x: 100, y: 100, width: 50, height: 50 },
    }
    
    const result1 = buildPosition(child, parent)
    const result2 = buildPosition(child, parent)
    const result3 = buildPosition(child, parent)
    
    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
  })
})
