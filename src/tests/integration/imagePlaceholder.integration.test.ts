import { describe, it, expect } from 'vitest'
import type { FigmaNode } from '../../types'
import { buildIR } from '../../ir'

describe('integration: image placeholder', () => {
  it('provides placeholder metadata for image fills when image exporting not implemented', () => {
    const root: FigmaNode = {
      id:'imgroot', name:'Images', type:'FRAME', layoutMode:'VERTICAL', itemSpacing:4,
      absoluteBoundingBox:{ x:0,y:0,width:120,height:120 },
      children:[{
        id:'img1', name:'Photo', type:'RECTANGLE', absoluteBoundingBox:{ x:0,y:0,width:64,height:64 },
        fills:[{ type:'IMAGE', imageRef:'asset-key' }]
      }]
    }
    let ir: any; try { ir = buildIR(root) } catch { ir = {} }
    const child = ir.children?.[0]
    expect(child.placeholder?.role).toBe('img')
    expect(child.placeholder?.ariaLabel?.toLowerCase()).toContain('placeholder')
  })
})
