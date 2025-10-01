# Contract: Color Fidelity Evaluation

## Input
ColorComparison
- expectedHex:string
- actualHex:string
- isBrand:boolean

## Output
```
{
  match:boolean
  delta?:number
  rule:'brand'|'general'
}
```

## Rules
- If isBrand=true: match = (expectedHex.toLowerCase() == actualHex.toLowerCase()); delta omitted.
- Else: compute CIEDE2000 ΔE between expected and actual; match = (ΔE <= 3); include delta.
