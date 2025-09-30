import { describe, it, expect } from 'vitest'
import { measure } from '../performance/harness'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

function bigTree(count: number): FigmaNode {
  const children: FigmaNode[] = []
  for (let i=0;i<count;i++) {
    children.push({ id:'n'+i, name:'Node'+i, type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:10,height:10 }, fills:[{ type:'SOLID', color:{ r:0.1,g:0.2,b:0.3,a:1 } }] })
  }
  return { id:'root', name:'Root', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:2, absoluteBoundingBox:{ x:0,y:0,width:500,height:500 }, children }
}

describe('integration: performance baseline', () => {
  it('processes 5000 nodes (timing measured, no assertion yet)', async () => {
    const tree = bigTree(5000)
    let result: any
    const perf = await measure('buildIR-5000', () => {
      try { result = buildIR(tree) } catch { result = null }
    })
    expect(result).toBeTruthy()
    // Force eventual failure by expecting sub-5000ms early (likely not met until optimized)
    expect(perf.durationMs).toBeLessThan(5000)
  })
})
