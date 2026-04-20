"use client"
import Link from "next/link";
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';

export default function Home() {
  const {
    connect, disconnect, startECGStream, stopECGStream,
    heartRate, ecgData, error, isConnected, isECGStreaming
  } = useHeartRateSensor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-end">
        <Link
          href="/dashboard"
          className="text-blue-700 hover:underline font-medium"
        >
          Dashboard →
        </Link>
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
      
      {isECGStreaming && (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-4 rounded-lg shadow-inner">
          <ECGChart ecgData={ecgData} />
        </div>
      )}
    </div>
  );
}
