"use client"
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import { getStressLabel } from './utils/ecgAnalysis';

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
    rmssd, // Pulled from our updated hook
    error, 
    isConnected, 
    isECGStreaming
  } = useHeartRateSensor();

  const stressData = getStressLabel(rmssd);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
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
        
        {!isConnected && !isECGStreaming && (
          <div className="mt-4 p-4 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50 text-center">
            <p className="text-amber-700 text-sm mb-2">Simulation Mode Available</p>
            <button 
              onClick={startECGStream}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md font-bold transition-colors"
            >
              Launch Simulator
            </button>
          </div>
        )}

        {isECGStreaming && (
          <>
            {/* 1. Bioinformatics Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {/* Heart Rate Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Heart Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-zinc-900">{heartRate || '--'}</span>
                  <span className="text-zinc-400 font-medium">BPM</span>
                </div>
              </div>

              {/* HRV Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">HRV (RMSSD)</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-zinc-900">{rmssd.toFixed(0)}</span>
                  <span className="text-zinc-400 font-medium">ms</span>
                </div>
              </div>

              {/* Stress Score Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Stress Level</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${stressData.color}`}>
                    {stressData.label}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ECG Chart Card */}
            <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border border-zinc-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-zinc-800">ECG Live Feed</h2>
                  <p className="text-xs text-zinc-500">Filtered 130Hz Sampling Rate</p>
                </div>
                
                <button 
                  onClick={togglePaused}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    isPaused 
                    ? 'bg-emerald-500 text-white shadow-lg' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
                </button>
              </div>

              <div className="h-64 w-full bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                <ECGChart ecgData={ecgData} isPaused={isPaused} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}