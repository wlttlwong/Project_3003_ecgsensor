// app/components/FAQModal.tsx
"use client";

import React from 'react';

interface FAQItem {
    id: string;
    q: string;
    title: string;
    headerColor: string;
    icon: string;
    description: string;
    imageUrl?: string;
    graphData?: { label: string; values: string[]};
    references: string[];
}

export const FAQ_DATABASE: FAQItem[] = [
    {
        id: "hrv",
        q: "What is HRV?",
        title: "What is Heart Rate Variability (HRV)?",
        headerColor: "bg-[#FFD1DC]",
        icon: "❤️",
        description: "Heart Rate Variability (HRV) isn't about real-time tracking — it's about your long-term patterns.\n\nEven a few readings a day can show how your body adapts to stress, recovery, and rest. What matters most is the trend over time, not a single number.",
        graphData: {
            label: "HRV 67ms",
            values: ["859ms", "793ms", "726ms"]
        },
        references: [
            "Apple Inc. (2024). Heart Rate, Calorimetry, and Activity on Apple Watch — Apple Health Research",
            "Parra, M. T. et al. (2023). Validity of Heart Rate Variability Measured with Apple Watch Series 6 Compared to Laboratory Measures.",
            "Dominguez-Martinez et al. (2018). Validation of Apple Watch for HRV Measurements During Relax and Mental Stress in Healthy Subjects."
        ]
    },
    {
        id: "stress-score",
        q: "Stress Scoring?",
        title: "How does the Stress Score work?",
        headerColor: "bg-[#D1E8FF]",
        icon: "📊",
        description: "Your stress score is a reflection of your Autonomic Nervous System (ANS). A high score usually indicates Sympathetic dominance (Fight or Flight).\n\nBy tracking this over time, you can identify which daily triggers cause the most significant physiological impact.",
        references: [
            "Apple Inc. (2024). Heart Rate, Calorimetry, and Activity on Apple Watch — Apple Health Research",
            "Parra, M. T. et al. (2023). Validity of Heart Rate Variability Measured with Apple Watch Series 6 Compared to Laboratory Measures.",
            "Dominguez-Martinez et al. (2018). Validation of Apple Watch for HRV Measurements During Relax and Mental Stress in Healthy Subjects."
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
        // UPDATED: Fixed "inset-0" typo
        <div className='fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300'>
            <div className="bg-[#0A0F2C] w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Sticky top nav */}
                <div className='flex items-center justify-between px-8 py-5 bg-black border-b border-white/10'>
                    <div className='w-10'></div>
                    <h2 className='text-white font-bold text-sm uppercase tracking-widest'>FAQ</h2>
                    <button
                        onClick={onClose}
                        className='bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all'
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable content */}
                <div className='flex-1 overflow-y-auto custom-scrollbar'>
                    {/* Header image area */}
                    <div className={`w-full h-72 ${page.headerColor} flex flex-col items-center justify-center relative overflow-hidden`}>
                        <span className='text-8xl animate-pulse filter drop-shadow-2xl'>{page.icon}</span>
                        <div className='absolute bottom-0 w-full h-16 bg-gradient-to-t from-[#0A0F2C] to-transparent'></div>
                    </div>

                    <div className='px-8 sm:px-12 py-10'>
                        <h1 className='text-3xl font-bold text-white mb-6 tracking-tight'>{page.title}</h1>

                        <div className='text-lg text-gray-300 leading-relaxed space-y-6 mb-10'>
                            {page.description.split('\n\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>

                        {page.graphData && (
                            <div className='bg-white/5 rounded-3xl p-6 my-8 border border-white/10'>
                                <p className='text-center text-white font-bold text-lg mb-4'>{page.graphData.label}</p>
                                <div className='flex items-end justify-center gap-3 h-24 border-b border-white/20 pb-2'>
                                    {[45, 85, 60, 95, 70, 80].map((h, i) => (
                                        <div key={i} className='w-2 bg-blue-500 rounded-t-full opacity-80' style={{ height: `${h}%`}}></div>
                                    ))}
                                </div>
                                <div className='flex justify-between text-[10px] font-bold text-gray-500 mt-4 px-2 uppercase tracking-widest'>
                                    {page.graphData.values.map((v, i) => <span key={i}>{v}</span>)}
                                </div>
                            </div>
                        )}

                        <div className='mt-16 pt-8 border-t border-white/10'>
                            <h3 className='text-2xl font-bold text-white mb-6'>References</h3>
                            <ol className='space-y-4'>
                                {page.references.map((ref, i) => (
                                    <li key={i} className='text-gray-400 text-xs leading-relaxed'>
                                        <span className='text-gray-600 mr-2'>{i + 1}.</span> {ref}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div> {/* UPDATED: Closed the scrollable content div here */}

                {/* IOS Style Bottom indicator */}
                <div className='bg-black py-4 border-t border-white/5'> {/* UPDATED: Fixed class typo */}
                    <div className='w-32 h-1.5 bg-white/20 mx-auto rounded-full'></div>
                </div>
            </div>
        </div>
    );
}