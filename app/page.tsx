"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import { useHeartRateSensor } from './hooks/useHeartRateSensor';
import { updateUserProfile } from "./lib/apiClient";
import { useUserStore } from './store/userStore';
import HeartRateMonitor from './components/HeartRateMonitor';
import ECGChart from './components/ECGChart';
import FAQModal, { FAQ_DATABASE } from './components/FAQModal';

// --- SUB-COMPONENT: GAUGE STRESS INDICATOR ---
const StressGauge = ({ score }: { score: number }) => {
  const getStatus = (s: number) => {
    if (!s || s === 0) return { label: 'N/A', color: 'text-white/40', stroke: 'rgba(255,255,255,0.1)' };
    if (s < 40) return { label: 'Low', color: 'text-green-400', stroke: '#4ade80' };
    if (s < 70) return { label: 'Moderate', color: 'text-yellow-400', stroke: '#facc15' };
    return { label: 'High', color: 'text-red-500', stroke: '#ef4444' };
  };

  const status = getStatus(score);
  const radius = 80;
  const circumference = Math.PI * radius; 
  const dashOffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full py-4">
      <div className="relative w-72 h-40 flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 120">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={status.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute top-12 flex flex-col items-center">
          <span className="text-7xl font-bold tracking-tighter">{score || 0}</span>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Stress Level</p>
          <span className={`text-2xl font-bold mt-1 ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { username, age, height, stressTrigger, goals, setUser } = useUserStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);

  // Form states
  const [fName, setFName] = useState("");
  const [fAge, setFAge] = useState("");
  const [fHeight, setFHeight] = useState("");
  const [fTrigger, setFTrigger] = useState("");
  const [fGoal, setFGoal] = useState("");

  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  // Label Logic
  const [selectedLabel, setSelectedLabel] = useState<string>("None");
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [availableLabels, setAvailableLabels] = useState(["Study", "Work", "Meditation"]);

  // Recent Session Data
  const [lastSessionEndTime, setLastSessionEndTime] = useState<string | null>(null);
  const [lastSessionDuration, setLastSessionDuration] = useState<number>(0);
  const [lastAvgHRV, setLastAvgHRV] = useState<number>(0);
  const [lastAvgHR, setLastAvgHR] = useState<number>(0);
  const [lastStressScore, setLastStressScore] = useState<number>(0);

  const {
    connect, disconnect, startECGStream, stopECGStream,
    heartRate, ecgData, error, isConnected, isECGStreaming
  } = useHeartRateSensor();

  useEffect(() => {
    setIsHydrated(true);
    const hasAuthToken = typeof window !== "undefined" && !!localStorage.getItem("authToken");
    const onboardingFlag =
      searchParams.get("onboarding") === "1" ||
      (typeof window !== "undefined" &&
        sessionStorage.getItem("onboardingAfterRegister") === "1");
    setShowSplash(!hasAuthToken);
    setOnboardingRequired(hasAuthToken && onboardingFlag);
    if (username) {
      setFName(username);
      setFAge(age || "");
      setFHeight(height || "");
      setFTrigger(stressTrigger || "");
      setFGoal(goals || "");
    }
    const savedTime = localStorage.getItem("lastSessionEndTime");
    if (savedTime) {
      setLastSessionEndTime(savedTime);
      setLastSessionDuration(parseInt(localStorage.getItem("duration") || "0"));
      setLastAvgHRV(parseInt(localStorage.getItem("avgHRV") || "0"));
      setLastAvgHR(parseInt(localStorage.getItem("avgHR") || "0"));
      setLastStressScore(parseInt(localStorage.getItem("stressScore") || "0"));
    }
  }, [username, age, height, stressTrigger, goals, searchParams]);

  const handleSaveProfile = async () => {
    if (!fName.trim() || !fAge.trim() || !fHeight.trim() || !fTrigger.trim() || !fGoal.trim()) {
      return alert("Please fill all fields");
    }

    try {
      await updateUserProfile({
        age: Number(fAge),
        height: Number(fHeight),
        goals: [fGoal],
        stressTriggers: [fTrigger],
      });
    } catch (err) {
      console.error("Failed to sync profile to backend:", err);
      alert("Unable to save profile to backend right now.");
      return;
    }

    setUser({ username: fName, age: fAge, height: fHeight, stressTrigger: fTrigger, goals: fGoal });
    sessionStorage.removeItem("onboardingAfterRegister");
    setOnboardingRequired(false);
    setIsProfileOpen(false);
    setIsCustomTrigger(false);
    setIsCustomGoal(false);
    router.replace("/");
  };

  const handleStartSession = () => {
    router.push("/session");
  };

  const handleAddCustomLabel = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customLabel.trim() !== "") {
      setAvailableLabels([...availableLabels, customLabel]);
      setSelectedLabel(customLabel);
      setCustomLabel("");
    }
  };

  if (!isHydrated) return null;

  // SPLASH SCREEN
  if (showSplash && !username) {
    return (
      <div className='min-h-screen bg-[#0A0F2C] text-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000'>
        <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-center mb-12 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent'>
          Stress Detection<br/>Application
        </h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className='px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-900/40 text-center'
          >
            Log In
          </Link>
          <Link
            href="/register"
            className='px-12 py-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 text-center'
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // ONBOARDING
  if (onboardingRequired) {
    return (
      <div className="min-h-screen bg-[#0A0F2C] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1E2A5E] rounded-[40px] p-10 shadow-2xl border border-white/5">
          <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">Welcome</h2>
          <p className="text-gray-400 text-center mb-8">Let's personalize your experience</p>
          
          <div className="space-y-4">
            <input 
              className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all" 
              placeholder="What is your name?" value={fName} onChange={(e) => setFName(e.target.value)} 
            />

            <div className="flex gap-4">
              <input 
                type="number"
                className='w-1/2 bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                placeholder='Age' value={fAge}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (e.target.value === "") setFAge("");
                  else if (val >= 0 && val <= 99) setFAge(val.toString());
                }}
              />
              <input 
                type="number"
                className='w-1/2 bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                placeholder='Height (cm)' value={fHeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (e.target.value === "") setFHeight("");
                  else if (val >= 0 && val <= 200) setFHeight(val.toString());
                }}
              />
            </div>

            {!isCustomTrigger ? (
              <select className='w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5' value={fTrigger} onChange={(e) => e.target.value === "custom" ? setIsCustomTrigger(true) : setFTrigger(e.target.value)}>
                <option value="">Main Stress Trigger?</option>
                <option value="Work Pressure">Work Pressure</option>
                <option value="Academic Exams">Academic Exams</option>
                <option value="custom">+ Customize Option</option>
              </select>
            ) : (
              <input className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-blue-500 animate-in fade-in" placeholder="Type custom trigger..." autoFocus value={fTrigger} onChange={(e) => setFTrigger(e.target.value)} />
            )}

            {!isCustomGoal ? (
              <select className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5" value={fGoal} onChange={(e) => e.target.value === "custom" ? setIsCustomGoal(true) : setFGoal(e.target.value)}>
                <option value="">What is your goal?</option>
                <option value="Reduce Anxiety">Reduce Anxiety</option>
                <option value="Better Sleep">Better Sleep</option>
                <option value="custom">+ Customize Option</option>
              </select>
            ) : (
              <input className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-blue-500 animate-in fade-in" placeholder="Type custom goal..." autoFocus value={fGoal} onChange={(e) => setFGoal(e.target.value)} />
            )}

            <button onClick={handleSaveProfile} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold mt-4 shadow-lg shadow-blue-900/40 transition-all">Complete Setup</button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#0A0F2C] text-white font-sans pb-20">
      <nav className="flex items-center justify-between px-12 py-8">
        <div className="text-lg font-bold tracking-tight">Stress Detection Application</div>
        <div className="flex items-center gap-12">
          <div className='flex gap-12 text-sm font-bold tracking-widest'>
            <Link href="/" className="text-blue-400">LIVE MONITORING</Link>
            <Link href="/dashboard" className="hover:text-blue-400 transition-colors">HISTORY</Link>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className='bg-white/10 p-2 px-6 rounded-full border border-white/20 hover:bg-white/20 transition-all text-xs font-bold tracking-widest'>PROFILE SETTINGS</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-[120px] font-bold leading-none mt-12 mb-10 tracking-tighter">Hi, {username}</h1>
        
        <div className="flex flex-col items-center gap-4 mb-20">
          <button onClick={handleStartSession} className="px-16 py-4 border-2 border-white rounded-full text-2xl font-bold hover:bg-white hover:text-[#0A0F2C] transition-all active:scale-95">
            {isECGStreaming ? "Streaming..." : `Start ${selectedLabel !== "None" ? selectedLabel : "session"}`}
          </button>
          <button onClick={() => setIsLabelModalOpen(true)} className="text-lg font-medium underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity">
            Label: {selectedLabel}
          </button>
        </div>

        {isLabelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-left">
            <div className="bg-[#1E2A5E] w-full max-w-sm rounded-[30px] p-8 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 text-center">Select Activity</h3>
              <div className="flex flex-col gap-3">
                {availableLabels.map((l) => (
                  <button key={l} onClick={() => { setSelectedLabel(l); setIsLabelModalOpen(false); }} className={`py-3 rounded-xl font-semibold transition-all ${selectedLabel === l ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>{l}</button>
                ))}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <input type="text" placeholder="+ Custom Label (Press Enter)" className="w-full bg-white/5 p-3 rounded-xl outline-none border border-white/5 focus:border-blue-500" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} onKeyDown={handleAddCustomLabel} />
                </div>
              </div>
              <button onClick={() => setIsLabelModalOpen(false)} className="w-full mt-6 text-sm opacity-50 hover:opacity-100 font-bold">Close</button>
            </div>
          </div>
        )}

        {isECGStreaming && (
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HeartRateMonitor isConnected={isConnected} isECGStreaming={isECGStreaming} connect={connect} disconnect={disconnect} startECGStream={startECGStream} stopECGStream={stopECGStream} heartRate={heartRate} error={error} />
            <div className="mt-8 bg-white/5 backdrop-blur-md rounded-[40px] p-8 border border-white/10"><ECGChart ecgData={ecgData} isPaused={false} /></div>
          </div>
        )}

        {!isECGStreaming && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            <div className="lg:col-span-8 bg-[#5C66A3]/80 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl flex flex-col justify-between min-h-[450px]">
              <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold">Recent Session</h2>
                <div className="text-right">
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Last Recorded</p>
                  <p className="text-sm font-semibold">{lastSessionEndTime || "No data yet"}</p>
                </div>
              </div>

              {/* CENTERED GAUGE INDICATOR */}
              <StressGauge score={lastStressScore} />

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                <div className="text-center border-r border-white/10">
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Average HRV</p>
                  <p className="text-5xl font-black tracking-tighter">{lastAvgHRV} <span className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">ms</span></p>
                </div>
                <div className="text-center border-r border-white/10">
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-5xl font-black tracking-tighter">{lastSessionDuration} <span className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">min</span></p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">Avg Heart Rate</p>
                  <p className="text-5xl font-black tracking-tighter">{lastAvgHR} <span className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">bpm</span></p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 bg-[#5C66A3]/80 backdrop-blur-xl rounded-[40px] p-10 flex flex-col shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-center">FAQ</h3>
              <div className="space-y-6 flex-grow">
                {FAQ_DATABASE.map((item) => (
                  <button key={item.id} onClick={() => setSelectedFaqId(item.id)} className='w-full text-left font-bold text-lg hover:text-blue-300 transition-colors flex justify-between'>
                    <span>{item.q}</span><span>→</span>
                  </button>
                ))}
              </div>
              <Link href="/tips" className='mt-12 text-lg font-bold underline underline-offset-8 decoration-2 hover:text-blue-200 transition-all text-center'>Quick Tips to release stress</Link>
            </div>
          </div>
        )}

        {isProfileOpen && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-6'>
            <div className='bg-[#1E2A5E] w-full max-w-md rounded-[40px] p-10 border border-white/10 shadow-2xl'>
              <h3 className='text-2xl font-bold mb-8 text-center'>User Profile</h3>
              <div className='space-y-6 text-left'>
                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2 tracking-widest'>Age</label>
                  <input type="number" className='w-full bg-[#0A0F2C] p-4 rounded-xl border border-white/5 focus:border-blue-500 outline-none [appearance:textfield]' value={fAge} onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (e.target.value === "") setFAge(""); else if (val >= 0 && val <= 99) setFAge(val.toString());
                  }} />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2 tracking-widest'>Height (cm)</label>
                  <input type="number" className='w-full bg-[#0A0F2C] p-4 rounded-xl border border-white/5 focus:border-blue-500 outline-none [appearance:textfield]' value={fHeight} onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (e.target.value === "") setFHeight(""); else if (val >= 0 && val <= 200) setFHeight(val.toString());
                  }} />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2 tracking-widest'>Stress Trigger</label>
                  <input className='w-full bg-[#0A0F2C] p-4 rounded-xl border border-white/5 focus:border-blue-500 outline-none' value={fTrigger} onChange={(e) => setFTrigger(e.target.value)} />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] uppercase font-bold opacity-40 ml-2 tracking-widest'>Main Goal</label>
                  <input className='w-full bg-[#0A0F2C] p-4 rounded-xl border border-white/5 focus:border-blue-500 outline-none' value={fGoal} onChange={(e) => setFGoal(e.target.value)} />
                </div>
          
                <div className='flex gap-4 pt-4'>
                  <button onClick={handleSaveProfile} className='flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all'>
                    Save Changes
                  </button>
                  <button onClick={() => setIsProfileOpen(false)} className='flex-1 py-4 bg-white/5 rounded-2xl font-bold'>
                    Cancel
                  </button>
                </div>

                <button
                  onClick={() => {
                    setUser({ username: "", age: "", height: "", stressTrigger: "", goals: "" });
                    localStorage.clear();
                    sessionStorage.clear();
                    setShowSplash(true);
                    setIsProfileOpen(false);
                    router.replace("/");
                    window.location.reload();
                  }}
                  className='w-full mt-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all uppercase'
                >
                  Reset All Data & Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <FAQModal isOpen={selectedFaqId !== null} onClose={() => setSelectedFaqId(null)} selectedId={selectedFaqId} />
      </div>
    </div>
  );
}