import React, { useEffect, useRef } from 'react';
import { EditorView, highlightActiveLine, lineNumbers } from '@codemirror/view';
import { EditorSelection, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching } from '@codemirror/language';

export default function Editor({ code, onChange }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        oneDark,
        javascript(),
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          const nextCode = update.state.doc.toString();
          onChangeRef.current(nextCode);
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: containerRef.current
    });

    viewRef.current = view;

    return () => {
      viewRef.current = null;
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const current = view.state.doc.toString();
    if (current === code) return;

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: code },
      selection: EditorSelection.cursor(code.length)
    });
  }, [code]);

  return <div ref={containerRef} className="editor-container" />;
}
