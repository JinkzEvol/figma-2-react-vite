# GitHub Copilot Instructions for Figma to React Vite

## Project Overview

This is a Figma to React conversion tool built with Vite. The application allows users to convert Figma designs to React components by:
1. Entering a Figma Personal Access Token (PAT)
2. Providing a Figma file or design URL
3. Fetching design data via the Figma API
4. Automatically generating React component code
5. Viewing the generated code and live preview

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety and development experience
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing (v7)
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

## Key Features

1. **Multi-step workflow**: PAT entry → URL entry → Processing → Code display
2. **Figma API Integration**: Fetches design data from Figma files
3. **Code Generation**: Converts Figma nodes to React JSX
4. **Live Preview**: Renders generated components dynamically
5. **Session Storage**: Persists generated code for preview page

## Development Guidelines

### Code Style
- Use functional components with hooks (React 19)
- Prefer TypeScript type annotations over interfaces where appropriate
- Use async/await for asynchronous operations
- Follow existing code patterns for consistency

### State Management
- Use React hooks (useState, useEffect) for component state
- Use sessionStorage for cross-page data sharing
- Maintain step-based flow with union types ('pat' | 'url' | 'processing' | 'done')

### API Integration
- All Figma API calls go through `figmaApi.ts`
- Handle both file and node-specific URLs
- Support both `/file/` and `/design/` URL formats
- Include proper error handling for API failures

### Code Generation
- Generate clean, readable React components
- Convert Figma node properties to CSS styles
- Handle nested children recursively
- Support text nodes, containers, and style properties

### Styling
- Use inline styles for generated components
- Follow the dark theme established in App.css
- Maintain responsive design principles
- Use CSS variables defined in :root

### Error Handling
- Display user-friendly error messages
- Validate Figma URLs before processing
- Handle API errors gracefully
- Provide clear feedback during processing

## Common Tasks

### Adding New Figma Node Support
1. Update FigmaNode interface in `types.ts`
2. Add style conversion in `codeGenerator.ts` → `generateNodeStyles()`
3. Handle node type in `generateComponentCode()`
4. Test with real Figma designs

### Modifying the Workflow
1. Update step type in `Home` component
2. Add new step rendering in JSX
3. Update form handlers as needed
4. Maintain consistent button grouping

### Updating Styles
1. Modify CSS in `App.css`
2. Follow existing naming conventions (.container, .form, .button, etc.)
3. Test in both light and dark modes
4. Ensure responsive behavior

## Build and Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Testing Considerations

- Test with various Figma URL formats
- Verify PAT validation works correctly
- Check error states and edge cases
- Ensure preview page handles missing data
- Validate generated code syntax

## Best Practices

1. **Minimal Changes**: Make surgical, focused changes
2. **Type Safety**: Leverage TypeScript for better DX
3. **User Experience**: Provide clear feedback and error messages
4. **Performance**: Keep bundle size minimal
5. **Accessibility**: Follow semantic HTML practices
6. **Code Quality**: Run linter before committing

## Important Notes

- Figma PAT is stored in component state (not persisted)
- Generated code uses sessionStorage for preview
- Support both file-level and node-level Figma URLs
- Handle CORS and API rate limiting appropriately
- Preview uses dynamic component creation with Function constructor

## File-Specific Guidelines

### App.tsx
- Main component with routing
- Home component handles workflow steps
- Form submissions with validation
- Error state management

### figmaApi.ts
- parseFigmaUrl: Extract fileId and optional nodeId
- fetchFigmaDesign: Call Figma REST API
- Handle different response structures

### codeGenerator.ts
- rgbaToString: Convert Figma colors to CSS
- generateNodeStyles: Extract CSS from Figma properties
- generateComponentCode: Recursively generate JSX
- generateReactCode: Main entry point

### types.ts
- FigmaNode: Complete node structure
- FigmaDocument: Top-level document
- AppState: Application state shape

## External Resources

- Figma REST API: https://www.figma.com/developers/api
- React 19 Documentation: https://react.dev
- Vite Documentation: https://vite.dev
