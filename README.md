# Figma to React Vite

Convert Figma designs to React components with a streamlined workflow.

![Initial Screen](https://github.com/user-attachments/assets/14357584-2b12-418a-be3b-7b45620567b2)

## Features

- **Simple workflow**: Enter Figma PAT → Enter Figma URL → Get React code
- **Figma API Integration**: Fetch design data directly from Figma
- **Code Generation**: Automatically convert Figma designs to React components
- **Live Preview**: View generated components in a pixel-perfect preview
- **Lean & Fast**: Minimal dependencies, built with Vite for optimal performance
- **Deterministic Component Source (Phase 3.7)**: Generate a stable, memo-optional React component TSX string with consistent style ordering
- **Absolute Positioning Support (Feature 003)**: Handles Figma designs with `layoutMode: NONE`, generating accurate CSS with `position: absolute`, `left`, and `top` properties for precise layout fidelity

## User Flow

1. **Enter Figma Personal Access Token (PAT)** - Get your PAT from Figma Settings → Account → Personal access tokens
2. **Enter Figma URL** - Paste the URL of your Figma file or design
3. **Figma design data retrieved** - The app fetches the design data using the Figma API
4. **Code generated** - React component code is automatically generated from the design data
5. **Code integrated** - The generated code is ready to use in your app
6. **Code presented** - View the generated code with syntax highlighting
7. **Live Preview** - Click to view the rendered component in a pixel-perfect preview

![URL Input Screen](https://github.com/user-attachments/assets/9f033b26-af27-4f8a-ac5f-60fe6cf70deb)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Figma Personal Access Token

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Get Your Figma PAT

1. Log into Figma
2. Go to Settings → Account
3. Scroll to "Personal access tokens"
4. Create a new token
5. Copy the token (you'll only see it once!)

### Figma URL Format

The app supports both file and design URLs:
- `https://www.figma.com/file/FILE_ID/...`
- `https://www.figma.com/design/FILE_ID/...`
- With node-id: `https://www.figma.com/file/FILE_ID/...?node-id=NODE_ID`

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Figma API** - Design data fetching

## Project Structure

```
src/
├── App.tsx           # Main app with routing and home page
├── App.css           # Styles for the app
├── PreviewPage.tsx   # Live preview component
├── types.ts          # TypeScript type definitions
├── figmaApi.ts       # Figma API integration
├── codeGenerator.ts  # Code generation logic
└── main.tsx          # App entry point
```

## Development

```bash
# Lint code
npm run lint

# Build for production
npm run build
```

## License

MIT

## React Component Generation (Phase 3.7)

You can export a reusable component source once the internal IR is built.

```ts
import { buildIR } from './src/ir';
import { generateReactComponentSource } from './src/codeGenerator';

// rootFigmaNode: fetched via Figma API
const ir = buildIR(rootFigmaNode);
if (ir) {
	const source = generateReactComponentSource(ir, { memo: true });
	// Persist to disk, print, or evaluate as needed
	console.log(source);
}
```

Characteristics:
- Deterministic ordering of style keys and child nodes (snapshot-tested)
- Optional memoization wrapper (`options.memo`)
- Root accepts optional `className` prop
- Text nodes rendered as spans preserving whitespace (`white-space: pre-wrap`)

Determinism Benefit: If you check the emitted TSX into version control, design changes produce minimal diffs, simplifying code review.

Future Scope Ideas: custom component name, CSS module extraction, external style tokens once introduced.


## Feature 002: Precise Layout Grouping & Fidelity

Adds improved footer/layout fidelity and semantic generation:

- Column grouping heuristic with deterministic ordering (FR-001/002)
- Text style token registry + dedupe (FR-003/010) & collision handling
- Placeholder text suppression (FR-004)
- Spacing & padding fidelity (FR-005) and large layout non-wrapping (FR-006/014)
- Icon export with fallback + accessible labels (FR-007/008)
- Semantic structure hints (lists, headings) (FR-008)
- Color & opacity resolution chain + brand palette externalization (FR-009/015)
- Deterministic code generation, performance sampling events (FR-011/012/013)
- Unlimited columns scalability tests (FR-014)
- React component source emission (FR-023/024)

### Generate React Component Source

```ts
import { buildIR } from './src/ir';
import { generateReactComponentSource } from './src/codeGenerator';

const ir = buildIR(rootFigmaNode);
const source = generateReactComponentSource(ir, { componentName: 'FooterComponent', memo: true });
console.log(source);
```

### Performance Re-Verification (FR-011)

```powershell
pnpm test --filter=performance -- --run
pnpm test src/tests/integration/performance.integration.test.ts
```
Expect:
- < 10 ms/column median for 12–20 column synthetic footers
- < 5000 ms total for 5k node IR end-to-end
- `performance_sample` events with msPerColumn logged

### Determinism (FR-012)
```powershell
pnpm test src/tests/contract/determinismSmoke.contract.test.ts
pnpm test src/tests/contract/determinismExtended.contract.test.ts
```
Outputs must be byte-identical (excluding timestamps / performance metrics).

### Observability Events (FR-013)
Event types to expect: `grouping_detected`, `token_dedup_applied`, `icon_export_failed`, `performance_sample`. Absence of `grouping_skipped` when grouping succeeds.

### FR Coverage Matrix

| FR | Primary Tests |
|----|---------------|
| FR-001/002 | grouping.contract.test.ts, autoLayout.integration.test.ts |
| FR-003/010 | styleTokens.contract.test.ts, tokenCollision.contract.test.ts |
| FR-004 | textPlaceholderSuppression.contract.test.ts |
| FR-005 | spacingPadding.contract.test.ts |
| FR-006 | largeColumns.integration.test.ts |
| FR-007 | iconExport.contract.test.ts |
| FR-008 | semanticStructure.contract.test.ts |
| FR-009 | colorOpacityFallback.contract.test.ts, colorFidelity.contract.test.ts |
| FR-011 | performance.integration.test.ts + performance tests |
| FR-012 | determinismSmoke.contract.test.ts, determinismExtended.contract.test.ts |
| FR-013 | loggingEvents.contract.test.ts, loggingObservability.contract.test.ts |
| FR-014 | largeColumns.integration.test.ts |
| FR-015 | colorFidelity.contract.test.ts |
| FR-023/024 | reactComponentGeneration.contract.test.ts |

See `specs/002-precise-layout-grouping/spec.md` for full FR descriptions.

## Feature 003: Absolute Positioning

Adds support for Figma designs using manual positioning (`layoutMode: NONE`):

### What It Does
- **Detects positioning context**: Automatically determines if a node should use absolute positioning, flex layout, or is a root element
- **Generates accurate CSS**: Produces `position: absolute` with `left` and `top` properties for manually positioned elements
- **Parent container handling**: Automatically adds `position: relative` to parents that contain absolutely positioned children
- **Mixed layouts**: Seamlessly handles designs that combine auto-layout (flexbox) and absolute positioning

### Why It Matters
44% of real-world Figma designs use absolute positioning. Without this feature, these designs would render incorrectly with elements stacking vertically instead of being positioned precisely as designed.

### How It Works

```typescript
import { buildIR } from './src/ir/buildIR';
import { generateCodeFromIR, generateReactComponentSource } from './src/codeGenerator';

// Fetch your Figma design
const figmaNode = await fetchFromFigmaAPI(fileId, nodeId);

// Build intermediate representation (IR) with positioning info
const ir = buildIR(figmaNode);

// Generate code with position CSS
const code = generateCodeFromIR(ir);
// or
const reactSource = generateReactComponentSource(ir);
```

### Positioning Types

The system identifies three positioning types:

1. **`root`**: Top-level nodes without a parent
2. **`flex-item`**: Children of auto-layout parents (`layoutMode: HORIZONTAL/VERTICAL`)
3. **`absolute`**: Children of manual layout parents (`layoutMode: NONE`) - includes calculated `x` and `y` coordinates relative to parent

### Performance

- Processes 5,000+ nodes in < 10ms
- Linear scaling with node count
- Handles 100+ levels of nesting without issues

### Testing

```bash
# Run positioning tests
npm test -- positioning

# Run integration tests
npm test -- positioning.integration

# Run performance tests  
npm test -- positioning.perf
```

Test coverage:
- 8 contract tests for `buildPosition()` function
- 20 contract tests for CSS generation (both code generators)
- 8 unit tests for edge cases
- 5 integration tests for end-to-end workflows
- 4 performance tests with large node counts

### API

#### `buildPosition(node, parent?): PositionInfo | undefined`

Determines positioning type for a node based on parent context.

**Returns:**
- `{ type: 'root' }` - Node has no parent
- `{ type: 'flex-item' }` - Parent uses auto-layout
- `{ type: 'absolute', x: number, y: number }` - Manual positioning with coordinates
- `undefined` - Node lacks positioning data

See `specs/003-implement-absolute-positioning/` for detailed specification.

