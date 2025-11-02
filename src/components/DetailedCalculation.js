import React, { useState } from 'react';

export default function DetailedCalculation({ data, beamData }) {
  const [showDetails, setShowDetails] = useState(false);

  // Format numbers for display
  const fmt = (num) => Number(num.toFixed(2));

  // Get sample calculation points
  const getSamplePoints = () => {
    if (!data || !data.xArr || data.xArr.length === 0) return [];
    
    const points = [];
    const step = Math.max(1, Math.floor(data.xArr.length / 10));
    
    for (let i = 0; i < data.xArr.length; i += step) {
      points.push({
        x: data.xArr[i],
        shear: data.V[i],
        moment: data.M[i]
      });
    }
    
    // Always include the last point
    if (points.length === 0 || points[points.length - 1].x !== data.xArr[data.xArr.length - 1]) {
      points.push({
        x: data.xArr[data.xArr.length - 1],
        shear: data.V[data.xArr.length - 1],
        moment: data.M[data.xArr.length - 1]
      });
    }
    
    return points;
  };

  const samplePoints = getSamplePoints();

  // Calculate load information for display
  const getLoadInfo = () => {
    const { loads } = beamData;
    const loadInfo = [];
    
    loads.forEach((load, idx) => {
      if (load.type === 'point') {
        loadInfo.push({
          id: idx,
          type: 'Point Load',
          position: load.position,
          magnitude: load.magnitude,
          description: `Point load of ${load.magnitude} kN at position ${load.position} m`
        });
      } else if (load.type === 'udl') {
        const length = load.end - load.start;
        const totalLoad = load.magnitude * length;
        loadInfo.push({
          id: idx,
          type: 'UDL',
          start: load.start,
          end: load.end,
          magnitude: load.magnitude,
          total: totalLoad,
          description: `UDL of ${load.magnitude} kN/m over ${length} m (total = ${totalLoad} kN) from ${load.start} m to ${load.end} m`
        });
      } else if (load.type === 'moment') {
        loadInfo.push({
          id: idx,
          type: 'Moment',
          position: load.position,
          magnitude: load.magnitude,
          description: `Applied moment of ${load.magnitude} kN·m at position ${load.position} m`
        });
      }
    });
    
    return loadInfo;
  };

  const loadInfo = getLoadInfo();

  return (
    <div className="p-3 sm:p-5 border rounded-xl sm:rounded-2xl mb-5 sm:mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        <h2 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">Detailed Engineering Calculations</h2>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
        >
          {showDetails ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide Calculations
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show Detailed Calculations
            </>
          )}
        </button>
      </div>
      
      {showDetails && (
        <div className="space-y-4 sm:space-y-5 mt-4">
          {/* Equilibrium Equations Section */}
          <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5">⚖️</span> Equilibrium Equations
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <div className="bg-blue-50 dark:bg-gray-600 p-2 sm:p-3 rounded-lg border border-blue-200 dark:border-gray-500">
                <h4 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-200 mb-1">ΣFy = 0 (Vertical Forces)</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  Sum of all vertical forces equals zero
                </p>
                <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-gray-500">
                  <p className="font-mono text-xs">
                    R<sub>A</sub> + R<sub>B</sub> = Σ(All Vertical Loads)
                  </p>
                </div>
              </div>
              <div className="bg-green-50 dark:bg-gray-600 p-2 sm:p-3 rounded-lg border border-green-200 dark:border-gray-500">
                <h4 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-200 mb-1">ΣM = 0 (Moments)</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  Sum of moments about any point equals zero
                </p>
                <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border border-green-200 dark:border-gray-500">
                  <p className="font-mono text-xs">
                    Σ(Moments about A) = 0
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Reactions Section */}
          <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5">🏗️</span> Support Reactions
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-xs">
              Calculated using equilibrium equations: ΣFy = 0 and ΣM = 0
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {data.reactions.map((reaction, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-2 sm:pl-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-600 dark:to-gray-700 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">
                        {reaction.type.charAt(0).toUpperCase() + reaction.type.slice(1)} Support
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-xs">
                        Position: {fmt(reaction.position)} m
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">
                      R<sub>{String.fromCharCode(65 + idx)}</sub>
                    </span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-300 mt-1">
                    {fmt(reaction.value)} kN
                  </p>
                </div>
              ))}
            </div>
            
            {/* Detailed Reaction Calculation */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
              <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white mb-1">Reaction Calculation Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                <li>Calculate total vertical load: ΣFy = {data.reactions.reduce((sum, r) => sum + r.value, 0).toFixed(2)} kN</li>
                <li>Take moments about left support (A) to find right reaction (B)</li>
                <li>Use ΣFy = 0 to find left reaction (A): R<sub>A</sub> = Total Load - R<sub>B</sub></li>
              </ol>
            </div>
          </div>

          {/* Applied Loads Section */}
          <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5">⬇️</span> Applied Loads
            </h3>
            {loadInfo.length > 0 ? (
              <div className="space-y-2">
                {loadInfo.map((load) => (
                  <div key={load.id} className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-500">
                    <div className="flex flex-wrap justify-between gap-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">{load.type}</h4>
                      <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-500 text-gray-800 dark:text-white rounded text-xs">
                        {load.type === 'Point Load' && `📍 ${load.position}m`}
                        {load.type === 'UDL' && `📏 ${load.start}m-${load.end}m`}
                        {load.type === 'Moment' && `🔄 ${load.position}m`}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-xs">{load.description}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded text-xs font-medium">
                        Magnitude: {load.magnitude} {load.type === 'UDL' ? 'kN/m' : load.type === 'Moment' ? 'kN·m' : 'kN'}
                      </span>
                      {load.total && (
                        <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                          Total Load: {load.total} kN
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 italic text-xs">No loads applied to the beam</p>
            )}
          </div>

          {/* Sample Calculations Section */}
          <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5">📊</span> Sample Calculations
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-xs">
              Shear force and bending moment at various points along the beam
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-2 py-1.5 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Position (m)</th>
                    <th className="px-2 py-1.5 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Shear Force (kN)</th>
                    <th className="px-2 py-1.5 sm:px-3 sm:py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bending Moment (kN·m)</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                  {samplePoints.map((point, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs font-medium text-gray-900 dark:text-white">{fmt(point.x)}</td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-red-600 dark:text-red-300 font-medium">{fmt(point.shear)}</td>
                      <td className="px-2 py-1.5 sm:px-3 sm:py-2 whitespace-nowrap text-xs text-blue-600 dark:text-blue-300 font-medium">{fmt(point.moment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Methodology Section */}
          <div className="bg-white dark:bg-gray-700 p-3 sm:p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
            <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5">📘</span> Calculation Methodology
            </h3>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">Shear Force at any point x:</p>
                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                  <p className="font-mono text-xs">
                    V(x) = Σ(Reactions to the left of x) - Σ(Loads to the left of x)
                  </p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">Bending Moment at any point x:</p>
                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                  <p className="font-mono text-xs">
                    M(x) = Σ(Reactions × moment arms) - Σ(Loads × moment arms) - Σ(Applied moments)
                  </p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm">For distributed loads:</p>
                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                  <p className="font-mono text-xs">
                    Equivalent point load = Load intensity × Length<br />
                    Acts at the centroid of the distributed load
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}