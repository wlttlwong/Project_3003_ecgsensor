"use client";

import Link from "next/link";

import ECGChart from "./components/ECGChart";
import HeartRateMonitor from "./components/HeartRateMonitor";
import { useHeartRateSensor } from "./hooks/useHeartRateSensor";

export default function Home() {
  const {
    connect,
    disconnect,
    startECGStream,
    stopECGStream,
    heartRate,
    ecgData,
    error,
    isConnected,
    isECGStreaming,
  } = useHeartRateSensor();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 p-8">
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap justify-end gap-4 text-sm">
        <Link href="/login" className="font-medium text-slate-700 hover:underline">
          Sign in
        </Link>
        <Link
          href="/register"
          className="font-medium text-slate-700 hover:underline"
        >
          Register
        </Link>
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
          Dashboard -&gt;
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
        <div className="mx-auto mt-8 max-w-4xl rounded-lg bg-white p-4 shadow-inner">
          <ECGChart ecgData={ecgData} />
        </div>
      )}
    </div>
  );
}
