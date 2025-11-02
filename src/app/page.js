"use client";
import React, { useState } from 'react';
import BeamCanvasInput from '../components/BeamCanvasInput';
import Diagram from '../components/Diagram';
import DetailedCalculation from '../components/DetailedCalculation';

export default function HomePage() {
  const [length, setLength] = useState(10);
  const [supports, setSupports] = useState([ { type: 'pin', position: 0 }, { type: 'roller', position: 10 } ]);
  const [loads, setLoads] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleBeamChange({ supports: newSupports, loads: newLoads }) {
    setSupports(newSupports || supports);
    setLoads(newLoads || loads);
  }

  function handleLengthChange(e) {
    const val = Number(e.target.value);
    setLength(val);
    // Reset supports/loads to fit new length
    setSupports([ { type: 'pin', position: 0 }, { type: 'roller', position: val } ]);
    setLoads([]);
  }

  async function handleAnalyze() {
    setLoading(true);
    const res = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ length, supports, loads })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main className="max-w-7xl mx-auto p-2 sm:p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Structural Beam Analysis Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-sm sm:text-base">
          Interactive tool for analyzing shear force and bending moment in beams. Visualize, calculate, and understand beam behavior under various loading conditions.
        </p>
      </div>
      
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">Beam Length (m):</label>
          <input 
            type="number" 
            value={length} 
            min={1} 
            max={100} 
            step={0.1} 
            onChange={handleLengthChange} 
            className="border px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl w-24 sm:w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm" 
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Current: {length} meters
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
            <BeamCanvasInput length={length} supports={supports} loads={loads} onChange={handleBeamChange} />
          </div>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 text-white">
            <h2 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
              <li>Adjust the beam length using the input above</li>
              <li>Select a tool from the palette (supports or loads)</li>
              <li>Click on the beam to place items</li>
              <li>Modify positions and values in the edit panels</li>
              <li>Click &quot;Analyze Beam&quot; to calculate results</li>
            </ol>
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-500/20 rounded-lg">
              <p className="font-medium text-xs sm:text-sm">💡 Tip:</p>
              <p className="text-xs">For UDL and triangular loads, click twice on the beam to define the start and end positions.</p>
            </div>
          </div>
          
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-lg transform transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            {loading ? (
              <span className="flex items-center text-xs sm:text-sm">
                <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating...
              </span>
            ) : (
              <span className="flex items-center text-xs sm:text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Analyze Beam
              </span>
            )}
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-gray-800 dark:text-white">Beam Configuration</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-sm">Supports ({supports.length})</h3>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {supports.map((support, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-white capitalize text-xs sm:text-sm">{support.type}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">at {support.position}m</span>
                    </div>
                  ))}
                  {supports.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs italic">No supports added</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-sm">Loads ({loads.length})</h3>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {loads.map((load, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-white capitalize text-xs sm:text-sm">{load.type}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {load.type === 'point' || load.type === 'moment' ? `${load.magnitude} at ${load.position}m` : 
                         load.type === 'udl' || load.type === 'triangular' ? `${load.magnitude} from ${load.start}m to ${load.end}m` : 
                         `${load.magnitude}`}
                      </span>
                    </div>
                  ))}
                  {loads.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs italic">No loads applied</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {result && (
        <div className="mt-6 sm:mt-8">
          <DetailedCalculation data={result} beamData={{ length, supports, loads }} />
          <Diagram {...result} />
        </div>
      )}
      
      <footer className="mt-8 sm:mt-12 text-center text-gray-600 dark:text-gray-400 text-xs py-4 sm:py-6">
        <p>Structural Beam Analysis Tool • For educational purposes</p>
        <p className="mt-1">Uses principles of structural mechanics and equilibrium equations</p>
      </footer>
    </main>
  );
}