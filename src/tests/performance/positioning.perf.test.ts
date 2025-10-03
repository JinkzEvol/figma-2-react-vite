import { describe, it, expect } from 'vitest'
import { buildIR } from '../../ir/buildIR'
import type { FigmaNode } from '../../types'

/**
 * Performance test for positioning with large node counts
 * Reference: tasks.md T016
 * 
 * Validates that buildIR can process 5,000 nodes with positioning
 * within the performance budget of 5.0 seconds
 */

describe('performance: positioning with large node trees', () => {
  function generateLargeTree(nodeCount: number): FigmaNode {
    const root: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 10000, height: 10000 },
      children: [],
    }

    // Generate a balanced tree structure
    // Calculate depth to fit nodeCount nodes
    const childrenPerNode = 5
    const depth = Math.ceil(Math.log(nodeCount) / Math.log(childrenPerNode))
    
    function generateLevel(parent: FigmaNode, currentDepth: number, nodesGenerated: number): number {
      if (currentDepth >= depth || nodesGenerated >= nodeCount) {
        return nodesGenerated
      }

      const parentX = parent.absoluteBoundingBox?.x ?? 0
      const parentY = parent.absoluteBoundingBox?.y ?? 0
      const parentWidth = parent.absoluteBoundingBox?.width ?? 1000
      const parentHeight = parent.absoluteBoundingBox?.height ?? 1000

      for (let i = 0; i < childrenPerNode && nodesGenerated < nodeCount; i++) {
        const x = parentX + (i * parentWidth / childrenPerNode)
        const y = parentY + (currentDepth * 100)
        const width = parentWidth / childrenPerNode - 10
        const height = 80

        const child: FigmaNode = {
          id: `node-${nodesGenerated}`,
          name: `Node${nodesGenerated}`,
          type: i % 3 === 0 ? 'TEXT' : 'RECTANGLE',
          absoluteBoundingBox: { x, y, width, height },
          children: [],
        }

        // Add text content for TEXT nodes
        if (child.type === 'TEXT') {
          child.characters = `Text node ${nodesGenerated}`
        }

        // Mix of layoutModes
        if (i % 2 === 0 && currentDepth < depth - 1) {
          child.layoutMode = 'NONE' // Will have absolute children
        } else if (i % 3 === 0) {
          child.layoutMode = 'HORIZONTAL' // Will have flex children
        }

        parent.children!.push(child)
        nodesGenerated++

        // Recurse to create children
        if (currentDepth < depth - 1 && nodesGenerated < nodeCount) {
          nodesGenerated = generateLevel(child, currentDepth + 1, nodesGenerated)
        }
      }

      return nodesGenerated
    }

    generateLevel(root, 0, 1) // Start with 1 (root already exists)
    return root
  }

  function countNodes(node: FigmaNode | null): number {
    if (!node) return 0
    let count = 1
    if (node.children) {
      for (const child of node.children) {
        count += countNodes(child)
      }
    }
    return count
  }

  it('T016: Processes 5,000 nodes with positioning in < 5.0 seconds', () => {
    // Generate fixture
    const largeTree = generateLargeTree(5000)
    const nodeCount = countNodes(largeTree)
    
    console.log(`Generated tree with ${nodeCount} nodes`)
    expect(nodeCount).toBeGreaterThanOrEqual(4000) // Allow some tolerance
    expect(nodeCount).toBeLessThanOrEqual(6000)

    // Measure buildIR performance
    const startTime = performance.now()
    const ir = buildIR(largeTree)
    const endTime = performance.now()
    
    const duration = endTime - startTime
    const durationSeconds = duration / 1000
    
    console.log(`buildIR processed ${nodeCount} nodes in ${durationSeconds.toFixed(3)}s`)

    // Verify IR was built successfully
    expect(ir).toBeTruthy()
    expect(ir?.children).toBeTruthy()
    
    // Verify positioning information exists
    expect(ir?.position).toBeTruthy()
    expect(ir?.position?.type).toBe('root')

    // Performance assertion: < 5.0 seconds (Constitution Principle #4)
    expect(durationSeconds).toBeLessThan(5.0)
    
    // Additional check: reasonable throughput (> 1000 nodes/second)
    const throughput = nodeCount / durationSeconds
    console.log(`Throughput: ${throughput.toFixed(0)} nodes/second`)
    expect(throughput).toBeGreaterThan(1000)
  })

  it('Performance scales linearly with node count', () => {
    const sizes = [100, 500, 1000]
    const times: number[] = []

    for (const size of sizes) {
      const tree = generateLargeTree(size)
      
      const start = performance.now()
      buildIR(tree)
      const end = performance.now()
      
      times.push(end - start)
    }

    console.log('Processing times:', times.map(t => `${t.toFixed(1)}ms`).join(', '))

    // Verify times increase reasonably (not exponentially)
    // Time for 1000 nodes should be < 15x time for 100 nodes
    const ratio = times[2] / times[0]
    console.log(`Scaling ratio (1000/100): ${ratio.toFixed(1)}x`)
    expect(ratio).toBeLessThan(15)
  })

  it('Handles deeply nested absolute positioning without stack overflow', () => {
    // Create a deeply nested chain (100 levels deep)
    let current: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'NONE',
      absoluteBoundingBox: { x: 0, y: 0, width: 1000, height: 1000 },
      children: [],
    }

    const root = current

    for (let i = 1; i <= 100; i++) {
      const child: FigmaNode = {
        id: `level-${i}`,
        name: `Level${i}`,
        type: 'FRAME',
        layoutMode: 'NONE',
        absoluteBoundingBox: { x: i * 10, y: i * 10, width: 1000 - i * 10, height: 1000 - i * 10 },
        children: [],
      }
      current.children!.push(child)
      current = child
    }

    // Should not throw stack overflow
    const start = performance.now()
    const ir = buildIR(root)
    const end = performance.now()

    expect(ir).toBeTruthy()
    console.log(`Processed 100-level deep tree in ${(end - start).toFixed(1)}ms`)
    
    // Verify positioning at various depths
    let node = ir
    for (let i = 0; i < 10; i++) {
      if (i === 0) {
        expect(node?.position?.type).toBe('root')
      } else {
        expect(node?.position?.type).toBe('absolute')
      }
      node = node?.children?.[0]!
    }
  })

  it('Positioning calculation is efficient (no redundant work)', () => {
    // Create tree with mixed positioning
    const mixedTree: FigmaNode = {
      id: 'root',
      name: 'Root',
      type: 'FRAME',
      layoutMode: 'VERTICAL', // Flex layout
      absoluteBoundingBox: { x: 0, y: 0, width: 1000, height: 5000 },
      itemSpacing: 10,
      children: [],
    }

    // Add 1000 flex items
    for (let i = 0; i < 1000; i++) {
      mixedTree.children!.push({
        id: `flex-${i}`,
        name: `FlexItem${i}`,
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: i * 50, width: 1000, height: 40 },
      })
    }

    const start = performance.now()
    const ir = buildIR(mixedTree)
    const end = performance.now()

    const duration = end - start
    console.log(`Processed 1000 flex items in ${duration.toFixed(1)}ms`)

    // Should be very fast for flex items (no coordinate calculation)
    expect(duration).toBeLessThan(500) // 0.5 seconds for 1000 nodes
    
    // Verify all children are flex-item
    expect(ir?.children?.every(c => c.position?.type === 'flex-item')).toBe(true)
  })
})
