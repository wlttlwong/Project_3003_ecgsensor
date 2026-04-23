"use client"
import React, { useState } from 'react';
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import { getStressLabel } from './utils/ecgAnalysis';
import { downloadAndSaveSession } from './utils/exportData';

export default function Home() {
  const {
    connect, 
    disconnect, 
    startECGStream, 
    stopECGStream,
    togglePaused,
    isPaused,
    heartRate, 
    ecgData, 
    rmssd,
    sessionSeconds,
    error, 
    isConnected, 
    isECGStreaming,
    qualityError
  } = useHeartRateSensor();

  const stressData = getStressLabel(rmssd);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExport = async () => {
    const hrValues = ecgData.map(d => heartRate || 0).filter(v => v > 0);
    const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b) / hrValues.length) : 0;
    const maxHr = hrValues.length > 0 ? Math.max(...hrValues) : 0;

    await downloadAndSaveSession(ecgData, {
      activity_type: "Rest",
      duration: sessionSeconds,
      hr_avg: avgHr,
      hr_max: maxHr,
      avg_hrv: Math.round(rmssd)
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Monitoring</h1>
            <p className="text-slate-500 mt-1">Real-time ECG and HRV analysis.</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            {isConnected ? '● Bluetooth Connected' : 'Bluetooth Unavailable'}
          </div>
        </div>

        {/* Connection Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <HeartRateMonitor
            isConnected={isConnected} isECGStreaming={isECGStreaming}
            connect={connect} disconnect={disconnect}
            startECGStream={startECGStream} stopECGStream={stopECGStream}
            error={error} heartRate={heartRate}
          />
        </div>

        {/* Simulation Mode Bypass */}
        {!isConnected && !isECGStreaming && (
          <button onClick={startECGStream} className="w-full p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 text-slate-500 font-bold hover:bg-slate-100 transition-all">
            Launch Live Simulator
          </button>
        )}

        {isECGStreaming && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* NOISE ALERT BANNER */}
            {qualityError && !isPaused && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-4 animate-bounce">
                <div className="bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">!</div>
                <div>
                  <p className="text-rose-800 font-bold text-sm">Signal Quality Alert</p>
                  <p className="text-rose-600 text-xs">{qualityError}</p>
                </div>
              </div>
            )}

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Duration" value={formatTime(sessionSeconds)} isPaused={isPaused} />
              <MetricCard label="Current HR" value={heartRate || '--'} unit="bpm" />
              <MetricCard label="Live HRV" value={rmssd.toFixed(0)} unit="ms" />
              
              <button onClick={handleSaveAndExport} className="bg-[#10b981] text-white p-6 rounded-[1.5rem] hover:bg-[#059669] transition-all flex flex-col justify-center items-center shadow-md">
                <span className="text-xs font-bold uppercase opacity-80 mb-1">Save Session</span>
                <span className="text-xl font-bold">Export .CSV</span>
              </button>
            </div>

            {/* ECG Chart Feed */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-slate-900">ECG Live Feed</h2>
                <button onClick={togglePaused} className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${isPaused ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
              </div>

              <div className="h-80 w-full bg-slate-950 rounded-[1.5rem] overflow-hidden relative shadow-inner">
                {isPaused && (
                  <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-xl font-bold">Stream Paused</div>
                  </div>
                )}
                <ECGChart ecgData={ecgData} isPaused={isPaused} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple internal component for the metrics
function MetricCard({ label, value, unit, isPaused }: any) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
      <p className="text-sm font-medium text-slate-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${isPaused ? 'text-slate-300' : 'text-slate-900'}`}>{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}