import React, { useCallback, useEffect, useState } from 'react';
import { EXAMPLES } from './examples.js';
import Editor from './components/Editor.jsx';
import OutputPanel from './components/OutputPanel.jsx';
import ExamplePicker from './components/ExamplePicker.jsx';

export default function App() {
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setOutput(null);
    setError(null);

    try {
      const url = import.meta.env.DEV
        ? '/api/run'
        : `${import.meta.env.VITE_API_URL}/api/run`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();
      setOutput(data.output);
      setError(data.error);
    } catch {
      setError('Could not reach the server. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [code, isLoading]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const isEnter = e.key === 'Enter';
      const isRunCombo = (e.ctrlKey || e.metaKey) && isEnter;
      if (!isRunCombo) return;
      e.preventDefault();
      handleRun();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleRun]);

  const handleExampleSelect = useCallback((exampleCode) => {
    setCode(exampleCode);
    setOutput(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setOutput(null);
    setError(null);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="header-title">🐒 Monkey Playground</div>
        </div>

        <div className="header-controls">
          <ExamplePicker onSelect={handleExampleSelect} />
          <button
            className="btn-run"
            onClick={handleRun}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? 'Running...' : 'Run ▶'}
          </button>
        </div>
      </header>

      <div className="panels">
        <div className="editor-panel">
          <Editor code={code} onChange={setCode} />
        </div>

        <OutputPanel
          output={output}
          error={error}
          isLoading={isLoading}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
