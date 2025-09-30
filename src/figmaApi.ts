export async function fetchFigmaDesign(pat: string, fileId: string, nodeId?: string): Promise<{
  nodes?: Record<string, { document: unknown }>;
  document?: unknown;
}> {
  const url = nodeId 
    ? `https://api.figma.com/v1/files/${fileId}/nodes?ids=${encodeURIComponent(nodeId)}`
    : `https://api.figma.com/v1/files/${fileId}`;
  
  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': pat,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Figma design: ${response.statusText}`);
  }

  return response.json();
}

export function parseFigmaUrl(url: string): { fileId: string; nodeId?: string } | null {
  // Parse URLs like: https://www.figma.com/file/FILE_ID/...?node-id=NODE_ID
  // or https://www.figma.com/design/FILE_ID/...?node-id=NODE_ID
  const fileMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  if (!fileMatch) return null;

  const fileId = fileMatch[2];
  const nodeIdMatch = url.match(/node-id=([^&]+)/);
  const nodeId = nodeIdMatch ? nodeIdMatch[1].replace(/-/g, ':') : undefined;

  return { fileId, nodeId };
}
