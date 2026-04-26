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
    <div className="min-h-screen bg-[#0A0F2C] p-6 md:p-12 font-sans text-slate-200">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">ECG Monitoring</h1>
            <p className="text-slate-400 mt-2 text-lg">Real-time heart rate and stress insights.</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-full font-bold text-white bg-[#1e293b] hover:opacity-90 transition-all shadow-lg"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-full font-bold text-white bg-[#10b981] hover:opacity-90 transition-all shadow-lg"
            >
              Register
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full font-bold text-white bg-[#5C66A3] hover:opacity-90 transition-all shadow-lg"
            >
              Dashboard →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* ECG LIVE FEED BLOCK */}
            <div className="bg-[#5C66A3] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-6">ECG Live Feed</h2>
              <div className="h-80 w-full bg-[#020617] rounded-[1.5rem] relative overflow-hidden shadow-inner border border-slate-900/40">
                {isECGStreaming ? (
                  <ECGChart ecgData={ecgData} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-medium">
                    Waiting for stream...
                  </div>
                )}
              </div>
            </div>

            {/* HEART RATE MONITOR */}
            <div className="bg-[#5C66A3] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
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
          </div>

          {/* Right Column: Controls & Status */}
          <div className="space-y-8">
            <div className="bg-[#5C66A3] p-8 rounded-[2rem] text-white shadow-2xl">
              <h3 className="font-bold text-lg mb-6">Device Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isConnected ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                  <span className="text-sm">
                    {isConnected ? "Device Connected" : "Device Disconnected"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isECGStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                    }`}
                  />
                  <span className="text-sm">
                    {isECGStreaming ? "Monitoring Active" : "Monitoring Inactive"}
                  </span>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-rose-950/20 border border-rose-500/20 rounded-lg">
                    <p className="text-rose-300/70 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#5C66A3]/70 p-8 rounded-[2rem] border border-white/10 text-sm text-white">
              <h3 className="font-bold text-lg mb-6">Quick Tips</h3>
              <ul className="space-y-4 font-medium">
                <li className="flex gap-3">
                  <span className="text-emerald-400 font-bold">→</span> Sit upright for accurate readings.
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400 font-bold">→</span> Dampen strap electrodes for better signal.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
