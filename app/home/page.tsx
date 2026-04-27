"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHeartRateSensor } from '../hooks/useHeartRateSensor';
import { useUserStore } from '../store/userStore';
import FAQModal, { FAQ_DATABASE } from '../components/FAQModal';
import Chatbot from '../components/Chatbot';

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
    <div className="flex flex-col items-center justify-center w-full py-8">
      <div className="relative w-72 h-auto flex flex-col items-center">
        <svg className="w-full h-36" viewBox="0 0 200 100" preserveAspectRatio="xMidYMid meet">
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

        <div className="flex flex-col items-center -mt-24 pb-4">
          <span className="text-7xl font-bold tracking-tighter leading-none">{score || 0}</span>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Stress Level</p>
          <span className={`text-3xl font-bold mt-2 ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { username, age, height, stressTrigger, goals, setUser, loadFromServer, syncWithServer } = useUserStore();
  
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Onboarding Form states
  const [fName, setFName] = useState("");
  const [fAge, setFAge] = useState("");
  const [fHeight, setFHeight] = useState("");
  const [fTrigger, setFTrigger] = useState("");
  const [fGoal, setFGoal] = useState("");

  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  // Activity Label states
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

  // 1. Initial Load & Fetching Latest Session
  useEffect(() => {
    const init = async () => {
      await loadFromServer();

      const storedUser = useUserStore.getState().username;
      if (storedUser) {
        setShowSplash(false);
      }

      setIsHydrated(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch('/api/sessions?limit=1', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sessions?.length > 0) {
            const latest = data.sessions[0];
            setLastSessionEndTime(new Date(latest.endedAt).toLocaleString());
            setLastSessionDuration(Math.round(latest.durationSec / 60));
            setLastAvgHRV(latest.avgHrvMs || 0);
            setLastAvgHR(latest.avgHr || 0);
            setLastStressScore(latest.stressScore || 0);
          }
        }
      } catch (e) {
        console.error("Failed to fetch latest session", e);
      }
    };
    init();
  }, [loadFromServer]);

  // Sync Form to Store (Useful for Profile Settings Modal)
  useEffect(() => {
    if (username) {
      setFName(username);
      setFAge(age || "");
      setFHeight(height || "");
      setFTrigger(stressTrigger || "");
      setFGoal(goals || "");
    }
  }, [username, age, height, stressTrigger, goals]);

  const handleSaveProfile = async () => {
    if (!fName.trim() || !fAge || !fHeight || !fTrigger || !fGoal) {
      return alert("Please fill all fields to complete your profile.");
    }
    setUser({ username: fName, age: fAge, height: fHeight, stressTrigger: fTrigger, goals: fGoal });
    await syncWithServer();
    setIsProfileOpen(false);
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
      <div className='min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000'>
        <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-center mb-12 bg-gradient-to-b from-white to-white/20 bg-clip-text text-transparent uppercase'>
          StressGuard<br/>AI
        </h1>
        <button
          onClick={() => setShowSplash(false)}
          className='px-12 py-5 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl'
        >
          Get Started
        </button>
      </div>
    );
  }

  // ONBOARDING
  if (!username) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#1E2A5E] rounded-[40px] p-10 shadow-2xl border border-white/5">
          <h2 className="text-3xl font-bold mb-2 text-center tracking-tight">Welcome</h2>
          <p className="text-gray-400 text-center mb-8">Let's personalize your experience</p>
          
          <div className="space-y-4">
            <input 
              className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500 transition-all" 
              placeholder="What is your name?" value={fName} onChange={(e) => setFName(e.target.value)} 
            />

            <div className="flex gap-4">
              <input type="number" className='w-1/2 bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500' placeholder='Age' value={fAge} onChange={(e) => setFAge(e.target.value)} />
              <input type="number" className='w-1/2 bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5 focus:border-blue-500' placeholder='Height (cm)' value={fHeight} onChange={(e) => setFHeight(e.target.value)} />
            </div>

            <select className='w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5' value={fTrigger} onChange={(e) => setFTrigger(e.target.value)}>
              <option value="">Stress Trigger?</option>
              <option value="Work Pressure">Work Pressure</option>
              <option value="Academic Exams">Academic Exams</option>
              <option value="Health Concerns">Health Concerns</option>
              <option value="Social Anxiety">Social Anxiety</option>
            </select>

            <select className="w-full bg-[#0A0F2C] p-4 rounded-2xl outline-none border border-white/5" value={fGoal} onChange={(e) => setFGoal(e.target.value)}>
              <option value="">Your primary goal?</option>
              <option value="Reduce Anxiety">Reduce Anxiety</option>
              <option value="Better Sleep">Better Sleep</option>
              <option value="Improve Focus">Improve Focus</option>
              <option value="Track Recovery">Track Recovery</option>
            </select>

            <button onClick={handleSaveProfile} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold mt-4 shadow-lg transition-all">Complete Setup</button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD CONTENT
  return (
    <div className="max-w-6xl mx-auto px-6 text-center pb-20">
      <div className="flex justify-end mt-4">
        <button onClick={() => setIsProfileOpen(true)} className='bg-white/10 p-2 px-6 rounded-full border border-white/20 hover:bg-white/20 transition-all text-[10px] font-bold tracking-widest'>PROFILE SETTINGS</button>
      </div>

      <h1 className="text-7xl md:text-[120px] font-bold leading-none mt-8 mb-10 tracking-tighter">Hi, {username}</h1>
      
      <div className="flex flex-col items-center gap-4 mb-20">
        <Link href="/session" className="px-16 py-4 border-2 border-white rounded-full text-2xl font-bold hover:bg-white hover:text-[#0A0F2C] transition-all active:scale-95">
           Start {selectedLabel !== "None" ? selectedLabel : "session"}
        </Link>
        <button onClick={() => setIsLabelModalOpen(true)} className="text-lg font-medium underline underline-offset-4 opacity-60 hover:opacity-100">
          Label: {selectedLabel}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        <div className="lg:col-span-8 bg-[#5C66A3]/80 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl flex flex-col justify-between min-h-[450px]">
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold">Recent Session</h2>
            <div className="text-right">
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Last Recorded</p>
              <p className="text-sm font-semibold">{lastSessionEndTime || "No data yet"}</p>
            </div>
          </div>

          <StressGauge score={lastStressScore} />

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            <MetricBox label="Avg HRV" value={lastAvgHRV} unit="ms" />
            <MetricBox label="Duration" value={lastSessionDuration} unit="min" />
            <MetricBox label="Avg HR" value={lastAvgHR} unit="bpm" />
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
          <Link href="/tips" className='mt-12 text-lg font-bold underline underline-offset-8 text-center hover:text-blue-200 transition-all'>Quick Tips to release stress</Link>
        </div>
      </div>

      {/* Modals */}
      {isLabelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 text-left">
          <div className="bg-[#1E2A5E] w-full max-w-sm rounded-[30px] p-8 border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-center">Select Activity</h3>
            <div className="flex flex-col gap-3">
              {availableLabels.map((l) => (
                <button key={l} onClick={() => { setSelectedLabel(l); setIsLabelModalOpen(false); }} className={`py-3 rounded-xl font-semibold transition-all ${selectedLabel === l ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'}`}>{l}</button>
              ))}
              <input type="text" placeholder="+ Custom Label" className="mt-4 bg-white/5 p-3 rounded-xl outline-none border border-white/5 focus:border-blue-500" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} onKeyDown={handleAddCustomLabel} />
            </div>
            <button onClick={() => setIsLabelModalOpen(false)} className="w-full mt-6 text-sm opacity-50 font-bold">Close</button>
          </div>
        </div>
      )}

      {isProfileOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-md z-[150] flex items-center justify-center p-6'>
          <div className='bg-[#1E2A5E] w-full max-w-md rounded-[40px] p-10 border border-white/10 shadow-2xl'>
            <h3 className='text-2xl font-bold mb-8 text-center'>User Profile</h3>
            <div className='space-y-6 text-left'>
              <div className='space-y-1'><label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Age</label><input type="number" className='w-full bg-[#0A0F2C] p-4 rounded-xl outline-none' value={fAge} onChange={(e) => setFAge(e.target.value)} /></div>
              <div className='space-y-1'><label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Height (cm)</label><input type="number" className='w-full bg-[#0A0F2C] p-4 rounded-xl outline-none' value={fHeight} onChange={(e) => setFHeight(e.target.value)} /></div>
              <div className='space-y-1'><label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Stress Trigger</label><input className='w-full bg-[#0A0F2C] p-4 rounded-xl outline-none' value={fTrigger} onChange={(e) => setFTrigger(e.target.value)} /></div>
              <div className='space-y-1'><label className='text-[10px] uppercase font-bold opacity-40 ml-2'>Main Goal</label><input className='w-full bg-[#0A0F2C] p-4 rounded-xl outline-none' value={fGoal} onChange={(e) => setFGoal(e.target.value)} /></div>
              <div className='flex gap-4 pt-4'>
                <button onClick={handleSaveProfile} className='flex-1 py-4 bg-blue-600 rounded-2xl font-bold hover:bg-blue-500 transition-all'>Save</button>
                <button onClick={() => setIsProfileOpen(false)} className='flex-1 py-4 bg-white/5 rounded-2xl font-bold'>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FAQModal isOpen={selectedFaqId !== null} onClose={() => setSelectedFaqId(null)} selectedId={selectedFaqId} />
    </div>
  );
}

function MetricBox({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="text-center border-r last:border-0 border-white/10">
      <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl md:text-5xl font-black tracking-tighter">{value} <span className="text-xs opacity-40 uppercase">{unit}</span></p>
    </div>
  );
}