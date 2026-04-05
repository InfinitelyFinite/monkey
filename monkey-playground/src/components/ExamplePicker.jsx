import React, { useMemo, useState } from 'react';
import { EXAMPLES } from '../examples.js';

export default function ExamplePicker({ onSelect }) {
  const [value, setValue] = useState('');

  const examples = useMemo(() => EXAMPLES, []);

  return (
    <select
      value={value}
      onChange={(e) => {
        const nextValue = e.target.value;
        setValue(nextValue);

        if (nextValue === '') return;

        const idx = Number(nextValue);
        const example = examples[idx];
        if (!example) return;

        onSelect(example.code);
        setValue('');
      }}
      className="select"
      aria-label="Load Example"
    >
      <option value="" disabled>
        Load Example...
      </option>
      {examples.map((ex, idx) => (
        <option key={ex.label} value={String(idx)}>
          {ex.label}
        </option>
      ))}
    </select>
  );
}
