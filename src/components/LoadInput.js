import React, { useState } from 'react';

export default function LoadInput({ length, onChange }) {
  const [loads, setLoads] = useState([]);
  const [type, setType] = useState('point');
  const [magnitude, setMagnitude] = useState(10);
  const [position, setPosition] = useState(5);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(length);

  function addLoad() {
    let load = { type, magnitude };
    if (type === 'point' || type === 'moment') load.position = position;
    if (type === 'udl' || type === 'triangular') {
      load.start = start;
      load.end = end;
    }
    setLoads([...loads, load]);
    onChange([...loads, load]);
  }

  return (
    <div className="p-4 border rounded mb-4">
      <h2 className="font-bold mb-2">Loads</h2>
      <div className="flex gap-2 mb-2">
        <select value={type} onChange={e => setType(e.target.value)} className="border px-2 py-1">
          <option value="point">Point Force</option>
          <option value="udl">UDL</option>
          <option value="triangular">Triangular</option>
          <option value="moment">Moment</option>
        </select>
        <input type="number" value={magnitude} onChange={e => setMagnitude(Number(e.target.value))} className="border px-2 py-1" placeholder="Magnitude" />
        {(type === 'point' || type === 'moment') && (
          <input type="number" value={position} min={0} max={length} step={0.1} onChange={e => setPosition(Number(e.target.value))} className="border px-2 py-1" placeholder="Position" />
        )}
        {(type === 'udl' || type === 'triangular') && (
          <>
            <input type="number" value={start} min={0} max={length} step={0.1} onChange={e => setStart(Number(e.target.value))} className="border px-2 py-1" placeholder="Start" />
            <input type="number" value={end} min={start} max={length} step={0.1} onChange={e => setEnd(Number(e.target.value))} className="border px-2 py-1" placeholder="End" />
          </>
        )}
        <button type="button" onClick={addLoad} className="bg-blue-500 text-white px-3 py-1 rounded">Add</button>
      </div>
      <ul className="list-disc ml-6">
        {loads.map((l, idx) => (
          <li key={idx}>{l.type} | {l.magnitude} | {l.position !== undefined ? `x=${l.position}` : `x=${l.start} to x=${l.end}`}</li>
        ))}
      </ul>
    </div>
  );
}
