"use client";
import React, { useState, useEffect } from "react";

interface MonitorControlsProps {
  isConnected: boolean;
  isECGStreaming: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  startECGStream: () => Promise<void>;
  stopECGStream: () => void;
  error: string | null;
  heartRate: number | null;
  ecgData?: { timestamp: number }[];
  onStressUpdate?: (level: string) => void;   // NEW callback
}

const HeartRateMonitor: React.FC<MonitorControlsProps> = ({
  isConnected,
  isECGStreaming,
  connect,
  disconnect,
  startECGStream,
  stopECGStream,
  error,
  heartRate,
  ecgData = [],
  onStressUpdate,
}) => {
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);

  const [hrValues, setHrValues] = useState<number[]>([]);
  const [avgHR, setAvgHR] = useState<number>(0);
  const [maxHR, setMaxHR] = useState<number>(0);
  const [avgHRV, setAvgHRV] = useState<number>(0);
  const [stressLevel, setStressLevel] = useState<string>("Normal");

  const [notes, setNotes] = useState<string>("");

  function startSession() {
    setSessionStart(Date.now());
    setHrValues([]);
  }

  function endSession() {
    if (sessionStart) {
      const duration = Math.floor((Date.now() - sessionStart) / 1000);
      setSessionDuration(duration);
    }
    stopECGStream();
  }

  useEffect(() => {
    if (heartRate) {
      setHrValues((prev) => {
        const updated = [...prev, heartRate];
        setAvgHR(updated.reduce((a, b) => a + b, 0) / updated.length);
        setMaxHR(Math.max(...updated));
        return updated;
      });
    }
  }, [heartRate]);

  useEffect(() => {
    if (ecgData.length > 2) {
      const rrIntervals = ecgData.map((d, i, arr) =>
        i > 0 ? d.timestamp - arr[i - 1].timestamp : 0
      );
      const validRR = rrIntervals.filter((r) => r > 0);
      if (validRR.length > 0) {
        const avg = validRR.reduce((a, b) => a + b, 0) / validRR.length;
        setAvgHRV(avg);

        let level = "Normal";
        if (avg < 20) level = "Critical";
        else if (avg < 50) level = "High";
        else if (avg < 80) level = "Medium";
        else level = "Low";

        setStressLevel(level);
        if (onStressUpdate) onStressUpdate(level);   // 🔹 send update up
      }
    }
  }, [ecgData, onStressUpdate]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Heart Rate & ECG Monitor
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!isConnected ? (
          <button
            onClick={connect}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
          >
            Connect to Polar H10
          </button>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">Heart Rate:</span>
              <span className="text-2xl font-bold text-blue-600">
                {heartRate ? `${heartRate} BPM` : "Waiting for data..."}
              </span>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mt-4">
              <p>Average HR: {avgHR.toFixed(1)} BPM</p>
              <p>Max HR: {maxHR} BPM</p>
              <p>Average HRV: {avgHRV.toFixed(1)} ms</p>
              <p>Stress Level: {stressLevel}</p>
              <p>Session Duration: {sessionDuration}s</p>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this session..."
              className="w-full border rounded p-2 mt-4"
            />

            <div className="flex space-x-4 mt-4">
              <button
                onClick={disconnect}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
              >
                Disconnect
              </button>

              {!isECGStreaming ? (
                <button
                  onClick={startECGStream}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                >
                  Start ECG Stream
                </button>
              ) : (
                <button
                  onClick={stopECGStream}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full"
                >
                  Stop ECG Stream
                </button>
              )}
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={startSession}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Start Session
              </button>
              <button
                onClick={endSession}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                End Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateMonitor;
