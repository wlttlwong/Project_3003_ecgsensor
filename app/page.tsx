"use client"
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';

export default function Home() {
  const {
    connect, disconnect, startECGStream, stopECGStream, togglePaused,
    isPaused, heartRate, ecgData, error, isConnected, isECGStreaming
  } = useHeartRateSensor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-8">
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

      {isECGStreaming && (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-4 rounded-lg shadow-inner relative">
          {/* PAUSE BUTTON UI */}
          <div className="flex justify-end mb-2">
            <button
              onClick={togglePaused}
              className={`px-4 py-1 rounded text-sm font-bold transition-colors ${
                isPaused
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isPaused ? "RESUME" : "PAUSE"}
            </button>
          </div>

          {/* Updated ECGChart with the required isPaused prop */}
          <ECGChart ecgData={ecgData} isPaused={isPaused} />
        </div>
      )}
    </div>
  );
}
