"use client";
import React from "react";

interface SessionSummaryProps {
  duration: number;
  avgHR: number;
  maxHR: number;
  avgHRV: number;
  stressLevel: string;
  notes: string;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  duration, avgHR, maxHR, avgHRV, stressLevel, notes
}) => (
  <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
    <h1 className="text-3xl font-bold mb-4">Session Summary</h1>
    <div className="bg-white shadow rounded p-6 w-full max-w-md text-center mb-6">
      <p className="text-sm text-gray-500">Overall Stress Level</p>
      <p className="text-2xl font-bold text-blue-600">{stressLevel}</p>
    </div>
    <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
      <div className="bg-white shadow rounded p-4 text-center">
        <p className="text-sm text-gray-500">Avg. HR</p>
        <p className="text-xl font-bold">{avgHR.toFixed(1)} bpm</p>
        <p className="text-xs text-gray-400">Max {maxHR} bpm</p>
      </div>
      <div className="bg-white shadow rounded p-4 text-center">
        <p className="text-sm text-gray-500">Avg. HRV</p>
        <p className="text-xl font-bold">{avgHRV.toFixed(1)} ms</p>
        <p className="text-xs text-gray-400">Duration {duration}s</p>
      </div>
    </div>
    {notes && (
      <div className="bg-white shadow rounded p-4 w-full max-w-md mb-6">
        <p className="text-sm text-gray-500 mb-2">Notes</p>
        <p className="text-gray-700">{notes}</p>
      </div>
    )}
    <button
      onClick={() => (window.location.href = "/dashboard")}
      className="px-6 py-3 bg-blue-500 text-white rounded-full shadow"
    >
      Back to Homepage
    </button>
  </div>
);

export default SessionSummary;
