# Contract: Logging Events

## Events
### grouping_detected
- columns:number
- items:number
- durationMs:number

### grouping_skipped
- reason:'insufficient-siblings'|'alignment-variance'|'gap-variance'
- candidateCount:number

### token_dedup_applied
- tokens:number
- collapsed:number (duplicates removed)

### icon_export_failed
- iconId:string
- reason:string

### performance_sample
- section:'footer'
- columns:number
- msPerColumn:number
