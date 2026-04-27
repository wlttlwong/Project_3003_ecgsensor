"use client";
import React, { useState, useEffect } from "react";
import BreathingPrompt from "./BreathingPrompt";
import StretchingPrompt from "./StretchingPrompt";

interface LiveFeedbackProps {
  avgHR: number;
  avgHRV: number;
}

const LiveFeedback: React.FC<LiveFeedbackProps> = ({ avgHR, avgHRV }) => {
  const isHighStress = avgHRV > 0 && avgHRV < 50;

  const [showAlert, setShowAlert] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showStretching, setShowStretching] = useState(false);
  const [highStressFor5s, setHighStressFor5s] = useState(false);

  useEffect(() => {
    if (!isHighStress) {
      setHighStressFor5s(false);
      return;
    }
    const id = window.setTimeout(() => setHighStressFor5s(true), 5000);
    return () => window.clearTimeout(id);
  }, [isHighStress]);

  useEffect(() => {
    if (highStressFor5s) setShowAlert(true);
  }, [highStressFor5s]);

  return (
    <>
      {/* PROFESSIONAL OVERLAY MODAL */}
      {showAlert && highStressFor5s && !showMenu && !showBreathing && !showStretching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05081a]/80 backdrop-blur-md animate-in fade-in duration-500">
          
          <div className="relative bg-[#0A0F2C]/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl p-10 max-w-lg w-full text-center overflow-hidden">
            
            {/* Top Accent Bar (Professional Signal Indicator) */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

            {/* Header Section */}
            <div className="mb-8">
              <span className="text-[10px] tracking-[0.3em] font-black text-rose-500 uppercase">
                Physiological Alert
              </span>
              <h2 className="text-4xl font-black text-white mt-2 tracking-tighter uppercase italic">
                Stress Detected
              </h2>
            </div>

            {/* Content Section */}
            <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/5">
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Analysis of heart rate variability indicates high autonomic strain. 
                RMSSD is currently below the stability threshold.
              </p>
              <div className="flex justify-center items-baseline gap-2">
                <span className="text-5xl font-black text-white">{avgHRV.toFixed(1)}</span>
                <span className="text-rose-500 font-bold text-xs">ms RMSSD</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setShowAlert(false);
                  setShowMenu(true);
                }}
                className="w-full py-4 bg-white text-[#0A0F2C] rounded-lg font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Initiate Recovery Protocol
              </button>
              
              <button
                onClick={() => setShowAlert(false)}
                className="w-full py-4 bg-transparent text-slate-500 border border-white/10 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:text-white hover:border-white/30 transition-all"
              >
                Dismiss Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOVERY MENU - BENTO STYLE */}
      {showMenu && !showBreathing && !showStretching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05081a]/90 backdrop-blur-xl">
          <div className="w-full max-w-md p-8">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8 text-center">Select Intervention</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setShowMenu(false); setShowBreathing(true); }}
                className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="text-left">
                  <p className="text-white font-black uppercase tracking-tight">Rhythmic Breathing</p>
                  <p className="text-xs text-slate-500">Parasympathetic activation</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  ◎
                </div>
              </button>

              <button
                onClick={() => { setShowMenu(false); setShowStretching(true); }}
                className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="text-left">
                  <p className="text-white font-black uppercase tracking-tight">Somatic Stretching</p>
                  <p className="text-xs text-slate-500">Muscular tension release</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  ✥
                </div>
              </button>

              <button 
                onClick={() => setShowMenu(false)}
                className="mt-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE WRAPPERS */}
      {showBreathing && (
        <div className="fixed inset-0 z-[110] bg-[#0A0F2C]">
          <BreathingPrompt onStop={() => { setShowBreathing(false); setShowMenu(true); }} />
        </div>
      )}

      {showStretching && (
        <div className="fixed inset-0 z-[110] bg-[#0A0F2C]">
          <StretchingPrompt onStop={() => { setShowStretching(false); setShowMenu(true); }} />
        </div>
      )}
    </>
  );
};

export default LiveFeedback;