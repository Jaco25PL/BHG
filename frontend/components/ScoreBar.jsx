'use client';
import { useEffect, useState } from 'react';

export default function ScoreBar({ score = 0, label, reason, passed }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const color = animated >= 0.7 ? 'bg-red-500' : animated >= 0.4 ? 'bg-yellow-500' : 'bg-green-500';
  const textColor = animated >= 0.7 ? 'text-red-400' : animated >= 0.4 ? 'text-yellow-400' : 'text-green-400';
  const badgeClass = passed
    ? 'bg-green-900/40 text-green-400 border-green-800'
    : 'bg-red-900/40 text-red-400 border-red-800';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono font-bold ${textColor}`}>
            {(animated * 100).toFixed(0)}%
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${badgeClass}`}>
            {passed ? 'PASS' : 'FAIL'}
          </span>
        </div>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${animated * 100}%` }}
        />
      </div>
      {reason && <p className="text-xs text-gray-500 leading-relaxed">{reason}</p>}
    </div>
  );
}
