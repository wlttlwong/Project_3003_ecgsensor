"use client"
import React from 'react';
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import { getStressLabel, calculateStressScore } from './utils/ecgAnalysis';
import { downloadAndSaveSession } from './utils/exportData';

export default function Home() {
  const {
    connect, disconnect, startECGStream, togglePaused, isPaused,
    heartRate, ecgData, rmssd, sessionSeconds, isConnected, isECGStreaming, qualityError
  } = useHeartRateSensor();

  const stressData = getStressLabel(rmssd);
  const stressScore = calculateStressScore(rmssd);

  const statusColor = stressScore <= 30 ? 'emerald' : stressScore <= 70 ? 'amber' : 'rose';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExport = async () => {
    // prepare payload...
    await downloadAndSaveSession(ecgData, {
      activity_type: "Rest",
      duration: sessionSeconds,
      hr_avg: 0, hr_max: 0, avg_hrv: Math.round(rmssd)
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0F2C] p-6 md:p-12 font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Live Monitoring</h1>
            <p className="text-slate-400 mt-2 text-lg">Real-time ECG and stress insights.</p>
          </div>
          <button onClick={isConnected ? disconnect : connect} className={`px-6 py-3 rounded-full font-bold transition-all shadow-lg border ${isConnected ? 'bg-[#1e293b]/50 text-rose-300' : 'bg-[#10b981] text-white'}`}>
            {isConnected ? 'Disconnect H10' : 'Connect Polar H10'}
          </button>
        </div>

        {qualityError && isECGStreaming && !isPaused && (
          <div className="bg-rose-950/20 border border-rose-500/20 p-5 rounded-[1.5rem] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white">!</div>
            <p className="text-rose-300/70 text-sm">{qualityError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- UPDATED: ECG LIVE FEED BLOCK (#5C66A3) --- */}
            <div className="bg-[#5C66A3] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white">ECG Live Feed</h2>
                  <div className="flex gap-3">
                    {isECGStreaming && (
                      <button onClick={togglePaused} className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                    )}
                    {!isECGStreaming && (
                      <button onClick={startECGStream} disabled={!isConnected} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${isConnected ? 'bg-[#10b981] text-white' : 'bg-slate-300 text-slate-600'}`}>
                        Start Monitoring
                      </button>
                    )}
                  </div>
               </div>

               {/* Chart background stays dark for contrast */}
               <div className="h-80 w-full bg-[#020617] rounded-[1.5rem] relative overflow-hidden shadow-inner border border-slate-900/40">
                  {isECGStreaming ? (
                    <ECGChart ecgData={ecgData} isPaused={isPaused} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">Waiting for stream...</div>
                  )}
               </div>
            </div>

            {/* --- UPDATED: METRICS BENTO BLOCK (#5C66A3) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <MetricItem label="Session Time" value={formatTime(sessionSeconds)} />
               <MetricItem label="Live HRV" value={rmssd.toFixed(0)} unit="ms" />
               <MetricItem label="Heart Rate" value={heartRate || '--'} unit="bpm" />
            </div>
          </div>

          {/* Right Column: Stress Insight */}
          <div className="space-y-8">
            {/* --- UPDATED: STRESS INSIGHT BLOCK (#5C66A3) --- */}
            <div className="bg-[#5C66A3] p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⭐</span>
                      <h3 className="font-bold text-lg">Stress Insight</h3>
                    </div>
                    {isECGStreaming && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md animate-pulse bg-${statusColor}-500/20 text-${statusColor}-400`}>
                        LIVE
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center py-4">
                    {/* Gauge ring stays dark navy background */}
                    <div className="relative flex items-center justify-center w-40 h-40 mb-6">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-[#1e293b]" />
                        <circle
                          cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * stressScore) / 100}
                          strokeLinecap="round"
                          className={`transition-all duration-1000 ease-out text-${statusColor}-400`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black text-${statusColor}-400`}>{rmssd === 0 ? '--' : stressScore}</span>
                        <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Stress Level</span>
                      </div>
                    </div>

                    <p className={`text-2xl font-bold tracking-tight mb-2 text-${statusColor}-400`}>{stressData.label}</p>
                    <p className="text-white text-xs text-center px-4 leading-relaxed font-medium">
                      {rmssd === 0 ? "Establishing baseline variability..." : "Your body is relaxed and recovering well."}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/20">
                    {/* Save button background stays dark navy contrast */}
                    <button onClick={handleSaveAndExport} disabled={!isECGStreaming} className="w-full bg-[#1e293b] hover:opacity-90 disabled:opacity-30 text-white py-4 rounded-full font-bold text-lg shadow-xl">
                      Save & Export Session
                    </button>
                  </div>
               </div>
               <div className={`absolute -bottom-20 -right-20 w-64 h-64 bg-${statusColor}-500/10 rounded-full blur-3xl transition-colors duration-1000`}></div>
            </div>

            {/* --- UPDATED: TIPS BLOCK (#5C66A3 with transparency) --- */}
            <div className="bg-[#5C66A3]/70 p-8 rounded-[2rem] border border-white/10 text-sm text-white">
               <h3 className="font-bold text-lg mb-6">Quick Tips</h3>
               <ul className="space-y-4 font-medium">
                 <li className="flex gap-3"><span className="text-emerald-400 font-bold">→</span> Sit upright for accurate HRV.</li>
                 <li className="flex gap-3"><span className="text-emerald-400 font-bold">→</span> Dampen strap electrodes for better signal.</li>
               </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value, unit }: { label: string, value: string | number, unit?: string }) {
  return (
    <div className="bg-[#5C66A3] p-6 rounded-[1.5rem] shadow-xl">
      <p className="text-[#1e293b] text-sm font-black uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value} {unit && <span className="text-lg text-[#1e293b] font-black ml-1">{unit}</span>}</p>
    </div>
  );
}