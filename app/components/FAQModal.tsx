// app/components/FAQModal.tsx
"use client";

import React from 'react';

const HRVSampleChart = () => (
  <div className="bg-white/5 rounded-[30px] p-6 border border-white/10 my-8">
    <div className="mb-4">
      <h4 className="text-white font-bold text-lg">HRV Reference Chart</h4>
      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Middle 50% Healthy Range by Age</p>
    </div>

    <svg viewBox="0 0 400 220" className="w-full h-auto overflow-visible">
      {/* Grid Lines */}
      <line x1="40" y1="20" x2="40" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <line x1="40" y1="180" x2="380" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      
      {/* Shaded Middle 50% Range Area */}
      <path 
        d="M 40 60 Q 120 100, 200 130 T 380 150 L 380 100 Q 200 80, 120 40 T 40 20 Z" 
        fill="#3b82f6" 
        fillOpacity="0.15" 
      />
      
      {/* Trend Lines */}
      <path d="M 40 60 Q 120 100, 200 130 T 380 150" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />
      <path d="M 40 20 Q 120 40, 200 80 T 380 100" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.4" />

      {/* Example Sample Point (Age 25) */}
      <circle cx="85" cy="55" r="4" fill="#3b82f6" />
      <circle cx="85" cy="55" r="8" fill="#3b82f6" fillOpacity="0.2" className="animate-pulse" />
      
      {/* Annotations */}
      <text x="98" y="52" fill="white" fontSize="10" fontWeight="bold">Sample User (Age 25)</text>
      <text x="98" y="64" fill="#3b82f6" fontSize="9" fontWeight="bold">Result: 72ms</text>
      
      {/* Legend Box */}
      <rect x="230" y="20" width="130" height="35" rx="6" fill="rgba(255,255,255,0.03)" />
      <text x="238" y="33" fill="white" fontSize="8" fontWeight="bold">The Blue Zone:</text>
      <text x="238" y="44" fill="rgba(255,255,255,0.4)" fontSize="8">Expected range for health</text>

      {/* Axis Labels */}
      <text x="210" y="205" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">AGE (years)</text>
      {[20, 30, 40, 50, 60].map((age, i) => (
        <text key={age} x={40 + (i * 68)} y="195" fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="middle">{age}</text>
      ))}
    </svg>
    
    <div className="mt-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
      <p className="text-xs text-blue-200 leading-relaxed italic">
        Note: HRV naturally declines with age. Being within the shaded area suggests your heart is adapting well to its environment.
      </p>
    </div>
  </div>
);
interface FAQItem {
    id: string;
    q: string;
    title: string;
    headerColor: string;
    icon: string;
    description: string;
    imageUrl?: string;
    references: string[];
}

export const FAQ_DATABASE: FAQItem[] = [
    {
        id: "hrv",
        q: "What is HRV?",
        title: "What is Heart Rate Variability (HRV)?",
        headerColor: "bg-[#FFD1DC]",
        icon: "❤️",
        description: "HRV is the small change in time between one heartbeat and the next. Unlike heart rate (which counts beats per minute), HRV shows how flexible your heart rhythm is.\n\nHigh HRV usually means your body is relaxed and adapting well. Low HRV often happens when you are stressed, tired, or under strain. \n\nAs we age, our typical HRV range naturally declines, which is why we compare your data against age-related norms.",
        references: [
            "Shaffer, F., & Ginsberg, J. P. (2017). An Overview of Heart Rate Variability Metrics and Norms.",
            "What is Heart Rate Variability? (2026). WHOOP Guide.",
            "Hadar Rosenbach et al. (2025). Assessing Stress Level Scores Against Wearables."
        ]
    },
    {
        id: "stress-score",
        q: "What is Stress Scoring?",
        title: "How does the Stress Score work?",
        headerColor: "bg-[#D1E8FF]",
        icon: "📊",
        description: "Your stress score estimates how much strain your body is under right now. It combines your HRV and Heart Rate into a single number.\n\nA higher score means higher physiological stress (Sympathetic dominance), while a lower score suggests a calm state (Parasympathetic dominance). Use this as a trend indicator, not a medical diagnosis.",
        references: [
            "Hadar Rosenbach et al. (2025). Assessing Stress Level Scores Against Wearables-Driven Physiological Measurements."
        ]
    },
    {
        id: "how-it-works",
        q: "How does wearable device work?",
        title: "How does the wearable detect stress?",
        headerColor: "bg-[#E2F0CB]",
        icon: "⌚",
        description: "The wearable measures your body signals while you wear it, especially HRV, and uses those signals to estimate your stress level. Because stress can change from moment to moment, the device helps you notice patterns across the day instead of just one single reading.\n\nThis device is designed to detect stress based on heart-node-related signals as a reference. However, formal HRV assessment usually requires data from three nodes, so the result here should be understood as an estimated reference, not a full clinical HRV measurement.",
        references: [
            "Hadar Rosenbach et al. (2025). Assessing Stress Level Scores Against Wearables‐Driven Physiological Measurements."
        ]
    }
];



interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedId: string | null;
}

export default function FAQModal({ isOpen, onClose, selectedId }: FAQModalProps) {
    const page = FAQ_DATABASE.find(item => item.id === selectedId);

    if (!page || !isOpen) return null;

    return (
        <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
            <div className="bg-[#0A0F2C] w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header/Close Bar */}
                <div className='flex items-center justify-between px-8 py-5 bg-black border-b border-white/10'>
                    <div className='w-10'></div>
                    <h2 className='text-white font-bold text-sm uppercase tracking-widest'>Information</h2>
                    <button
                        onClick={onClose}
                        className='bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all'
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className='flex-1 overflow-y-auto custom-scrollbar'>
                    {/* Visual Banner */}
                    <div className={`w-full h-64 ${page.headerColor} flex flex-col items-center justify-center relative overflow-hidden`}>
                        <span className='text-7xl filter drop-shadow-2xl'>{page.icon}</span>
                        <div className='absolute bottom-0 w-full h-16 bg-gradient-to-t from-[#0A0F2C] to-transparent'></div>
                    </div>

                    <div className='px-8 sm:px-12 py-10'>
                        <h1 className='text-3xl font-bold text-white mb-6 tracking-tight'>{page.title}</h1>

                        <div className='text-lg text-gray-300 leading-relaxed space-y-6'>
                            {page.description.split('\n\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>

                        {/* Integrated HRV Chart (Specific to the HRV page) */}
                        {page.id === "hrv" && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <HRVSampleChart />
                            </div>
                        )}

                        {/* References Section */}
                        <div className='mt-16 pt-8 border-t border-white/10'>
                            <h3 className='text-xl font-bold text-white mb-6'>References</h3>
                            <ol className='space-y-4'>
                                {page.references.map((ref, i) => (
                                    <li key={i} className='text-gray-400 text-xs leading-relaxed flex gap-3'>
                                        <span className='text-gray-600 font-bold'>{i + 1}.</span>
                                        <span>{ref}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Bottom Decorative Bar */}
                <div className='bg-black py-4 border-t border-white/5'>
                    <div className='w-24 h-1.5 bg-white/10 mx-auto rounded-full'></div>
                </div>
            </div>
        </div>
    );
}