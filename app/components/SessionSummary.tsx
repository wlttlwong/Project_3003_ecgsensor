"use client";
import React, { useState } from "react";
import { ArcElement, Chart as ChartJS } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement);

interface SessionSummaryProps {
  avgHR: number;
  maxHR: number;
  avgHRV: number; // This is the RMSSD value
  duration: number; // Expected in seconds
  stressScore: number;
  // Updated to match your new RMSSD logic labels
  stressLevel: "Relaxed" | "Moderate" | "High Stress" | "Critical"; 
  notes?: string;
  breathingCount?: number;
  stretchingCount?: number;
  onBack: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  avgHR,
  maxHR,
  avgHRV,
  duration,
  stressScore,
  stressLevel,
  notes = "",
  breathingCount = 0,
  stretchingCount = 0,
  onBack,
}) => {
  const [userNotes, setUserNotes] = useState(notes);

  // Helper to format seconds into MM:SS
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Colors synced with your new logic
  const arcColors: Record<string, string> = {
    Relaxed: "#10b981",     // emerald-500
    Moderate: "#f59e0b",    // amber-500
    "High Stress": "#ef4444", // red-500
    Critical: "#7f1d1d",    // dark red
  };

  const chartData = {
    labels: ["Stress Score", "Remaining"],
    datasets: [
      {
        data: [stressScore, 100 - stressScore],
        backgroundColor: [arcColors[stressLevel] || "#6366f1", "transparent"],
        borderColor: [arcColors[stressLevel] || "#6366f1", "rgba(255,255,255,0.1)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    rotation: -90,
    circumference: 180,
    cutout: "85%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
  };

  const levelColors: Record<string, string> = {
    Relaxed: "text-emerald-400",
    Moderate: "text-amber-400",
    "High Stress": "text-rose-500",
    Critical: "text-rose-700",
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0F2C] flex flex-col items-center font-sans text-white p-6 md:p-10">
      <h2 className="text-4xl font-bold mb-4 tracking-tight">Session Summary</h2>
      <p className="text-slate-400 mb-8">Detailed physiological analysis of your trial.</p>

      {/* Stress Score semicircle */}
      <div className="relative flex flex-col items-center mb-10">
        <div className="w-72 h-48 md:w-96 md:h-64">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        {/* Overlayed score + labels */}
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-[20px] md:translate-y-[40px]">
          <span className="text-6xl md:text-7xl font-extrabold text-white">
            {Math.round(stressScore)}
          </span>
          <span className="text-[10px] text-gray-400 tracking-[0.2em] font-bold uppercase mt-1">
            Stress Intensity
          </span>
          <span className={`mt-2 text-2xl md:text-3xl font-black uppercase tracking-tighter ${levelColors[stressLevel]}`}>
            {stressLevel}
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full max-w-4xl">
        <MetricCard label="AVERAGE HEART RATE" value={Math.round(avgHR)} unit="bpm" />
        <MetricCard label="MAX HEART RATE" value={maxHR} unit="bpm" />
        <MetricCard label="AVERAGE RMSSD (HRV)" value={avgHRV.toFixed(1)} unit="ms" />
      </div>

      {/* Duration + Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full max-w-4xl">
        <div className="bg-[#5C66A3]/40 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-[10px] tracking-widest font-bold text-slate-300 mb-2 uppercase">SESSION DURATION</p>
          <p className="text-3xl font-bold">
            <span className="text-white">{formatDuration(duration)}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">MM:SS</p>
        </div>

        <div className="md:col-span-2 bg-[#5C66A3]/40 border border-white/10 rounded-2xl p-6">
          <p className="text-[10px] tracking-widest font-bold text-slate-300 mb-4 text-center uppercase">BIOFEEDBACK ENGAGEMENT</p>
          <div className="flex justify-evenly">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 mb-1">BREATHING</p>
              <p className="text-3xl font-black text-white">{breathingCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">Rounds</p>
            </div>
            <div className="w-[1px] bg-white/10 h-full mx-2"></div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 mb-1">STRETCHING</p>
              <p className="text-3xl font-black text-white">{stretchingCount}</p>
              <p className="text-[10px] text-slate-400 uppercase">Rounds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#5C66A3]/40 border border-white/10 rounded-2xl p-6 w-full max-w-4xl mb-10">
        <p className="text-[10px] tracking-widest font-bold text-slate-300 mb-3 uppercase text-center">SESSION OBSERVATIONS</p>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Enter qualitative data here (e.g. caffeine intake, environmental noise)..."
          className="w-full p-4 rounded-xl bg-[#0A0F2C]/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          rows={3}
        />
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 text-lg font-black uppercase tracking-wider"
      >
        Save & Exit to Dashboard
      </button>
    </div>
  );
};

// Reusable Metric Card for cleaner code
function MetricCard({ label, value, unit }: { label: string, value: string | number, unit: string }) {
  return (
    <div className="bg-[#5C66A3]/40 border border-white/10 rounded-2xl p-6 text-center shadow-lg">
      <p className="text-[10px] tracking-widest font-bold text-slate-300 mb-2 uppercase">{label}</p>
      <p className="text-3xl font-black">
        <span className="text-white">{value}</span>
        <span className="text-slate-400 text-sm ml-1 font-bold">{unit}</span>
      </p>
    </div>
  );
}

export default SessionSummary;
