# Figma to React Vite

Convert Figma designs to React components with a streamlined workflow.

![Initial Screen](https://github.com/user-attachments/assets/14357584-2b12-418a-be3b-7b45620567b2)

## Features

- **Simple workflow**: Enter Figma PAT → Enter Figma URL → Get React code
- **Figma API Integration**: Fetch design data directly from Figma
- **Code Generation**: Automatically convert Figma designs to React components
- **Live Preview**: View generated components in a pixel-perfect preview
- **Lean & Fast**: Minimal dependencies, built with Vite for optimal performance

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

