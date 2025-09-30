import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PreviewPage() {
  const [code, setCode] = useState('');
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    const generatedCode = sessionStorage.getItem('generatedCode');
    if (generatedCode) {
      setCode(generatedCode);
      
      // Dynamically create and render the component
      try {
        // Create a function from the generated code
        const componentFunction = new Function('React', `
          ${generatedCode}
          return FigmaComponent;
        `);
        
        const GeneratedComponent = componentFunction({ createElement: null });
        setComponent(() => GeneratedComponent);
      } catch (error) {
        console.error('Error creating component:', error);
      }
    }
  }, []);

  if (!code) {
    return (
      <div className="container">
        <h1>No Preview Available</h1>
        <p>Please generate code first.</p>
        <Link to="/" className="button">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h1>Live Preview</h1>
        <Link to="/" className="button button-secondary">Back to Generator</Link>
      </div>
      
      <div className="preview-content">
        {Component ? (
          <div className="preview-frame">
            <Component />
          </div>
        ) : (
          <div className="preview-code">
            <h2>Generated Code</h2>
            <pre>{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewPage;
