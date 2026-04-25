"use client";
import { useState } from "react";
import { useHeartRateSensor } from "./hooks/useHeartRateSensor";
import HeartRateMonitor from "./components/HeartRateMonitor";
import ECGChart from "./components/ECGChart";
import LiveFeedback from "./components/LiveFeedback";
import SessionSummary from "./components/SessionSummary";

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

  // Toggle between live monitoring and summary view
  const [showSummary, setShowSummary] = useState(true); // 🔹 start with summary visible

  // Temporary example data for preview
  const [summaryData] = useState({
    duration: 45,
    avgHR: 78,
    maxHR: 120,
    avgHRV: 65,
    stressScore: 72,
    stressLevel: "High" as "Low" | "Medium" | "High" | "Critical",
    notes: "Felt focused during the session.",
    breathingCount: 2,
    stretchingCount: 1,
  });

  return (
    <div className="min-h-screen bg-[#0A0F2C] p-8 font-sans text-white">
      {showSummary && summaryData ? (
        <SessionSummary
          duration={summaryData.duration}
          avgHR={summaryData.avgHR}
          maxHR={summaryData.maxHR}
          avgHRV={summaryData.avgHRV}
          stressScore={summaryData.stressScore}
          stressLevel={summaryData.stressLevel}
          notes={summaryData.notes}
          breathingCount={summaryData.breathingCount}
          stretchingCount={summaryData.stretchingCount}
          onBack={() => setShowSummary(false)} // 🔹 go back to live monitoring
        />
      ) : (
        <>
          {/* Device control panel */}
          <HeartRateMonitor
            isConnected={isConnected}
            isECGStreaming={isECGStreaming}
            connect={connect}
            disconnect={disconnect}
            startECGStream={startECGStream}
            stopECGStream={stopECGStream}
            error={error}
            heartRate={heartRate}
            ecgData={ecgData}
          />

          {/* ECG chart */}
          {isECGStreaming && (
            <div className="max-w-4xl mx-auto mt-8 bg-[#5C66A3] p-4 rounded-lg shadow-inner">
              <ECGChart ecgData={ecgData} />
            </div>
          )}

          {/* Live feedback features */}
          <div className="max-w-4xl mx-auto mt-8">
            <LiveFeedback />
          </div>
        </>
      )}
    </div>
  );
}
