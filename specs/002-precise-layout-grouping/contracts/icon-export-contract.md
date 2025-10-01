# Contract: Icon Export

## Input
IconNode
- id:string
- name:string
- width:number
- height:number
- vectorData:unknown (raw vector representation)

## Output
```
{
  id:string
  label:string
  svg?:string
  fallback:boolean
  width:number
  height:number
}
```

## Rules
- label derived from sanitized name (remove non-alphanumerics, convert dashes to spaces, capitalize).
- On export failure: svg omitted, fallback=true.
- On success: fallback=false and svg non-empty.
