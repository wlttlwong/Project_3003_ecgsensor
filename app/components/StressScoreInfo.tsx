"use client";
import React from "react";

const StressScoreInfo: React.FC = () => {
  const scores = [
    { label: "Critical", description: "Very high stress, immediate relaxation needed.", color: "text-red-600" },
    { label: "Mediocre", description: "Moderate stress, manageable with breaks or breathing.", color: "text-yellow-600" },
    { label: "Great", description: "Low stress, balanced and coping well.", color: "text-green-600" },
    { label: "Amazing", description: "Minimal stress, calm and focused.", color: "text-blue-600" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Understanding Stress Scores</h1>
      <div className="space-y-4 w-full max-w-md">
        {scores.map((s) => (
          <div key={s.label} className="bg-white shadow rounded p-4">
            <p className={`text-lg font-bold ${s.color}`}>{s.label}</p>
            <p className="text-gray-700 text-sm mt-1">{s.description}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => (window.location.href = "/summary")}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-full shadow"
      >
        Back to Summary
      </button>
    </div>
  );
};

export default StressScoreInfo;
