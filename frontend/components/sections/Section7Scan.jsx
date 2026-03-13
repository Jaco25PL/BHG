'use client';
import { useState } from 'react';
import { Bug, Loader2, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Info } from 'lucide-react';

// Map Giskard's internal detector class names to human-readable labels
const DETECTOR_LABELS = {
  LLMPromptInjectionDetector: 'Prompt Injection',
  LLMHarmfulContentDetector: 'Harmful Content',
  LLMStereotypesDetector: 'Stereotypes & Discrimination',
  LLMHallucinationDetector: 'Hallucination / Sycophancy',
  LLMInformationDisclosureDetector: 'Information Disclosure',
  PromptInjectionDetector: 'Prompt Injection',
  HarmfulContentDetector: 'Harmful Content',
  StereotypesDetector: 'Stereotypes & Discrimination',
};

function getLabel(name) {
  if (DETECTOR_LABELS[name]) return DETECTOR_LABELS[name];
  // Already a readable string (e.g. "Prompt Injection") — return as-is
  if (name.includes(' ') || name.includes('&')) return name;
  // Fallback: convert CamelCase class names
  return name
    .replace(/Detector$/, '')
    .replace(/^LLM/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const isMajor = issue.severity === 'major';

  return (
    <div className={`rounded-lg border p-3 ${isMajor ? 'border-red-800 bg-red-950/20' : 'border-yellow-800 bg-yellow-950/20'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${isMajor ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-yellow-900/50 text-yellow-400 border-yellow-700'}`}>
            {isMajor ? 'MAJOR' : 'MINOR'}
          </span>
          <span className="text-sm font-semibold text-white">{getLabel(issue.name)}</span>
        </div>
        {issue.examples?.length > 0 && (
          <button
            onClick={() => setOpen(v => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 shrink-0 transition-colors"
          >
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {open ? 'Hide' : 'See'} example
          </button>
        )}
      </div>

      {issue.description && (
        <p className="text-xs text-gray-400 leading-relaxed">{issue.description}</p>
      )}

      {open && issue.examples?.length > 0 && (
        <div className="mt-3 space-y-2">
          {issue.examples.map((ex, i) => (
            <div key={i} className="bg-gray-900/70 rounded-lg p-3 text-xs space-y-1.5">
              <p className="text-gray-500 font-semibold">PROBE THAT SUCCEEDED</p>
              <p className="text-gray-400"><span className="text-gray-500">Input: </span>{ex.input}</p>
              {ex.output && (
                <p className="text-gray-400"><span className="text-gray-500">Output: </span>{ex.output}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScanPanel({ label, mode, result, loading, onScan, error }) {
  const accentColor = mode === 'broken' ? 'red' : 'green';

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <h3 className={`text-sm font-semibold mb-4 text-${accentColor}-400`}>{label}</h3>

      {!result && !loading && (
        <div>
          {error && (
            <div className="mb-3 rounded-lg border border-red-800 bg-red-950/20 px-3 py-2 text-xs text-red-400">
              ⚠️ {error}
            </div>
          )}
          <button
            onClick={onScan}
            className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm text-white bg-${accentColor}-700 hover:bg-${accentColor}-600`}
          >
            <Bug size={15} />
            Scan {mode === 'broken' ? 'Broken' : 'Fixed'} Chatbot
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-sm font-semibold">Giskard is scanning...</span>
          </div>
          <div className="text-xs text-gray-500 space-y-1 leading-relaxed pl-1">
            <p>→ Generating adversarial probes from your dataset</p>
            <p>→ Testing model against prompt injection, stereotypes, harmful content</p>
            <p>→ Evaluating each response using Gemini as judge</p>
          </div>
          <p className="text-xs text-indigo-400 font-medium">This takes 2–4 minutes — sit tight.</p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
            {result.passed ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            <span className="text-sm font-semibold">
              {result.passed
                ? 'No vulnerabilities detected'
                : `${result.total_issues} vulnerabilit${result.total_issues === 1 ? 'y' : 'ies'} found`}
            </span>
          </div>

          {result.issues.length > 0 ? (
            <div className="space-y-2">
              {result.issues.map((issue, i) => (
                <IssueCard key={i} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-2 bg-green-950/20 rounded-lg p-3 border border-green-900/40">
              <ShieldCheck size={13} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-green-400 leading-relaxed">
                Giskard could not find exploitable vulnerabilities in this configuration.
                The system prompt is effectively limiting dangerous outputs.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Section7Scan() {
  const [brokenResult, setBrokenResult] = useState(null);
  const [fixedResult, setFixedResult] = useState(null);
  const [brokenLoading, setBrokenLoading] = useState(false);
  const [fixedLoading, setFixedLoading] = useState(false);
  const [brokenError, setBrokenError] = useState(null);
  const [fixedError, setFixedError] = useState(null);

  const runScan = async (mode) => {
    const setLoading = mode === 'broken' ? setBrokenLoading : setFixedLoading;
    const setResult = mode === 'broken' ? setBrokenResult : setFixedResult;
    const setError = mode === 'broken' ? setBrokenError : setFixedError;

    setLoading(true);
    setError(null);

    // 5-minute timeout — scans are genuinely slow
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5 * 60 * 1000);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Backend returned ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      clearTimeout(timeout);
      setError(
        e.name === 'AbortError'
          ? 'Scan timed out after 5 minutes. Try again.'
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const bothDone = brokenResult && fixedResult;
  const issuesReduced = bothDone && fixedResult.total_issues < brokenResult.total_issues;

  return (
    <section id="section-7" className="py-20 px-4 border-t border-gray-900 bg-gray-950/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-400 text-xs font-bold flex items-center justify-center">7</span>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">Automated Attack Surface</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Giskard Vulnerability Scan</h2>
        <p className="text-gray-400 mb-4 max-w-2xl leading-relaxed">
          DeepEval scored the responses you gave it. Giskard goes further —
          it <span className="text-white font-medium">automatically generates adversarial probes</span> and
          tests the model itself to find which vulnerability categories are exploitable.
        </p>

        {/* DeepEval vs Giskard comparison */}
        <div className="mb-8 rounded-xl border border-indigo-900/40 bg-indigo-950/10 p-4">
          <div className="flex items-start gap-1.5 mb-3">
            <Info size={13} className="text-indigo-400 mt-0.5 shrink-0" />
            <span className="text-xs text-indigo-400 font-semibold">How these two tools differ</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-gray-400">
            <div className="space-y-1">
              <p className="text-yellow-400 font-semibold">DeepEval — Section 3 &amp; 6</p>
              <p className="leading-relaxed">You provide the responses. It scores them for bias, toxicity, and harm. Tells you <span className="text-white">how bad</span> specific outputs are.</p>
            </div>
            <div className="space-y-1">
              <p className="text-indigo-400 font-semibold">Giskard — This Section</p>
              <p className="leading-relaxed">Giskard generates its own attack prompts and runs them. Tells you <span className="text-white">which vulnerabilities exist</span> and whether the model can be exploited.</p>
            </div>
          </div>
        </div>

        {/* Two scan panels */}
        <div className="space-y-4 mb-8">
          <ScanPanel
            label="Broken Chatbot — minimal system prompt, no guardrails"
            mode="broken"
            result={brokenResult}
            loading={brokenLoading}
            onScan={() => runScan('broken')}
            error={brokenError}
          />
          <ScanPanel
            label="Fixed Chatbot — hardened system prompt + guardrails"
            mode="fixed"
            result={fixedResult}
            loading={fixedLoading}
            onScan={() => runScan('fixed')}
            error={fixedError}
          />
        </div>

        {/* Comparison verdict */}
        {bothDone && (
          <div className={`rounded-xl border p-6 ${fixedResult.passed ? 'border-green-700 bg-green-950/20' : issuesReduced ? 'border-yellow-700 bg-yellow-950/20' : 'border-red-700 bg-red-950/20'}`}>
            <div className="flex items-center justify-center gap-10 mb-5">
              <div className="text-center">
                <p className="text-4xl font-bold text-red-400">{brokenResult.total_issues}</p>
                <p className="text-xs text-gray-500 mt-1.5">vulnerabilities<br />broken chatbot</p>
              </div>
              <div className="text-gray-600 text-xl">→</div>
              <div className="text-center">
                <p className={`text-4xl font-bold ${fixedResult.passed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {fixedResult.total_issues}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">vulnerabilities<br />fixed chatbot</p>
              </div>
            </div>

            {fixedResult.passed ? (
              <>
                <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-green-400 text-center mb-2">Attack Surface Eliminated</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto text-center leading-relaxed">
                  Giskard found no exploitable vulnerabilities in the fixed chatbot.
                  A well-designed system prompt closes the attack surface that existed in the broken version.
                </p>
              </>
            ) : issuesReduced ? (
              <>
                <AlertTriangle size={28} className="text-yellow-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-yellow-400 text-center mb-2">Attack Surface Significantly Reduced</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto text-center leading-relaxed">
                  The fixed chatbot has fewer exploitable vulnerabilities.
                  Some residual issues remain — further hardening of the system prompt or guardrail thresholds is recommended.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle size={28} className="text-red-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-red-400 text-center mb-2">Vulnerabilities Persist</h3>
                <p className="text-gray-400 text-sm max-w-lg mx-auto text-center leading-relaxed">
                  The current fixes have not eliminated the detected vulnerabilities.
                  Stronger system prompt constraints and additional guardrail rules are needed.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
