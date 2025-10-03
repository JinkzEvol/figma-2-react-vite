import { describe, it, expect } from 'vitest'
import { buildIR } from '../../ir/buildIR'
import { generateCodeFromIR, generateReactComponentSource } from '../../codeGenerator'
import type { FigmaNode } from '../../types'

/**
 * Integration test for end-to-end positioning
 * Reference: tasks.md T013
 * 
 * Tests the complete pipeline: FigmaNode -> buildIR -> generateCode
 * Verifies that positioning information flows through correctly
 */

describe('integration: end-to-end positioning', () => {
  it('T013: Processes layoutMode: NONE design with absolute positioning', () => {
    // Create a Figma design with manual positioning (layoutMode: NONE)
    const figmaDesign: FigmaNode = {
      id: 'root',
      name: 'Container',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 600 },
      children: [
        {
          id: 'header',
          name: 'Header',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 80 },
          fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.3, b: 0.8, a: 1 } }],
        },
        {
          id: 'sidebar',
          name: 'Sidebar',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 80, width: 200, height: 520 },
          fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9, a: 1 } }],
        },
        {
          id: 'content',
          name: 'Content',
          type: 'FRAME',
          absoluteBoundingBox: { x: 200, y: 80, width: 600, height: 520 },
          fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 } }],
        },
      ],
    }

    // Step 1: Build IR
    const ir = buildIR(figmaDesign)
    
    expect(ir).toBeTruthy()
    expect(ir?.position).toEqual({ type: 'root' })
    expect(ir?.children).toHaveLength(3)
    
    // Verify children have absolute positioning
    expect(ir?.children?.[0].position).toEqual({ type: 'absolute', x: 0, y: 0 })
    expect(ir?.children?.[1].position).toEqual({ type: 'absolute', x: 0, y: 80 })
    expect(ir?.children?.[2].position).toEqual({ type: 'absolute', x: 200, y: 80 })

    // Step 2: Generate code from IR
    const codeFromIR = generateCodeFromIR(ir!)
    
    // Verify generated code includes position properties
    expect(codeFromIR).toContain("position: 'relative'") // Parent has absolute children
    expect(codeFromIR).toContain("position: 'absolute'") // Children are absolute
    expect(codeFromIR).toContain("left: '0px'")
    expect(codeFromIR).toContain("top: '0px'")
    expect(codeFromIR).toContain("left: '200px'")
    expect(codeFromIR).toContain("top: '80px'")

    // Step 3: Generate React component source
    const reactCode = generateReactComponentSource(ir!)
    
    // Verify React code includes position properties
    expect(reactCode).toContain("position: 'relative'")
    expect(reactCode).toContain("position: 'absolute'")
    expect(reactCode).toContain("left: '0px'")
    expect(reactCode).toContain("top: '80px'")
  })

  it('Handles nested absolute positioning correctly', () => {
    const figmaDesign: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
      children: [
        {
          id: 'parent',
          name: 'Parent',
          type: 'FRAME',
          layoutMode: 'NONE',
          absoluteBoundingBox: { x: 50, y: 50, width: 400, height: 400 },
          children: [
            {
              id: 'child',
              name: 'Child',
              type: 'RECTANGLE',
              absoluteBoundingBox: { x: 100, y: 100, width: 100, height: 100 },
            },
          ],
        },
      ],
    }

    const ir = buildIR(figmaDesign)
    
    // Root has absolute child at (50, 50)
    expect(ir?.children?.[0].position).toEqual({ type: 'absolute', x: 50, y: 50 })
    
    // Parent has absolute child at (50, 50) relative to parent (which is at 50, 50)
    expect(ir?.children?.[0].children?.[0].position).toEqual({ type: 'absolute', x: 50, y: 50 })

    const code = generateCodeFromIR(ir!)
    
    // Root should have position: relative (has absolute child)
    // Parent should also have position: relative (has absolute child)
    expect(code).toContain("position: 'relative'")
    expect(code).toContain("position: 'absolute'")
  })

  it('Handles mixed auto-layout and absolute positioning', () => {
    const figmaDesign: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'VERTICAL',
      absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 500 },
      itemSpacing: 10,
      children: [
        {
          id: 'flex-child-1',
          name: 'FlexChild1',
          type: 'FRAME',
          absoluteBoundingBox: { x: 0, y: 0, width: 500, height: 100 },
        },
        {
          id: 'flex-child-2',
          name: 'FlexChild2',
          type: 'FRAME',
          layoutMode: 'NONE',
          absoluteBoundingBox: { x: 0, y: 110, width: 500, height: 200 },
          children: [
            {
              id: 'abs-grandchild',
              name: 'AbsGrandchild',
              type: 'RECTANGLE',
              absoluteBoundingBox: { x: 20, y: 130, width: 50, height: 50 },
            },
          ],
        },
      ],
    }

    const ir = buildIR(figmaDesign)
    
    // Root is vertical flex
    expect(ir?.layout?.direction).toBe('column')
    
    // First child is flex-item
    expect(ir?.children?.[0].position?.type).toBe('flex-item')
    
    // Second child is also flex-item (parent has VERTICAL layout)
    expect(ir?.children?.[1].position?.type).toBe('flex-item')
    
    // But the grandchild under second child should be absolute
    expect(ir?.children?.[1].children?.[0].position).toEqual({ type: 'absolute', x: 20, y: 20 })

    const code = generateCodeFromIR(ir!)
    
    // Root should have display: flex
    expect(code).toContain("display: 'flex'")
    
    // Second child should have position: relative (it has absolute child)
    expect(code).toContain("position: 'relative'")
    
    // Grandchild should be absolute
    expect(code).toContain("position: 'absolute'")
  })

  it('Generates valid CSS for zero-position absolute elements', () => {
    const figmaDesign: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 100, y: 100, width: 500, height: 500 },
      children: [
        {
          id: 'child-at-origin',
          name: 'ChildAtOrigin',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 100, y: 100, width: 50, height: 50 },
        },
      ],
    }

    const ir = buildIR(figmaDesign)
    
    expect(ir?.children?.[0].position).toEqual({ type: 'absolute', x: 0, y: 0 })

    const code = generateCodeFromIR(ir!)
    
    // Should generate left: 0px and top: 0px (not omit them)
    expect(code).toContain("left: '0px'")
    expect(code).toContain("top: '0px'")
  })

  it('Preserves deterministic output with positioning', () => {
    const figmaDesign: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 300, height: 300 },
      children: [
        {
          id: 'child',
          name: 'Child',
          type: 'RECTANGLE',
          absoluteBoundingBox: { x: 50, y: 75, width: 100, height: 100 },
        },
      ],
    }

    const ir1 = buildIR(figmaDesign)
    const ir2 = buildIR(figmaDesign)
    const ir3 = buildIR(figmaDesign)
    
    expect(JSON.stringify(ir1)).toBe(JSON.stringify(ir2))
    expect(JSON.stringify(ir2)).toBe(JSON.stringify(ir3))

    const code1 = generateCodeFromIR(ir1!)
    const code2 = generateCodeFromIR(ir2!)
    const code3 = generateCodeFromIR(ir3!)
    
    expect(code1).toBe(code2)
    expect(code2).toBe(code3)
  })
})
