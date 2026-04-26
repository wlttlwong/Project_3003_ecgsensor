"use client";

import React from 'react';

export default function HRVSampleChart() {
    return (
      <div className="bg-white/5 rounded-[30px] p-6 border border-white/10 my-8">
        <div className="mb-4">
          <h4 className="text-white font-bold text-lg">HRV Reference Chart</h4>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Middle 50% Healthy Range by Age</p>
        </div>
  
        <svg viewBox="0 0 400 220" className="w-full h-auto overflow-visible">
          {/* Y-Axis (ms) */}
          <line x1="40" y1="20" x2="40" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="15" y="100" fill="rgba(255,255,255,0.4)" fontSize="10" transform="rotate(-90, 15, 100)" textAnchor="middle" fontWeight="bold">HRV (ms)</text>
          
          {/* X-Axis (years) */}
          <line x1="40" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <text x="210" y="210" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle" fontWeight="bold">AGE (years)</text>
  
          {/* Shaded Middle 50% Range Area */}
          <path 
            d="M 40 60 Q 120 100, 200 130 T 380 150 L 380 100 Q 200 80, 120 40 T 40 20 Z" 
            fill="#3b82f6" 
            fillOpacity="0.2" 
          />
          
          {/* Trend Lines (Top and Bottom of range) */}
          <path d="M 40 60 Q 120 100, 200 130 T 380 150" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
          <path d="M 40 20 Q 120 40, 200 80 T 380 100" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.5" />
  
          {/* Example Sample Point (Age 25) */}
          <circle cx="85" cy="55" r="5" fill="#3b82f6" className="animate-pulse" />
          <line x1="40" y1="55" x2="85" y2="55" stroke="white" strokeDasharray="2,2" strokeOpacity="0.4" />
          
          {/* Annotations */}
          <text x="95" y="50" fill="white" fontSize="11" fontWeight="bold">Sample User (Age 25)</text>
          <text x="95" y="62" fill="#3b82f6" fontSize="9" fontWeight="bold">Result: 72ms</text>
          
          {/* Explanation Label */}
          <rect x="220" y="30" width="140" height="40" rx="8" fill="rgba(255,255,255,0.05)" />
          <text x="230" y="45" fill="white" fontSize="9" fontWeight="bold">What is this area?</text>
          <text x="230" y="58" fill="rgba(255,255,255,0.5)" fontSize="8">The "Normal" range for most</text>
          <text x="230" y="66" fill="rgba(255,255,255,0.5)" fontSize="8">healthy people at this age.</text>
  
          {/* X-Axis Ticks */}
          {[20, 30, 40, 50, 60].map((age, i) => (
            <text key={age} x={40 + (i * 68)} y="195" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">{age}</text>
          ))}
        </svg>
        
        <div className="mt-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <p className="text-sm text-blue-200 leading-relaxed">
            <strong>How to read this:</strong> As you get older, HRV naturally trends lower. The blue shaded area shows where 50% of healthy people fall. If your point is inside or above this area, your heart rhythm flexibility is excellent!
          </p>
        </div>
      </div>
    );
  }