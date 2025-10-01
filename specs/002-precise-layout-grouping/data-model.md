# Data Model: Footer Fidelity & Extraction Improvements

## Entities
### FooterSection
- columns: FooterColumn[]
- padding: {top:number,right:number,bottom:number,left:number}
- gap: number
- semanticRole: 'footer'
- overflow: 'scroll-x'

### FooterColumn
- index: number
- items: FooterItem[]
- tokenRefs: string[] (unique referenced TextStyleToken names)

### FooterItem (union)
- type: 'text' | 'icon'
- text? : {content:string, token:string}
- icon? : {svg?:string, fallback:boolean, label:string}

### TextStyleToken
- name: string (deterministic)
- fontFamily, weight, size, lineHeight, letterSpacing, colorHex, paragraphSpacing

### IconAsset
- id: string
- label: string
- svg?: string
- fallback: boolean
- width:number
- height:number

### InstrumentationEvent
- type: 'grouping_detected' | 'grouping_skipped' | 'token_dedup_applied' | 'icon_export_failed' | 'performance_sample'
- payload: object (typed per event)
- ts: number (ms since epoch)

## Derived Structures
### GroupingResult
- columns: FooterColumn[]
- excluded: {nodeId:string, reason:string}[]

### ColorEvaluation
- match: boolean
- delta?: number
- rule: 'brand' | 'general'

## Relationships
- FooterSection 1..* FooterColumn
- FooterColumn *..* TextStyleToken (via tokenRefs)
- IconAsset used by FooterItem(type icon)

## Validation Rules
- All column indices contiguous starting at 0.
- tokenRefs contains no duplicates; each token referenced must exist.
- If icon.fallback=true then svg is undefined.
- ColorEvaluation.delta required when rule='general'.

## State Transitions
- IconAsset: {pending export} -> {exported|fallback}
- Grouping detection: {unprocessed} -> {grouping_detected|skipped}

## Notes
- Deterministic naming: stable input ordering + canonical style property ordering.
