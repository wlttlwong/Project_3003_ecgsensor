"use client";

import React from 'react';
import Link from 'next/link';

const STRESS_TIPS = [
    {
      title: "The Physiological Sigh",
      subtitle: "Fastest way to lower heart rate",
      description: "Inhale deeply through the nose, then take a second short inhale on top to fully inflate the lungs. Exhale slowly through the mouth.",
      color: "bg-blue-500/20",
      border: "border-blue-500/40",
      icon: "🌬️"
    },
    {
      title: "Box Breathing",
      subtitle: "Used by Navy SEALs for focus",
      description: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. This regulates the Autonomic Nervous System and stabilizes HRV.",
      color: "bg-purple-500/20",
      border: "border-purple-500/40",
      icon: "📦"
    },
    {
      title: "5-4-3-2-1 Grounding",
      subtitle: "Stop a panic spiral",
      description: "Acknowledge 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste. Shifts focus from internal stress to the environment.",
      color: "bg-green-500/20",
      border: "border-green-500/40",
      icon: "🧘"
    },
    {
      title: "Cold Water Exposure",
      subtitle: "Vagus Nerve Stimulation",
      description: "Splashing ice-cold water on your face triggers the 'Mammalian Dive Reflex,' which instantly slows your heart rate.",
      color: "bg-cyan-500/20",
      border: "border-cyan-500/40",
      icon: "❄️"
    }
  ];
  
  export default function TipsPage() {
    return (
      <div className="min-h-screen bg-[#0A0F2C] text-white font-sans p-8 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2">
            ← BACK TO MONITOR
          </Link>
        </div>
  
        <div className="max-w-4xl mx-auto">
          <header className="mb-16 text-center">
            <h2 className="text-6xl font-bold tracking-tighter mb-4">Release Tension</h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
              Science-backed protocols to reset your nervous system and improve your HRV score in minutes.
            </p>
          </header>
  
          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STRESS_TIPS.map((tip, i) => (
              <div 
                key={i} 
                className={`${tip.color} ${tip.border} border rounded-[30px] p-8 hover:scale-[1.02] transition-transform duration-300`}
              >
                <div className="text-4xl mb-6">{tip.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{tip.title}</h3>
                <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-4">{tip.subtitle}</p>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
  
          {/* Footer Insight */}
          <div className="mt-12 bg-white/5 rounded-[30px] p-8 border border-white/10 text-center">
            <p className="text-sm text-gray-400 italic">
              "Your breath is the only part of your autonomic nervous system that you can control consciously. Use it to lead your heart back to calm."
            </p>
          </div>
        </div>
      </div>
    );
  }