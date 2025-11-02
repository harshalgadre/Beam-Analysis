import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Arrow } from 'react-konva';

const BEAM_HEIGHT = 20;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 200;
const SUPPORT_RADIUS = 10;
const LOAD_ARROW_SIZE = 30;

const supportColors = {
  pin: '#2d6cdf',
  roller: '#f5a623',
  fixed: '#333',
};
const loadColors = {
  point: '#e74c3c',
  udl: '#27ae60',
  triangular: '#8e44ad',
  moment: '#f39c12',
};

function posToCanvas(x, length) {
  // Adjust for responsive canvas width
  const actualCanvasWidth = typeof window !== 'undefined' ? Math.min(CANVAS_WIDTH, window.innerWidth - 60) : CANVAS_WIDTH;
  return 50 + (x / length) * (actualCanvasWidth - 100);
}

export default function BeamCanvasInput({ length, supports, loads, onChange }) {
  // Detect dark mode
  const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [selectedTool, setSelectedTool] = useState('pin');
  const [tempPos, setTempPos] = useState(null);
  const [tempLoad, setTempLoad] = useState(null);

  // Calculate canvas dimensions based on screen size
  const getCanvasDimensions = () => {
    if (typeof window !== 'undefined') {
      const width = Math.min(CANVAS_WIDTH, window.innerWidth - 40);
      return { width, height: CANVAS_HEIGHT + 40 };
    }
    return { width: CANVAS_WIDTH, height: CANVAS_HEIGHT + 40 };
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  // Add support or load on click
  function handleCanvasClick(e) {
    const mouseX = e.target.getStage().getPointerPosition().x;
    const actualCanvasWidth = typeof window !== 'undefined' ? Math.min(CANVAS_WIDTH, window.innerWidth - 60) : CANVAS_WIDTH;
    const x = ((mouseX - 50) / (actualCanvasWidth - 100)) * length;
    if (selectedTool === 'pin' || selectedTool === 'roller' || selectedTool === 'fixed') {
      const newSupports = [...supports, { type: selectedTool, position: Math.max(0, Math.min(length, Number(x.toFixed(2))) ) }];
      onChange({ supports: newSupports, loads });
    } else if (selectedTool === 'point') {
      const newLoads = [...loads, { type: 'point', magnitude: 10, position: Math.max(0, Math.min(length, Number(x.toFixed(2))) ) }];
      onChange({ supports, loads: newLoads });
    } else if (selectedTool === 'moment') {
      const newLoads = [...loads, { type: 'moment', magnitude: 10, position: Math.max(0, Math.min(length, Number(x.toFixed(2))) ) }];
      onChange({ supports, loads: newLoads });
    } else if (selectedTool === 'udl') {
      if (tempPos === null) {
        setTempPos(x);
      } else {
        const start = Math.min(tempPos, x);
        const end = Math.max(tempPos, x);
        const newLoads = [...loads, { type: 'udl', magnitude: 5, start, end }];
        onChange({ supports, loads: newLoads });
        setTempPos(null);
      }
    } else if (selectedTool === 'triangular') {
      if (tempPos === null) {
        setTempPos(x);
      } else {
        const start = Math.min(tempPos, x);
        const end = Math.max(tempPos, x);
        const newLoads = [...loads, { type: 'triangular', magnitude: 5, start, end }];
        onChange({ supports, loads: newLoads });
        setTempPos(null);
      }
    }
  }

  // Render supports
  const supportNodes = supports.map((s, idx) => (
    <Circle
      key={idx}
      x={posToCanvas(s.position, length)}
      y={CANVAS_HEIGHT / 2}
      radius={SUPPORT_RADIUS}
      fill={supportColors[s.type] || '#888'}
      stroke="#222"
      strokeWidth={2}
      shadowColor="rgba(0,0,0,0.3)"
      shadowBlur={4}
      shadowOffsetX={2}
      shadowOffsetY={2}
    />
  ));

  // Render loads
  const loadNodes = loads.map((l, idx) => {
    if (l.type === 'point') {
      return (
        <Arrow
          key={idx}
          points={[posToCanvas(l.position, length), CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2, posToCanvas(l.position, length), CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - LOAD_ARROW_SIZE]}
          pointerLength={10}
          pointerWidth={10}
          fill={loadColors.point}
          stroke={loadColors.point}
          strokeWidth={4}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={3}
        />
      );
    }
    if (l.type === 'moment') {
      return (
        <Text
          key={idx}
          x={posToCanvas(l.position, length) - 10}
          y={CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - 40}
          text="⟳"
          fontSize={28}
          fill={loadColors.moment}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={3}
        />
      );
    }
    if (l.type === 'udl') {
      return (
        <Rect
          key={idx}
          x={posToCanvas(l.start, length)}
          y={CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - 20}
          width={posToCanvas(l.end, length) - posToCanvas(l.start, length)}
          height={10}
          fill={loadColors.udl}
          opacity={0.7}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={3}
        />
      );
    }
    if (l.type === 'triangular') {
      return (
        <Line
          key={idx}
          points={[
            posToCanvas(l.start, length), CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - 20,
            posToCanvas(l.end, length), CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - 20,
            posToCanvas(l.end, length), CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2 - 10
          ]}
          fill={loadColors.triangular}
          stroke={loadColors.triangular}
          closed={true}
          opacity={0.7}
          shadowColor="rgba(0,0,0,0.2)"
          shadowBlur={3}
        />
      );
    }
    return null;
  });

  // Tool palette
  const tools = [
    { type: 'pin', label: 'Pin Support', desc: 'Resists vertical & horizontal forces, allows rotation.' },
    { type: 'roller', label: 'Roller Support', desc: 'Resists vertical force, allows horizontal movement & rotation.' },
    { type: 'fixed', label: 'Fixed Support', desc: 'Resists all forces & moments, no movement.' },
    { type: 'point', label: 'Point Load', desc: 'Force at a single point.' },
    { type: 'udl', label: 'Uniformly Distributed Load (UDL)', desc: 'Load spread evenly over a length.' },
    { type: 'triangular', label: 'Uniformly Varying Load (UVL)', desc: 'Load intensity changes linearly.' },
    { type: 'moment', label: 'Applied Moment (Couple)', desc: 'Rotating force at a point.' },
  ];

  return (
    <div className="p-4 sm:p-6 border rounded-xl mb-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-gray-200 dark:border-gray-700">
      <h2 className="font-bold text-lg sm:text-xl mb-4 text-gray-800 dark:text-white">Interactive Beam Editor</h2>
      <div
        className={`flex flex-wrap gap-1.5 sm:gap-2 mb-4 sticky top-0 z-10 p-2 sm:p-3 rounded-lg shadow-md border ${
          isDark 
            ? 'border-gray-600 bg-gray-800' 
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        {tools.map(t => (
          <button
            key={t.type}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              selectedTool === t.type 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-blue-700 shadow-lg' 
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-blue-50 hover:border-blue-400 dark:hover:bg-gray-600'
            }`}
            onClick={() => { setSelectedTool(t.type); setTempPos(null); }}
            title={t.desc}
            style={{ minWidth: 'calc(50% - 4px)', flex: '1 1 calc(50% - 4px)' }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto pb-3" style={{ maxWidth: '100%' }}>
        <Stage
          width={canvasWidth}
          height={canvasHeight}
          style={{
            background: isDark ? '#1f2937' : '#f3f4f6',
            border: isDark ? '2px solid #4b5563' : '2px solid #9ca3af',
            borderRadius: 16,
            margin: '0 auto',
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
          }}
          onClick={handleCanvasClick}
        >
          <Layer>
            {/* Beam */}
            <Rect
              x={50}
              y={CANVAS_HEIGHT / 2 - BEAM_HEIGHT / 2}
              width={canvasWidth - 100}
              height={BEAM_HEIGHT}
              fill={isDark ? '#374151' : '#1f2937'}
              cornerRadius={12}
              shadowColor={isDark ? '#000' : '#000'}
              shadowBlur={10}
              shadowOffsetX={0}
              shadowOffsetY={4}
            />
            {/* Supports */}
            {supportNodes}
            {/* Loads */}
            {loadNodes}
          </Layer>
        </Stage>
      </div>
      {/* Editing options for supports and loads */}
      <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6`}>
        <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>Supports</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {supports.length}
            </span>
          </div>
          {supports.length === 0 && <div className={isDark ? 'text-gray-400' : 'text-gray-500 text-sm'}>No supports added.</div>}
          {supports.map((s, idx) => (
            <div key={idx} className={`flex flex-wrap gap-2 sm:gap-3 items-center mb-3 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
              <span className={`px-2 py-1 rounded font-medium text-xs sm:text-sm`} style={{ background: isDark ? '#4b5563' : '#e5e7eb', color: supportColors[s.type] }}>{s.type}</span>
              <label className="flex-1 min-w-[120px]">
                Position (m): 
                <input 
                  type="number" 
                  min={0} 
                  max={length} 
                  step={0.01} 
                  value={s.position} 
                  onChange={e => {
                    const val = Number(e.target.value);
                    const newSupports = supports.map((sup, i) => i === idx ? { ...sup, position: val } : sup);
                    onChange({ supports: newSupports, loads });
                  }} 
                  className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                />
              </label>
              <button 
                className="text-red-600 hover:text-red-800 px-1.5 py-1 sm:px-2 sm:py-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={() => {
                  const newSupports = supports.filter((_, i) => i !== idx);
                  onChange({ supports: newSupports, loads });
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className={`font-semibold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>Loads</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {loads.length}
            </span>
          </div>
          {loads.length === 0 && <div className={isDark ? 'text-gray-400' : 'text-gray-500 text-sm'}>No loads added.</div>}
          {loads.map((l, idx) => (
            <div key={idx} className={`flex flex-wrap gap-2 sm:gap-3 items-center mb-3 p-3 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-gray-50'}`}>
              <span className={`px-2 py-1 rounded font-medium text-xs sm:text-sm`} style={{ background: isDark ? '#4b5563' : '#e5e7eb', color: loadColors[l.type] }}>{l.type}</span>
              {l.type === 'point' || l.type === 'moment' ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-[180px]">
                  <label className="text-xs sm:text-sm">
                    Position (m):
                    <input 
                      type="number" 
                      min={0} 
                      max={length} 
                      step={0.01} 
                      value={l.position} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newLoads = loads.map((ld, i) => i === idx ? { ...ld, position: val } : ld);
                        onChange({ supports, loads: newLoads });
                      }} 
                      className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                    />
                  </label>
                  <label className="text-xs sm:text-sm">
                    Magnitude:
                    <input 
                      type="number" 
                      step={0.01} 
                      value={l.magnitude} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newLoads = loads.map((ld, i) => i === idx ? { ...ld, magnitude: val } : ld);
                        onChange({ supports, loads: newLoads });
                      }} 
                      className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                    />
                  </label>
                </div>
              ) : l.type === 'udl' || l.type === 'triangular' ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 min-w-[220px]">
                  <label className="text-xs sm:text-sm">
                    Start (m):
                    <input 
                      type="number" 
                      min={0} 
                      max={length} 
                      step={0.01} 
                      value={l.start} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newLoads = loads.map((ld, i) => i === idx ? { ...ld, start: val } : ld);
                        onChange({ supports, loads: newLoads });
                      }} 
                      className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                    />
                  </label>
                  <label className="text-xs sm:text-sm">
                    End (m):
                    <input 
                      type="number" 
                      min={0} 
                      max={length} 
                      step={0.01} 
                      value={l.end} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newLoads = loads.map((ld, i) => i === idx ? { ...ld, end: val } : ld);
                        onChange({ supports, loads: newLoads });
                      }} 
                      className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                    />
                  </label>
                  <label className="text-xs sm:text-sm">
                    Magnitude:
                    <input 
                      type="number" 
                      step={0.01} 
                      value={l.magnitude} 
                      onChange={e => {
                        const val = Number(e.target.value);
                        const newLoads = loads.map((ld, i) => i === idx ? { ...ld, magnitude: val } : ld);
                        onChange({ supports, loads: newLoads });
                      }} 
                      className={`border px-2 py-1 sm:px-3 sm:py-1.5 rounded w-full mt-1 text-sm ${isDark ? 'bg-gray-800 text-white border-gray-600' : ''}`} 
                    />
                  </label>
                </div>
              ) : null}
              <button 
                className="text-red-600 hover:text-red-800 px-1.5 py-1 sm:px-2 sm:py-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 self-start text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                onClick={() => {
                  const newLoads = loads.filter((_, i) => i !== idx);
                  onChange({ supports, loads: newLoads });
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className={`mt-4 text-xs sm:text-sm font-medium p-3 rounded-lg ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-blue-800'}`}>
        Click on the beam to add the selected item. For UDL/UVL, click start and end positions. Use the edit panel below to adjust values or delete items.
      </div>
      <div className={`mt-4 p-4 rounded-xl border text-sm ${
        isDark 
          ? 'border-gray-600 bg-gray-800 text-gray-100' 
          : 'border-gray-300 bg-gray-50 text-gray-800'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Supports:</h4>
            <div className="space-y-1">
              <div className="flex items-start">
                <span className="mr-2" style={{ color: supportColors.pin }}>●</span>
                <div>
                  <span className="font-medium">Pin Support:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Resists vertical & horizontal forces, allows rotation.</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2" style={{ color: supportColors.roller }}>●</span>
                <div>
                  <span className="font-medium">Roller Support:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Resists vertical force, allows horizontal movement & rotation.</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2" style={{ color: supportColors.fixed }}>●</span>
                <div>
                  <span className="font-medium">Fixed Support:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Resists all forces & moments, no movement.</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Loads:</h4>
            <div className="space-y-1">
              <div className="flex items-start">
                <span className="mr-2" style={{ color: loadColors.point }}>→</span>
                <div>
                  <span className="font-medium">Point Load:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Force at a single point.</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2" style={{ color: loadColors.udl }}>▬</span>
                <div>
                  <span className="font-medium">UDL:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Load spread evenly over a length.</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2" style={{ color: loadColors.triangular }}>▲</span>
                <div>
                  <span className="font-medium">UVL:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Load intensity changes linearly.</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="mr-2" style={{ color: loadColors.moment }}>⟳</span>
                <div>
                  <span className="font-medium">Moment:</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}> Rotating force at a point.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
