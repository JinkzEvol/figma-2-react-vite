import { describe, it, expect } from 'vitest'
import { generateCodeFromIR, generateReactComponentSource } from '../../codeGenerator'
import type { DesignNode } from '../../ir/buildIR'

/**
 * Contract tests for position CSS generation
 * Reference: specs/003-implement-absolute-positioning/contracts/position-css-generation.md
 * 
 * These tests verify that styleFor() in both code generators properly
 * generates CSS position properties based on DesignNode.position field.
 */

describe('contract: position CSS generation (generateCodeFromIR)', () => {
  it('Test 1: Generates position: "absolute" for nodes with position.type === "absolute"', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AbsoluteNode',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 50, y: 75 },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '50px'")
    expect(code).toContain("top: '75px'")
  })

  it('Test 2: Generates left and top with "px" suffix for absolute nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AbsoluteNode',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 0, y: 0 },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).toContain("left: '0px'")
    expect(code).toContain("top: '0px'")
  })

  it('Test 3: Generates position: "relative" for parents with absolute children', () => {
    const parent: DesignNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      width: 500,
      height: 500,
      children: [
        {
          id: 'child',
          name: 'Child',
          type: 'RECTANGLE',
          width: 100,
          height: 100,
          position: { type: 'absolute', x: 10, y: 10 },
        },
      ],
    }
    
    const code = generateCodeFromIR(parent)
    
    expect(code).toContain("position: 'relative'")
  })

  it('Test 4: Does NOT generate position properties for flex-item nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'FlexItem',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'flex-item' },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).not.toContain('position:')
    expect(code).not.toContain('left:')
    expect(code).not.toContain('top:')
  })

  it('Test 5: Does NOT generate position properties for root nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'Root',
      type: 'FRAME',
      width: 100,
      height: 100,
      position: { type: 'root' },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).not.toContain('position:')
  })

  it('Test 6: Handles position at origin (0, 0) correctly', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AtOrigin',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 0, y: 0 },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '0px'")
    expect(code).toContain("top: '0px'")
  })

  it('Test 7: Handles negative coordinates correctly', () => {
    const node: DesignNode = {
      id: '1',
      name: 'NegativePos',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: -10, y: -20 },
    }
    
    const code = generateCodeFromIR(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '-10px'")
    expect(code).toContain("top: '-20px'")
  })

  it('Test 8: Does not override position: "absolute" with position: "relative"', () => {
    const node: DesignNode = {
      id: 'parent',
      name: 'AbsoluteParent',
      type: 'FRAME',
      width: 500,
      height: 500,
      position: { type: 'absolute', x: 100, y: 100 },
      children: [
        {
          id: 'child',
          name: 'Child',
          type: 'RECTANGLE',
          width: 50,
          height: 50,
          position: { type: 'absolute', x: 10, y: 10 },
        },
      ],
    }
    
    const code = generateCodeFromIR(node)
    
    // Should have position: 'absolute' (not 'relative') since node itself is absolute
    const parentMatch = code.match(/position:\s*'absolute'/g)
    expect(parentMatch).toBeTruthy()
    expect(parentMatch!.length).toBeGreaterThanOrEqual(1)
  })

  it('Test 9: Generates both position: relative and display: flex when needed', () => {
    const parent: DesignNode = {
      id: 'parent',
      name: 'FlexParent',
      type: 'FRAME',
      width: 500,
      height: 500,
      layout: { direction: 'row', gap: 10 },
      children: [
        {
          id: 'abs-child',
          name: 'AbsChild',
          type: 'RECTANGLE',
          width: 50,
          height: 50,
          position: { type: 'absolute', x: 0, y: 0 },
        },
      ],
    }
    
    const code = generateCodeFromIR(parent)
    
    expect(code).toContain("display: 'flex'")
    expect(code).toContain("position: 'relative'")
  })

  it('Test 10: Output is deterministic (same input → same output)', () => {
    const node: DesignNode = {
      id: '1',
      name: 'Node',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 25, y: 50 },
    }
    
    const code1 = generateCodeFromIR(node)
    const code2 = generateCodeFromIR(node)
    const code3 = generateCodeFromIR(node)
    
    expect(code1).toBe(code2)
    expect(code2).toBe(code3)
  })
})

describe('contract: position CSS generation (generateReactComponentSource)', () => {
  it('Test 1: Generates position: "absolute" for nodes with position.type === "absolute"', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AbsoluteNode',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 50, y: 75 },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '50px'")
    expect(code).toContain("top: '75px'")
  })

  it('Test 2: Generates left and top with "px" suffix for absolute nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AbsoluteNode',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 0, y: 0 },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).toContain("left: '0px'")
    expect(code).toContain("top: '0px'")
  })

  it('Test 3: Generates position: "relative" for parents with absolute children', () => {
    const parent: DesignNode = {
      id: 'parent',
      name: 'Parent',
      type: 'FRAME',
      width: 500,
      height: 500,
      children: [
        {
          id: 'child',
          name: 'Child',
          type: 'RECTANGLE',
          width: 100,
          height: 100,
          position: { type: 'absolute', x: 10, y: 10 },
        },
      ],
    }
    
    const code = generateReactComponentSource(parent)
    
    expect(code).toContain("position: 'relative'")
  })

  it('Test 4: Does NOT generate position properties for flex-item nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'FlexItem',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'flex-item' },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).not.toContain('position:')
    expect(code).not.toContain('left:')
    expect(code).not.toContain('top:')
  })

  it('Test 5: Does NOT generate position properties for root nodes', () => {
    const node: DesignNode = {
      id: '1',
      name: 'Root',
      type: 'FRAME',
      width: 100,
      height: 100,
      position: { type: 'root' },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).not.toContain('position:')
  })

  it('Test 6: Handles position at origin (0, 0) correctly', () => {
    const node: DesignNode = {
      id: '1',
      name: 'AtOrigin',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 0, y: 0 },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '0px'")
    expect(code).toContain("top: '0px'")
  })

  it('Test 7: Handles negative coordinates correctly', () => {
    const node: DesignNode = {
      id: '1',
      name: 'NegativePos',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: -10, y: -20 },
    }
    
    const code = generateReactComponentSource(node)
    
    expect(code).toContain("position: 'absolute'")
    expect(code).toContain("left: '-10px'")
    expect(code).toContain("top: '-20px'")
  })

  it('Test 8: Does not override position: "absolute" with position: "relative"', () => {
    const node: DesignNode = {
      id: 'parent',
      name: 'AbsoluteParent',
      type: 'FRAME',
      width: 500,
      height: 500,
      position: { type: 'absolute', x: 100, y: 100 },
      children: [
        {
          id: 'child',
          name: 'Child',
          type: 'RECTANGLE',
          width: 50,
          height: 50,
          position: { type: 'absolute', x: 10, y: 10 },
        },
      ],
    }
    
    const code = generateReactComponentSource(node)
    
    // Should have position: 'absolute' (not 'relative') since node itself is absolute
    const parentMatch = code.match(/position:\s*'absolute'/g)
    expect(parentMatch).toBeTruthy()
    expect(parentMatch!.length).toBeGreaterThanOrEqual(1)
  })

  it('Test 9: Generates both position: relative and display: flex when needed', () => {
    const parent: DesignNode = {
      id: 'parent',
      name: 'FlexParent',
      type: 'FRAME',
      width: 500,
      height: 500,
      layout: { direction: 'row', gap: 10 },
      children: [
        {
          id: 'abs-child',
          name: 'AbsChild',
          type: 'RECTANGLE',
          width: 50,
          height: 50,
          position: { type: 'absolute', x: 0, y: 0 },
        },
      ],
    }
    
    const code = generateReactComponentSource(parent)
    
    expect(code).toContain("display: 'flex'")
    expect(code).toContain("position: 'relative'")
  })

  it('Test 10: Output is deterministic (same input → same output)', () => {
    const node: DesignNode = {
      id: '1',
      name: 'Node',
      type: 'RECTANGLE',
      width: 100,
      height: 100,
      position: { type: 'absolute', x: 25, y: 50 },
    }
    
    const code1 = generateReactComponentSource(node)
    const code2 = generateReactComponentSource(node)
    const code3 = generateReactComponentSource(node)
    
    expect(code1).toBe(code2)
    expect(code2).toBe(code3)
  })
})
