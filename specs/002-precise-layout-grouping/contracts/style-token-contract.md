# Contract: Text Style Token Registry

## Input
Array<TextStyleDescriptor>
- fontFamily:string
- weight:number|string
- size:number
- lineHeight:number
- letterSpacing:number
- colorHex:string
- paragraphSpacing?:number

## Output
```
{
  tokens: Array<{
    name:string
    fontFamily:string
    weight:number|string
    size:number
    lineHeight:number
    letterSpacing:number
    colorHex:string
    paragraphSpacing?:number
    usageCount:number
  }>
  map: { [signature:string]: string } // signature -> token name
}
```

## Rules
- Deterministic signature ordering of properties.
- Identical style descriptors collapse into single token (increment usageCount).
- Token name stable across runs given identical inputs.
