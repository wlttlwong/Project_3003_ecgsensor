"use client";
import React, { useState } from "react";
import { ArcElement, Chart as ChartJS } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement);

interface SessionSummaryProps {
  avgHR: number;
  maxHR: number;
  avgHRV: number;
  duration: number;
  stressScore: number;
  stressLevel: "Low" | "Medium" | "High" | "Critical";
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

  const chartData = {
    labels: ["Stress Score", "Remaining"],
    datasets: [
      {
        data: [stressScore, 100 - stressScore],
        backgroundColor: ["#5C66A3", "transparent"],
        borderColor: ["#5C66A3", "#5C66A3"],
        borderWidth: 4, // thin arc
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
  };

  const levelColors: Record<string, string> = {
    Low: "text-green-400",
    Medium: "text-yellow-400",
    High: "text-red-500",
    Critical: "text-red-700",
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0F2C] flex flex-col items-center font-sans text-white p-10">
      <h2 className="text-4xl font-bold">Session Summary</h2>

      {/* Stress Score semicircle with overlay */}
      <div className="relative flex flex-col items-center">
        <div className="w-96 h-96">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        {/* Overlayed score + labels centered inside, nudged down */}
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-[30px]">
          <span className="text-7xl font-extrabold text-white drop-shadow">
            {stressScore}
          </span>
          <span className="text-xs text-gray-300 tracking-wide mt-1">
            STRESS LEVEL
          </span>
          <span className={`mt-1 text-4xl font-bold ${levelColors[stressLevel]}`}>
            {stressLevel}
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-6 mb-6 w-full max-w-4xl text-center">
        <div className="bg-[#5C66A3] rounded-lg p-6">
          <p className="text-xs tracking-wider font-semibold mb-2">
            AVERAGE HEART RATE
          </p>
          <p className="text-2xl font-bold">
            <span className="text-white">{avgHR}</span>{" "}
            <span className="text-[#0A0F2C]">bpm</span>
          </p>
        </div>
        <div className="bg-[#5C66A3] rounded-lg p-6">
          <p className="text-xs tracking-wider font-semibold mb-2">
            MAX HEART RATE
          </p>
          <p className="text-2xl font-bold">
            <span className="text-white">{maxHR}</span>{" "}
            <span className="text-[#0A0F2C]">bpm</span>
          </p>
        </div>
        <div className="bg-[#5C66A3] rounded-lg p-6">
          <p className="text-xs tracking-wider font-semibold mb-2">
            AVERAGE HRV
          </p>
          <p className="text-2xl font-bold">
            <span className="text-white">{avgHRV}</span>{" "}
            <span className="text-[#0A0F2C]">ms</span>
          </p>
        </div>
      </div>

      {/* Duration + Exercises */}
      <div className="grid grid-cols-3 gap-6 mb-6 w-full max-w-4xl">
        <div className="bg-[#5C66A3] rounded-lg p-6 text-center">
          <p className="text-xs tracking-wider font-semibold mb-2">SESSION DURATION</p>
          <p className="text-2xl font-bold">
            <span className="text-white">{duration}</span>{" "}
            <span className="text-[#0A0F2C]">minutes</span>
          </p>
        </div>

        {/* Exercises Completed card */}
        <div className="col-span-2 bg-[#5C66A3] rounded-lg p-6">
          <p className="text-xs tracking-wider font-semibold mb-4 text-center">
            EXERCISES COMPLETED
          </p>
          <div className="flex justify-evenly">
            {/* Breathing */}
            <div className="flex flex-col items-center">
              <p className="text-xs tracking-wider font-semibold mb-2">
                BREATHING
              </p>
              <p className="text-4xl font-extrabold text-white">
                {breathingCount}{" "}
                <span className="text-[#0A0F2C] text-lg font-semibold">
                  rounds
                </span>
              </p>
            </div>
            {/* Stretching */}
            <div className="flex flex-col items-center">
              <p className="text-xs tracking-wider font-semibold mb-2">
                STRETCHING
              </p>
              <p className="text-4xl font-extrabold text-white">
                {stretchingCount}{" "}
                <span className="text-[#0A0F2C] text-lg font-semibold">
                  rounds
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-[#5C66A3] rounded-lg p-6 w-full max-w-4xl mb-10 text-center">
        <p className="text-xs tracking-wider font-semibold mb-2">NOTES</p>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Type your session description..."
          className="w-full p-3 rounded-md text-black"
          rows={4}
        />
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        className="mt-4 px-10 py-4 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 text-lg font-bold"
      >
        Exit to Homepage
      </button>
    </div>
  );
};

export default SessionSummary;
