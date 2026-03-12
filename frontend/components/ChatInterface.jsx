'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Shield, Bot, User } from 'lucide-react';

export default function ChatInterface({ mode = 'broken', guardrailsEnabled = false, presetMessage = '' }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, blocked]);

  useEffect(() => {
    if (presetMessage) setInput(presetMessage);
  }, [presetMessage]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setBlocked(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, mode, guardrailsEnabled }),
      });
      const data = await res.json();

      if (data.blocked) {
        setBlocked({ reason: data.reason, score: data.score });
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const isBroken = mode === 'broken';

  return (
    <div className={`flex flex-col h-[420px] rounded-xl border ${isBroken ? 'border-red-800 bg-red-950/10' : 'border-green-800 bg-green-950/10'}`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isBroken ? 'border-red-900' : 'border-green-900'}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isBroken ? 'bg-red-500' : 'bg-green-500'}`} />
        <span className={`text-xs font-mono font-semibold ${isBroken ? 'text-red-400' : 'text-green-400'}`}>
          {isBroken ? 'BROKEN MODE — No guardrails active' : 'FIXED MODE — Safe system prompt loaded'}
        </span>
        {guardrailsEnabled && (
          <span className="ml-auto flex items-center gap-1 text-xs text-purple-400 border border-purple-800 rounded-full px-2 py-0.5">
            <Shield size={10} /> Guardrails ON
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center pt-10">Send a message to start the conversation...</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-700' : isBroken ? 'bg-red-900' : 'bg-green-900'}`}>
              {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div className={`max-w-sm px-3 py-2 rounded-lg text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : isBroken
                  ? 'bg-gray-900 border border-red-900/50 text-gray-200 rounded-tl-none'
                  : 'bg-gray-900 border border-green-900/50 text-gray-200 rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2">
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isBroken ? 'bg-red-900' : 'bg-green-900'}`}>
              <Bot size={12} />
            </div>
            <div className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {blocked && (
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-purple-900">
              <Shield size={12} className="text-purple-400" />
            </div>
            <div className="bg-purple-950/40 border border-purple-700 px-3 py-2 rounded-lg rounded-tl-none text-sm max-w-sm">
              <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
                <AlertTriangle size={13} /> Response blocked by guardrail
              </div>
              <p className="text-xs text-purple-400">{blocked.reason}</p>
              <p className="text-xs text-gray-600 mt-1">Harm score: {((blocked.score || 0) * 100).toFixed(0)}%</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a medical question..."
          className="flex-1 bg-gray-900 text-gray-100 placeholder-gray-600 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white p-2 rounded-lg transition-colors"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
