import React from 'react';
import { exportSessionLog } from '../logging';

interface FigmaPreviewProps {
  onExport?: (json: string) => void;
}

// Simple preview component providing a button to export the session log (T034)
export const FigmaPreview: React.FC<FigmaPreviewProps> = ({ onExport }) => {
  const handleExport = () => {
    let json = '';
    try { json = exportSessionLog(); } catch { json=''; }
    if (onExport) onExport(json);
    // Fallback: trigger download
    if (typeof document !== 'undefined') {
      const blob = new Blob([json], { type:'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'session-log.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  return (
    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
      <button type="button" onClick={handleExport}>Export Session Log</button>
    </div>
  );
};

export default FigmaPreview;