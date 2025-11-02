import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Diagram({ xArr, V, M, maxShear, minShear, maxMoment, minMoment, reactions }) {
  // Format numbers for display
  const fmt = (num) => Number(num.toFixed(2));

  const shearData = {
    labels: xArr.map(x => fmt(x)),
    datasets: [
      {
        label: 'Shear Force (V)',
        data: V,
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      },
    ],
  };
  
  const momentData = {
    labels: xArr.map(x => fmt(x)),
    datasets: [
      {
        label: 'Bending Moment (M)',
        data: M,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151', // gray-700
          font: {
            size: 10,
            family: "'Inter', sans-serif",
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 10,
          family: "'Inter', sans-serif",
          weight: 'bold'
        },
        bodyFont: {
          size: 9,
          family: "'Inter', sans-serif"
        },
        padding: 8,
        cornerRadius: 4,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(context.parsed.y);
              label += context.datasetIndex === 0 ? ' kN' : ' kN·m';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Position along beam (m)',
          color: '#374151',
          font: {
            size: 10,
            weight: 'bold',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Inter', sans-serif",
            size: 8
          }
        }
      },
      y: {
        title: {
          display: true,
          text: function(context) {
            return context.scale.type === 'linear' ? 'Shear Force (kN)' : 'Bending Moment (kN·m)';
          },
          color: '#374151',
          font: {
            size: 10,
            weight: 'bold',
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6B7280',
          font: {
            family: "'Inter', sans-serif",
            size: 8
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {/* Shear Force Diagram */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
          <div>
            <h2 className="font-bold text-base sm:text-xl text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5 text-sm">🔻</span> Shear Force Diagram (SFD)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs">Shows internal shear force along the beam</p>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-wrap gap-1 sm:gap-2">
            <div className="bg-red-100 dark:bg-red-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-red-200 dark:border-red-800">
              <span className="text-red-800 dark:text-red-200 font-bold text-xs">
                Max: {fmt(maxShear)} kN
              </span>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-red-200 dark:border-red-800">
              <span className="text-red-800 dark:text-red-200 font-bold text-xs">
                Min: {fmt(minShear)} kN
              </span>
            </div>
          </div>
        </div>
        
        <div className="h-48 sm:h-64 md:h-72">
          <Line data={shearData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                title: {
                  ...chartOptions.scales.y.title,
                  text: 'Shear Force (kN)'
                }
              }
            }
          }} />
        </div>
        
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-sm sm:text-base text-blue-800 dark:text-blue-200 mb-1">Understanding SFD</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
            <li>Shear force is the internal force that tends to cause sliding failure along a plane parallel to the direction of the force</li>
            <li>Positive shear causes clockwise rotation of the beam segment</li>
            <li>Negative shear causes counter-clockwise rotation of the beam segment</li>
          </ul>
        </div>
      </div>
      
      {/* Bending Moment Diagram */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
          <div>
            <h2 className="font-bold text-base sm:text-xl text-gray-800 dark:text-white flex items-center">
              <span className="mr-1.5 text-sm">📐</span> Bending Moment Diagram (BMD)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs">Shows internal bending moment along the beam</p>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-wrap gap-1 sm:gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="text-blue-800 dark:text-blue-200 font-bold text-xs">
                Max: {fmt(maxMoment)} kN·m
              </span>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              <span className="text-blue-800 dark:text-blue-200 font-bold text-xs">
                Min: {fmt(minMoment)} kN·m
              </span>
            </div>
          </div>
        </div>
        
        <div className="h-48 sm:h-64 md:h-72">
          <Line data={momentData} options={{
            ...chartOptions,
            scales: {
              ...chartOptions.scales,
              y: {
                ...chartOptions.scales.y,
                title: {
                  ...chartOptions.scales.y.title,
                  text: 'Bending Moment (kN·m)'
                }
              }
            }
          }} />
        </div>
        
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-bold text-sm sm:text-base text-purple-800 dark:text-purple-200 mb-1">Understanding BMD</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-xs">
            <li>Bending moment is the internal moment that causes bending deformation</li>
            <li>Positive moments cause tension on the bottom of the beam (sagging)</li>
            <li>Negative moments cause tension on the top of the beam (hogging)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}