import React from 'react';

export default function OutputPanel({ output, error, isLoading, onClear }) {
  const hasContent = output !== null || error !== null;

  return (
    <div className="output-panel">
      <div className="output-content">
        {isLoading ? (
          <div className="output-loading" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <div>Running...</div>
          </div>
        ) : error !== null ? (
          <pre className="output-error">⚠ Error:\n{error}</pre>
        ) : output !== null ? (
          <pre className="output-success">{output}</pre>
        ) : (
          <div className="output-ready">
            Ready. Write some Monkey code and press Run.
          </div>
        )}
      </div>

      {hasContent ? (
        <div className="output-footer">
          <button className="btn-clear" onClick={onClear} type="button">
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
