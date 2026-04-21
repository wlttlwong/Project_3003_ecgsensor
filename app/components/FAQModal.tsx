// app/components/FAQModal.tsx
"use client";

import React from 'react';

// 1. Structure for FAQ items
interface FAQItem {
    id: string;
    q: string; // Short question for homepage
    title: string; // big heading inside the page
    headerColor: string; // Background color of image area
    icon: string; // emoji or icon for homepage
    description: string; // Detailed answer for the FAQ page
    graphData?: { label: string; values: string[]}; // Optional graph
    references: string[];
}

// 2. Database of FAQs
export const FAQ_DATABASE: FAQItem[] = [
    {
        id: "hrv",
        q: "What is HRV?",
        title: "What is Heart Rate Variability (HRV)?",
        headerColor: "bg-[#FFD1DC]", // Soft pink
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
        headerColor: "bg-[#D1E8FF]", // Soft blue
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
    // Find content based on ID passed from page.tsx
    const page = FAQ_DATABASE.find(item => item.id === selectedId);

    if (!page) return null; // If no matching page, render nothing

    return (
        <div 
            className={`fixed insert-0 bg-black z-[200] flex flex-col transition-transform duration-500 ease-in-out ${
                isOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            {/* Sticky top nav */}
            <div className='flex items-center justify-between px-6 py-4 bg-black border-b border-white/10'>
                <div className='w-10'></div>
                <h2 className='text-white font-bold text-sm uppercase tracking-widest'>FAQ</h2>
                <button
                    onClick={onClose}
                    className='bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all'
                >
                    x
                </button>
            </div>

            {/* Scrollable content */}
            <div className='flex-1 overflow-y-auto pb-20'>

                {/* Header image area */}
                <div className={`w-full h-72 ${page.headerColor} flex flex-col items-center justify-center relative`}>
                    <span className='text-9xl filter drop-shadow-lg'>{page.icon}</span>

                    {/* Visual pulse line effect */}
                    <div className='absolute bottom-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent'></div>
                </div>

                <div className='px-8 pt-10'>
                    <h1 className='text-4xl font-bold text-white mb-8 tracking-tight'>{page.title}</h1>

                    {/* Main description */}
                    <div className='text-xl text-gray-300 leading-relaxed space-y-6 mb-12'>
                        {page.description.split('\n\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    {/* Dynamic graph section (if data exists) */}
                    {page.graphData && (
                        <div className='bg-white rounded-3xl p-8 my-10 shadow-xl'>
                            <p className='text-center text-black font-black text-2xl mb-6'>{page.graphData.label}</p>
                            <div className='flex items-end justify-center gap-4 h-32 border-b-2 border-gray-100 pb-2'>
                                {[45, 85, 60, 95].map((h, i) => (
                                    <div key={i} className='w-1.5 bg-black rounded-t-full' style={{ height: `${h}%`}}></div>
                                ))}
                            </div>
                            <div className='flex justify-between text-[10px] font-bold text-gray-400 mt-4 px-2 uppercase tracking-widest'>
                                {page.graphData.values.map((v, i) => <span key={i}>{v}</span>)}
                            </div>
                        </div>
                    )}

                    {/* References */}
                    <div className='mt-16 pt-8 border-t border-white/10'>
                        <h3 className='text-2xl font-bold text-white mb-6'>References</h3>
                        <ol className='space-y-6'>
                            {page.references.map((ref, i) => (
                                <li key={i} className='text-gray-400 text-sm leading-relaxed'>
                                    <span className='text-gray-600 mr-2'>{i + 1}.</span> {ref}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {/* IOS Style Bottom indicator */}
            <div className='bg-black-py-4'>
                <div className='w-32 h-1.5 bg-white/20 mx-auto rounded-full'></div>
            </div>
        </div>
    );
                            }