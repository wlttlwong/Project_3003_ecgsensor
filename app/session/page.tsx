"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ECGChart from "../components/ECGChart";
import LiveFeedback from "../components/LiveFeedback";
import SessionSummary from "../components/SessionSummary";
import { useHeartRateSensor } from "../hooks/useHeartRateSensor";
import { createSession } from "../lib/apiClient";
import { appendSession } from "../lib/sessions";
import type { SessionRecord } from "../types/session";
import {
  calculateStressScore,
  evaluateDataQuality,
  getStressLabel,
} from "../utils/ecgAnalysis";
import { downloadAndSaveSession } from "../utils/exportData";

type SummaryData = {
  duration: number;
  avgHR: number;
  maxHR: number;
  avgHRV: number;
  stressScore: number;
  stressLevel: "Low" | "Medium" | "High" | "Critical";
  notes: string;
  breathingCount: number;
  stretchingCount: number;
};

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
    isECGStreaming,
    qualityError,
    rrIntervals,
  } = useHeartRateSensor();

  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);
  const [heartRateSamples, setHeartRateSamples] = useState<number[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  useEffect(() => {
    if (isECGStreaming && heartRate != null) {
      setHeartRateSamples((samples) => [...samples, heartRate].slice(-1800));
    }
  }, [heartRate, isECGStreaming]);

  const stressData = getStressLabel(rmssd);
  const stressScore = calculateStressScore(rmssd);
  const currentQuality = evaluateDataQuality(rrIntervals || []);
  const avgHeartRate = average(heartRateSamples) ?? heartRate ?? 0;
  const maxHeartRate = heartRateSamples.length > 0 ? Math.max(...heartRateSamples) : heartRate ?? 0;
  const statusTone =
    stressScore <= 30
      ? {
          live: "bg-emerald-500/20 text-emerald-400",
          ring: "text-emerald-400",
          glow: "bg-emerald-500/10",
        }
      : stressScore <= 70
        ? {
            live: "bg-amber-500/20 text-amber-400",
            ring: "text-amber-400",
            glow: "bg-amber-500/10",
          }
        : {
            live: "bg-rose-500/20 text-rose-400",
            ring: "text-rose-400",
            glow: "bg-rose-500/10",
          };

  const stressLevel = stressScore <= 30
    ? "Low"
    : stressScore <= 70
      ? "Medium"
      : stressScore <= 90
        ? "High"
        : "Critical";

  const getStressDescription = (score: number, currentRmssd: number) => {
    if (currentRmssd === 0) return "Establishing baseline variability...";
    if (score <= 30) return "Your body is relaxed and recovering well.";
    if (score <= 70) return "Moderate physiological activity detected. Balance rest and action.";
    return "High strain detected. Try slow, deep breaths to reset your system.";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartMonitoring = async () => {
    setSummaryData(null);
    setHeartRateSamples([]);
    setSessionStartedAt(new Date());
    await startECGStream();
  };

  const buildSessionRecord = (endedAt: Date): SessionRecord => {
    const startedAt = sessionStartedAt ?? new Date(endedAt.getTime() - sessionSeconds * 1000);
    return {
      id: crypto.randomUUID(),
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      sessionType: "rest",
      durationSec: sessionSeconds,
      maxHr: maxHeartRate > 0 ? Math.round(maxHeartRate) : null,
      avgHr: avgHeartRate > 0 ? Math.round(avgHeartRate) : null,
      avgHrvMs: rmssd > 0 ? Math.round(rmssd) : null,
      stressScore: stressScore,
      stressLevel: stressLevel,
      stressSummary: `${stressLevel} stress`,
    };
  };

  const saveSessionRecord = async (record: SessionRecord) => {
    appendSession(record);
    try {
      await createSession(record);
    } catch (err) {
      console.warn("Session saved locally but was not synced to the authenticated API.", err);
    }
  };

  const handleStopRecording = async () => {
    const endedAt = new Date();
    const record = buildSessionRecord(endedAt);
    await stopECGStream();
    await saveSessionRecord(record);
    setSummaryData({
      duration: Math.max(1, Math.round(record.durationSec / 60)),
      avgHR: record.avgHr ?? 0,
      maxHR: record.maxHr ?? 0,
      avgHRV: record.avgHrvMs ?? 0,
      stressScore,
      stressLevel,
      notes: "",
      breathingCount: 0,
      stretchingCount: 0,
    });
  };

  const handleSaveAndExport = async () => {
    const currentIntervals = rrIntervals || [];
    const quality = evaluateDataQuality(currentIntervals);

    if (quality.score < 50 && currentIntervals.length > 0) {
      const proceed = confirm(
        `Warning: Data quality is ${quality.status} (${quality.score}%). Export anyway?`
      );
      if (!proceed) return;
    }

    await downloadAndSaveSession(ecgData, {
      activity_type: "Rest",
      duration: sessionSeconds,
      hr_avg: Math.round(avgHeartRate),
      hr_max: Math.round(maxHeartRate),
      avg_hrv: Math.round(rmssd),
      quality_score: quality.score,
      quality_status: quality.status,
    });
  };

  if (summaryData) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] text-white">
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
          onBack={() => setSummaryData(null)}
        />
        <div className="mx-auto flex max-w-4xl justify-center gap-3 pb-10">
          <Link href="/dashboard" className="rounded-full bg-[#5C66A3] px-6 py-3 font-bold">
            View Dashboard
          </Link>
          <button
            onClick={() => setSummaryData(null)}
            className="rounded-full bg-[#1e293b] px-6 py-3 font-bold"
          >
            Back to Live Monitoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F2C] p-6 font-sans text-slate-200 md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Live Monitoring</h1>
            <p className="mt-2 text-lg text-slate-400">Real-time ECG and stress insights.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-500 bg-[#1e293b] px-5 py-3.5 font-medium text-slate-100 transition hover:bg-slate-700"
            >
              Back to main page
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-[#5C66A3] px-5 py-3 font-bold text-white shadow-lg transition-all hover:opacity-90"
            >
              Dashboard
            </Link>
            <button
              onClick={isConnected ? disconnect : connect}
              className={`rounded-full border px-6 py-3 font-bold shadow-lg transition-all ${
                isConnected ? "bg-[#1e293b]/50 text-rose-300" : "bg-[#10b981] text-white"
              }`}
            >
              {isConnected ? "Disconnect H10" : "Connect Polar H10"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-[1.5rem] border border-rose-500/20 bg-rose-950/20 p-5 text-sm text-rose-300">
            {error}
          </div>
        )}

        {qualityError && isECGStreaming && !isPaused && (
          <div className="flex items-center gap-4 rounded-[1.5rem] border border-rose-500/20 bg-rose-950/20 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 font-bold text-white">
              !
            </div>
            <p className="text-sm text-rose-300/70">{qualityError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#5C66A3] p-8 shadow-2xl">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-bold text-white">ECG Live Feed</h2>
                <div className="flex flex-wrap gap-3">
                  {isECGStreaming && (
                    <>
                      <button
                        onClick={togglePaused}
                        className="rounded-xl bg-slate-100 px-6 py-2 text-sm font-bold text-slate-700"
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                      <button
                        onClick={handleStopRecording}
                        className="rounded-xl bg-rose-500 px-6 py-2 text-sm font-bold text-white"
                      >
                        Stop Recording
                      </button>
                    </>
                  )}
                  {!isECGStreaming && (
                    <button
                      onClick={handleStartMonitoring}
                      disabled={!isConnected}
                      className={`rounded-xl px-6 py-2 text-sm font-bold transition-all ${
                        isConnected ? "bg-[#10b981] text-white" : "bg-slate-300 text-slate-600"
                      }`}
                    >
                      Start Monitoring
                    </button>
                  )}
                </div>
              </div>

              <div className="relative h-80 w-full overflow-hidden rounded-[1.5rem] border border-slate-900/40 bg-[#020617] shadow-inner">
                {isECGStreaming ? (
                  <ECGChart ecgData={ecgData} isPaused={isPaused} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-medium text-slate-600">
                    Waiting for stream...
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <MetricItem label="Session Time" value={formatTime(sessionSeconds)} />
              <MetricItem label="Live HRV" value={rmssd.toFixed(0)} unit="ms" />
              <MetricItem label="Heart Rate" value={heartRate || "--"} unit="bpm" />
              <div className="rounded-[1.5rem] bg-[#5C66A3] p-6 shadow-xl">
                <p className="mb-2 text-sm font-black uppercase tracking-wider text-[#1e293b]">
                  Signal Quality
                </p>
                <p
                  className={`text-3xl font-bold ${
                    currentQuality.score > 75 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isConnected ? `${currentQuality.score}%` : "--"}
                </p>
              </div>
            </div>

            {isECGStreaming && (
              <LiveFeedback avgHR={avgHeartRate} avgHRV={rmssd} />
            )}
          </div>

          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#5C66A3] p-8 text-white shadow-2xl">
              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between">
                  <h3 className="text-lg font-bold">Stress Insight</h3>
                  {isECGStreaming && (
                    <span
                      className={`rounded-md px-2 py-1 text-[10px] font-black ${statusTone.live} animate-pulse`}
                    >
                      LIVE
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center py-4">
                  <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
                    <svg className="h-full w-full -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-[#1e293b]"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * stressScore) / 100}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ease-out ${statusTone.ring}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black ${statusTone.ring}`}>
                        {rmssd === 0 ? "--" : stressScore}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                        Stress Level
                      </span>
                    </div>
                  </div>

                  <p className={`mb-2 text-2xl font-bold tracking-tight ${statusTone.ring}`}>
                    {stressData.label}
                  </p>
                  <p className="min-h-[32px] px-4 text-center text-xs font-medium leading-relaxed text-white">
                    {getStressDescription(stressScore, rmssd)}
                  </p>
                </div>

                <div className="mt-8 border-t border-white/20 pt-8">
                  <button
                    onClick={handleSaveAndExport}
                    disabled={!isECGStreaming}
                    className="w-full rounded-full bg-[#1e293b] py-4 text-lg font-bold text-white shadow-xl hover:opacity-90 disabled:opacity-30"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div
                className={`absolute -bottom-20 -right-20 h-64 w-64 rounded-full ${statusTone.glow} blur-3xl transition-colors duration-1000`}
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#5C66A3]/70 p-8 text-sm text-white">
              <h3 className="mb-6 text-lg font-bold">Quick Tips</h3>
              <ul className="space-y-4 font-medium">
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-400">-&gt;</span> Sit upright for accurate HRV.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-400">-&gt;</span> Dampen strap electrodes for better signal.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function MetricItem({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#5C66A3] p-6 shadow-xl">
      <p className="mb-2 text-sm font-black uppercase tracking-wider text-[#1e293b]">{label}</p>
      <p className="text-3xl font-bold text-white">
        {value} {unit && <span className="ml-1 text-lg font-black text-[#1e293b]">{unit}</span>}
      </p>
    </div>
  );
}
