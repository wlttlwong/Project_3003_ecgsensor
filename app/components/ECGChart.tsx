"use client"
import React, { useMemo, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ECGDataPoint {
  timestamp: number;
  value: number;
}

interface ECGChartProps {
  ecgData: ECGDataPoint[];
  isPaused: boolean;
}      

const ECGChart: React.FC<ECGChartProps> = ({ ecgData, isPaused }) => {
  const lastDataRef = useRef<any>(null);

  const ecgChartData = useMemo(() => {
    if (isPaused && lastDataRef.current) {
      return lastDataRef.current;
    }

    const displayData = ecgData.slice(-1000);

    const newData = {
      labels: displayData.map((_, i) => i),
      datasets: [
        {
          label: 'Live ECG Signal',
          data: displayData.map(point => point.value),
          borderColor: '#10b981',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
        },
      ],
    };

    lastDataRef.current = newData;
    return newData;
  }, [ecgData, isPaused]); 


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    animation: false as const,
    spanGaps: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        suggestedMin: -800,
        suggestedMax: 800,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#52525b',
          font: {
            size: 10
          }
        }
      },
    },
  } as const;

  return (
    <div className="relative w-full h-full">
      {/* Visual Overlay for Paused State */}
      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/90 text-white rounded-lg text-xs font-black tracking-widest border border-zinc-700 shadow-2xl">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            PAUSED
          </div>
        </div>
      )}
      <Line options={chartOptions} data={ecgChartData} />
    </div>
  );
};

export default ECGChart;