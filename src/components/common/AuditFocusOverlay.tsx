import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  Play,
  Pause,
  Plus,
  RotateCcw,
} from 'lucide-react';

interface AuditFocusOverlayProps {
  onClose: () => void;
  onPostSuccessBurst?: () => void;
}

export const AuditFocusOverlay: React.FC<AuditFocusOverlayProps> = ({
  onClose,
  onPostSuccessBurst,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(true);
  const totalSeconds = 25 * 60;

  const [checklist, setChecklist] = useState([
    { id: '1', label: 'Verify trial balance debits == credits equality', done: true },
    { id: '2', label: 'Reconcile Operating Cash & Checking with bank statement', done: false },
    { id: '3', label: 'Check unposted journal drafts and adjust depreciation', done: false },
    { id: '4', label: 'Audit Accounts Payable (A/P) vendor aging schedule', done: false },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const ringRadius = 90;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const progressPercent = (secondsLeft / totalSeconds) * 100;
  const strokeOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  const toggleCheck = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    if (updated.every((i) => i.done) && onPostSuccessBurst) {
      onPostSuccessBurst();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[140px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-indigo-400/40 text-indigo-200 text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          <span>Audit & Reconciliation Focus Session</span>
        </div>

        {/* Circular Countdown Arc */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={ringRadius}
              className="stroke-white/10"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={ringRadius}
              className="stroke-indigo-400 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(99,102,241,0.8)]"
              strokeWidth="5"
              strokeDasharray={ringCircumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="w-44 h-44 rounded-full liquid-glass-elevated border border-indigo-300/40 flex flex-col items-center justify-center shadow-2xl p-4">
            <span className="font-mono text-4xl font-extrabold tracking-tight text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {timeFormatted}
            </span>
            <span className="text-[11px] uppercase font-mono tracking-widest text-indigo-300 mt-1">
              {isRunning ? 'Reconciling' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="liquid-glass-elevated rounded-full p-2 flex items-center gap-2 border border-white/20 shadow-2xl mb-6">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all shadow-lg press-bounce ${
              isRunning ? 'bg-amber-500/80 hover:bg-amber-400' : 'bg-emerald-500/80 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => setSecondsLeft((s) => s + 5 * 60)}
            className="px-3.5 py-2 rounded-full hover:bg-white/10 text-slate-200 text-xs font-mono font-medium border border-white/10 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>5m</span>
          </button>

          <button
            onClick={() => {
              setSecondsLeft(25 * 60);
              setIsRunning(false);
            }}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-white/10 mx-1" />

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Checklist */}
        <div className="w-full liquid-glass rounded-2xl p-4 border border-white/10 space-y-2 text-left">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Reconciliation Checklist ({checklist.filter((c) => c.done).length}/{checklist.length})
          </span>
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 cursor-pointer transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                  item.done ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-white/20'
                }`}
              >
                {item.done && <Check className="w-3 h-3 stroke-[2.5]" />}
              </div>
              <span className={item.done ? 'line-through text-slate-500' : ''}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
