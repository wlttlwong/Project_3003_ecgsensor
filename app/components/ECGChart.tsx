"use client"
import React, { useMemo } from 'react';
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
  const formatTimestamp = (timestamp: number): string => {
    try {
      return new Date(timestamp).toISOString();
    } catch (error) {
      console.error('Invalid timestamp:', timestamp);
      console.error(error);
      return 'Invalid Date';
    }
  };

  const ecgChartData = useMemo(() => {
    const displayData = ecgData.slice(-1000);

    return {
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
  }, [ecgData]);


  const chartOptions = {
    responsive: true,
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
        suggestedMin: -1000,
        suggestedMax: 1000,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  } as const;

  return (
    <div className="relative w-full h-64 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
      {/* Visual Overlay for Paused State */}
      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
          <span className="px-4 py-2 bg-zinc-800 text-white rounded-full text-sm font-bold border border-zinc-700">
            PAUSED
          </span>
        </div>
      )}
      <Line options={chartOptions} data={ecgChartData} />
    </div>
  );
};

export default ECGChart;
