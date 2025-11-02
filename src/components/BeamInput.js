import React, { useState } from 'react';

export default function BeamInput({ onChange }) {
  const [length, setLength] = useState(10);
  const [supports, setSupports] = useState([
    { type: 'pin', position: 0 },
    { type: 'roller', position: 10 }
  ]);

  function handleLength(e) {
    setLength(Number(e.target.value));
    onChange({ length: Number(e.target.value), supports });
  }

  function handleSupportType(idx, type) {
    const newSupports = supports.map((s, i) => i === idx ? { ...s, type } : s);
    setSupports(newSupports);
    onChange({ length, supports: newSupports });
  }

  function handleSupportPos(idx, pos) {
    const newSupports = supports.map((s, i) => i === idx ? { ...s, position: Number(pos) } : s);
    setSupports(newSupports);
    onChange({ length, supports: newSupports });
  }

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Beam Setup</h2>
      <label>Length (m): <input type="number" value={length} min={1} max={100} step={0.1} onChange={handleLength} className="border px-2 py-1 ml-2" /></label>
      <div className="mt-2">
        <h3 className="font-semibold">Supports</h3>
        {supports.map((s, idx) => (
          <div key={idx} className="flex gap-2 items-center mb-1">
            <select value={s.type} onChange={e => handleSupportType(idx, e.target.value)} className="border px-2 py-1">
              <option value="pin">Pin</option>
              <option value="roller">Roller</option>
              <option value="fixed">Fixed</option>
            </select>
            <input type="number" value={s.position} min={0} max={length} step={0.1} onChange={e => handleSupportPos(idx, e.target.value)} className="border px-2 py-1" />
            <span>m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
