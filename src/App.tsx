import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { fetchFigmaDesign, parseFigmaUrl } from './figmaApi';
import { generateReactCode } from './codeGenerator';
import PreviewPage from './PreviewPage';
import './App.css';

function Home() {
  const [pat, setPat] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [step, setStep] = useState<'pat' | 'url' | 'processing' | 'done'>('pat');

  // On mount, load persisted PAT (Phase 3.8 T074)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('figmaPat');
      if (stored && stored.trim()) {
        setPat(stored);
        // Auto-skip to URL entry step if PAT already persisted
        setStep('url');
      }
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }, []);

  const handlePatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pat.trim()) {
      // Persist PAT (Phase 3.8 T074)
      try { localStorage.setItem('figmaPat', pat.trim()); } catch { /* ignore */ }
      setStep('url');
      setError('');
    } else {
      setError('Please enter a valid Figma Personal Access Token');
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStep('processing');

    try {
      const parsed = parseFigmaUrl(figmaUrl);
      if (!parsed) {
        throw new Error('Invalid Figma URL. Please use a valid Figma file or design URL.');
      }

      // Fetch design data
      const designData = await fetchFigmaDesign(pat, parsed.fileId, parsed.nodeId);

      // Generate code
      const code = generateReactCode(designData);
      setGeneratedCode(code);
      
      // Store in sessionStorage for the preview page
      sessionStorage.setItem('generatedCode', code);
      
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStep('url');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Do not clear persisted PAT on full reset (explicit clear is a deferred feature)
    setFigmaUrl('');
    setGeneratedCode('');
    // If persisted PAT exists, return to URL step; otherwise PAT step
    const stored = (() => { try { return localStorage.getItem('figmaPat'); } catch { return ''; } })();
    if (stored && stored.trim()) {
      setPat(stored);
      setStep('url');
    } else {
      setPat('');
      setStep('pat');
    }
    setError('');
    sessionStorage.removeItem('generatedCode');
  };

  return (
    <div className="container">
      <h1>Figma to React</h1>
      <p className="subtitle">Convert Figma designs to React components</p>

      {error && <div className="error">{error}</div>}

      {step === 'pat' && (
        <form onSubmit={handlePatSubmit} className="form">
          <div className="form-group">
            <label htmlFor="pat">Figma Personal Access Token (PAT)</label>
            <input
              type="password"
              id="pat"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="Enter your Figma PAT"
              className="input"
              autoFocus
            />
            <small>Get your PAT from Figma → Settings → Account → Personal access tokens</small>
          </div>
          <div className="button-group">
            <button type="submit" className="button">Next</button>
            {/* Back to generator button (Phase 3.8 T076) visible only if PAT persisted */}
            {pat && pat === (():string => { try { return localStorage.getItem('figmaPat') || ''; } catch { return ''; } })() && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setStep('url')}
                aria-label="Back to generator"
              >
                Back to generator
              </button>
            )}
          </div>
        </form>
      )}

      {step === 'url' && (
        <form onSubmit={handleUrlSubmit} className="form">
          <div className="form-group">
            <label htmlFor="url">Figma File URL</label>
            <input
              type="text"
              id="url"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="input"
              autoFocus
            />
            <small>Paste the URL of your Figma file or design</small>
          </div>
          <div className="button-group">
            {/* Add PAT button (Phase 3.8 T075) */}
            <button
              type="button"
              onClick={() => setStep('pat')}
              className="button button-secondary"
              aria-label="Add PAT"
            >
              Add PAT
            </button>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Processing...' : 'Generate Code'}
            </button>
          </div>
        </form>
      )}

      {step === 'processing' && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching design data and generating code...</p>
        </div>
      )}

      {step === 'done' && generatedCode && (
        <div className="result">
          <h2>Generated Code</h2>
          <pre className="code-preview">{generatedCode}</pre>
          <div className="button-group">
            <button onClick={handleReset} className="button button-secondary">
              Start Over
            </button>
            <Link to="/preview" className="button">
              View Live Preview
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preview" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
