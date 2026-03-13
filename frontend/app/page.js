'use client';
import { useState } from 'react';
import Section1Broken from '@/components/sections/Section1Broken';
import Section2Examples from '@/components/sections/Section2Examples';
import Section3Evaluation from '@/components/sections/Section3Evaluation';
import Section4Fix from '@/components/sections/Section4Fix';
import Section5Guardrails from '@/components/sections/Section5Guardrails';
import Section6Comparison from '@/components/sections/Section6Comparison';
import Section7Scan from '@/components/sections/Section7Scan';

const NAV = [
  { id: 1, label: 'Broken Chatbot' },
  { id: 2, label: 'What Could Go Wrong' },
  { id: 3, label: 'Evaluation' },
  { id: 4, label: 'The Fix' },
  { id: 5, label: 'Guardrails' },
  { id: 6, label: 'Before vs After' },
  { id: 7, label: 'Vulnerability Scan' },
];

export default function Home() {
  const [beforeScores, setBeforeScores] = useState(null);
  const [afterScores, setAfterScores] = useState(null);

  return (
    <main className="min-h-screen">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto">
          <span className="text-xs font-bold text-white shrink-0 tracking-wider">AI SAFETY DEMO</span>
          <div className="flex gap-4 shrink-0">
            {NAV.map(s => (
              <a
                key={s.id}
                href={`#section-${s.id}`}
                className="text-xs text-gray-500 hover:text-white transition-colors whitespace-nowrap"
              >
                {s.id}. {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-800 text-red-400 text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          QA AI Safety Evaluation — Live Demo
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          What happens when a medical chatbot<br />
          <span className="text-red-400">has no guardrails?</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed mb-8">
          A complete QA lifecycle applied to a real AI chatbot — bias, harm, and prompt injection detection
          using <span className="text-white font-medium">DeepEval</span>, then fixed with a proper system prompt and guardrails.
        </p>
        <a
          href="#section-1"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Start the Demo →
        </a>
      </div>

      <Section1Broken />
      <Section2Examples />
      <Section3Evaluation onScoresReady={setBeforeScores} />
      <Section4Fix />
      <Section5Guardrails />
      <Section6Comparison
        beforeScores={beforeScores}
        onRunAfter={setAfterScores}
      />
      <Section7Scan />

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 px-4 text-center">
        <p className="text-xs text-gray-600">
          Built for QA AI Safety Research · Powered by Gemini + DeepEval · Not for clinical use
        </p>
      </footer>
    </main>
  );
}
