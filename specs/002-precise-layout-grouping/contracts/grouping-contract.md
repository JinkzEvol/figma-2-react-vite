# Contract: Column Grouping

## Input
Array<NodeMeta>
- id:string
- x:number
- y:number
- width:number
- height:number
- childCount:number

## Output
```
{
  columns: Array<{
    index:number
    nodeIds:string[]
  }>
  excluded: Array<{
    nodeId:string
    reason:'misaligned'|'gap-variance'|'insufficient-siblings'
  }>
}
```

## Rules
- Top y delta across a column set ≤2px.
- Horizontal gap variance across columns ≤4px.
- Minimum siblings to form grouping: 2.
- Ordering by ascending x.
