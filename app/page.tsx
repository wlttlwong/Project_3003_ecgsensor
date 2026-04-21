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

  // Helper to format 75 seconds -> "01:15"
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 text-zinc-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 1. Connection & Control Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black tracking-tight">Biometric Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
              <span className="text-xs font-bold uppercase text-zinc-500">
                {isConnected ? 'Polar H10 Connected' : 'Device Disconnected'}
              </span>
            </div>
          </div>

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
        
        {/* Simulation Bypass */}
        {!isConnected && !isECGStreaming && (
          <div className="p-4 border-2 border-dashed border-amber-200 rounded-2xl bg-amber-50/50 text-center">
            <button 
              onClick={startECGStream}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
              Launch UI Test Simulator
            </button>
          </div>
        )}

        {isECGStreaming && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 2. Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Timer Card */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Session</p>
                <p className="text-2xl font-black font-mono">{formatTime(sessionSeconds)}</p>
              </div>

              {/* HRV Card */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">HRV (RMSSD)</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{rmssd.toFixed(0)}</span>
                  <span className="text-xs font-bold text-zinc-400">ms</span>
                </div>
              </div>

              {/* Stress Card */}
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Stress</p>
                <p className={`text-lg font-black ${stressData.color}`}>{stressData.label}</p>
              </div>

              {/* Export Button */}
              <button 
                onClick={() => downloadECGData(ecgData)}
                className="bg-zinc-900 text-white p-4 rounded-2xl hover:bg-zinc-800 transition-all flex flex-col justify-center items-center group shadow-lg"
              >
                <span className="text-[10px] font-black uppercase opacity-60 group-hover:opacity-100">Export Session</span>
                <span className="text-lg font-black">.CSV</span>
              </button>
            </div>

            {/* 3. Live ECG Feed */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-black text-zinc-800 uppercase tracking-tight">ECG Live Feed</h2>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Real-time 130Hz DSP Filtered</p>
                </div>
                
                <button 
                  onClick={togglePaused}
                  className={`px-8 py-2 rounded-xl font-black text-xs transition-all active:scale-95 shadow-sm ${
                    isPaused 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                </button>
              </div>

              <div className="h-72 w-full bg-zinc-950 rounded-xl overflow-hidden border-4 border-zinc-900 shadow-inner">
                <ECGChart ecgData={ecgData} isPaused={isPaused} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}