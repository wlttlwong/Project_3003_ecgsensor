"use client"
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import { getStressLabel } from './utils/ecgAnalysis';
import { downloadECGData } from './utils/exportData';

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
    isECGStreaming
  } = useHeartRateSensor();

  const stressData = getStressLabel(rmssd);

  // Formats time to MM:SS as seen in the team's dashboard tables
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section following the team's "Dashboard" style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Monitoring</h1>
            <p className="text-slate-500 mt-1 max-w-md">
              Real-time ECG and HRV analysis — part of your personalized fitness insights.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}>
                {isConnected ? '● Bluetooth Connected' : 'Bluetooth Unavailable'}
              </div>
          </div>
        </div>

        {/* Connection Control Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <HeartRateMonitor
            isConnected={isConnected}
            isECGStreaming={isECGStreaming}
            connect={connect}
            disconnect={disconnect}
            startECGStream={startECGStream}
            stopECGStream={stopECGStream}
            error={error}
            heartRate={heartRate}
          />
        </div>

        {/* Simulation Mode Section */}
        {!isConnected && !isECGStreaming && (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 text-center animate-in fade-in duration-500">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mx-auto border border-slate-100">
                <span className="text-xl">🧪</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">No Device Detected?</h3>
                <p className="text-sm text-slate-500">Launch the simulator to test chart rendering and HRV metrics without hardware.</p>
              </div>
              <button 
                onClick={startECGStream}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
              >
                Launch Live Simulator
              </button>
            </div>
          </div>
        )}

        {isECGStreaming && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Metrics Bento Grid following the team's "Trends" cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Duration Card */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-400 mb-1">Duration</p>
                <p className={`text-3xl font-bold ${isPaused ? 'text-slate-300' : 'text-slate-900'}`}>
                  {formatTime(sessionSeconds)}
                </p>
              </div>

              {/* Heart Rate Card */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-400 mb-1">Current HR</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{heartRate || '--'}</span>
                  <span className="text-sm font-semibold text-slate-400">bpm</span>
                </div>
              </div>

              {/* HRV Card */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
                <p className="text-sm font-medium text-slate-400 mb-1">Live HRV</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{rmssd.toFixed(0)}</span>
                  <span className="text-sm font-semibold text-slate-400">ms</span>
                </div>
              </div>

              {/* Export Button following team button style */}
              <button 
                onClick={() => downloadECGData(ecgData)}
                className="bg-[#10b981] text-white p-6 rounded-[1.5rem] hover:bg-[#059669] transition-all flex flex-col justify-center items-center shadow-md shadow-emerald-100 group"
              >
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Save Session</span>
                <span className="text-xl font-bold">Export .CSV</span>
              </button>
            </div>

            {/* Live ECG Feed Card */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">ECG Live Feed</h2>
                  <p className="text-sm text-slate-400">130Hz Sampling Rate — Filtered Signal</p>
                </div>
                
                <button 
                  onClick={togglePaused}
                  className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 border ${
                    isPaused 
                    ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-100' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isPaused ? "▶ Resume Stream" : "⏸ Pause Stream"}
                </button>
              </div>

              {/* Chart Container with specific dark mode styling */}
              <div className="h-80 w-full bg-slate-950 rounded-[1.5rem] overflow-hidden relative shadow-inner">
                {isPaused && (
                  <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-xl">
                      <span className="text-slate-900 text-sm font-bold tracking-tight">Stream Paused</span>
                    </div>
                  </div>
                )}
                
                <ECGChart ecgData={ecgData} isPaused={isPaused} />
              </div>
              
              {/* Stress Score Insight */}
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white shadow-sm text-2xl`}>
                  {stressData.label === 'Relaxed' ? '😎' : stressData.label === 'Moderate' ? '😐' : '😰'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Stress Insight</p>
                  <p className={`text-lg font-bold ${stressData.color}`}>
                    Current state is {stressData.label} — based on your live HRV.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}