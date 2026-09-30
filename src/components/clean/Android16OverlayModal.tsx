import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../../types/cleaner';
import { ShieldCheck, Play, CheckCircle2, ChevronRight, X, AlertTriangle } from 'lucide-react';

interface Android16OverlayModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  appsToClean: { name: string; packageName: string; cacheSize: string }[];
}

export const Android16OverlayModal: React.FC<Android16OverlayModalProps> = ({
  theme,
  isOpen,
  onClose,
  onComplete,
  appsToClean,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [cleanedApps, setCleanedApps] = useState<string[]>([]);
  const [overlayPhase, setOverlayPhase] = useState<'opening' | 'inspecting' | 'clearing' | 'done'>('opening');

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsRunning(false);
      setCleanedApps([]);
      setOverlayPhase('opening');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isRunning || currentStepIndex >= appsToClean.length) return;

    const currentApp = appsToClean[currentStepIndex];

    // Phase 1: opening app settings
    setOverlayPhase('opening');
    const timer1 = setTimeout(() => {
      setOverlayPhase('inspecting');

      // Phase 2: locating clear cache target
      const timer2 = setTimeout(() => {
        setOverlayPhase('clearing');

        // Phase 3: tapped clear cache
        const timer3 = setTimeout(() => {
          setCleanedApps((prev) => [...prev, currentApp.packageName]);
          if (currentStepIndex + 1 < appsToClean.length) {
            setCurrentStepIndex((prev) => prev + 1);
          } else {
            setIsRunning(false);
            setOverlayPhase('done');
            setTimeout(() => {
              onComplete();
            }, 800);
          }
        }, 600);

        return () => clearTimeout(timer3);
      }, 700);

      return () => clearTimeout(timer2);
    }, 600);

    return () => clearTimeout(timer1);
  }, [isRunning, currentStepIndex, appsToClean, onComplete]);

  if (!isOpen) return null;

  const currentApp = appsToClean[currentStepIndex] || appsToClean[0];
  const progressPercent = Math.round((cleanedApps.length / appsToClean.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl"
        style={{
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.accent,
          boxShadow: `0 0 25px ${theme.accentGlow}`,
        }}
      >
        {/* Header banner */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} style={{ color: theme.accent }} />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">
              Android 16 Guided Cache Assist
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Explain why this exists (Android 16 Scoped Storage requirement) */}
        <div className="text-xs p-3 rounded mb-4 bg-black/60 border border-white/10 flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-neutral-300 leading-relaxed font-sans text-xs">
            <span className="font-semibold text-white font-mono-tech block mb-0.5">
              TARGET_SDK 36 ENGINE PROTOCOL:
            </span>
            Android 16 restricts third-party apps from silently clearing other app caches. UnderGround launches
            the system storage interface overlay to safely purge locked cache without root.
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-neutral-400">BATCH CLEAR PROGRESS</span>
            <span style={{ color: theme.accent }}>
              {cleanedApps.length} / {appsToClean.length} APPS ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded bg-neutral-900 overflow-hidden border border-white/10">
            <div
              className="h-full transition-all duration-300 rounded"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
        </div>

        {/* Simulated System Settings HUD */}
        <div className="bg-black/80 rounded-lg p-3.5 border border-white/10 mb-4 text-xs">
          <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
            Target System Node:
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
              >
                {currentApp.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white text-xs">{currentApp.name}</div>
                <div className="text-[10px] text-neutral-400">{currentApp.packageName}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold" style={{ color: theme.accent }}>
                {currentApp.cacheSize}
              </div>
              <div className="text-[9px] text-neutral-500">Cache Buffer</div>
            </div>
          </div>

          {/* Stepper Status */}
          <div className="p-2 rounded bg-black border border-white/10 text-[11px] space-y-1">
            <div className="flex items-center gap-2 text-neutral-300">
              <ChevronRight size={12} style={{ color: theme.accent }} />
              <span>Status:</span>
              <span className="font-semibold text-white">
                {overlayPhase === 'opening' && 'Routing to Storage Settings...'}
                {overlayPhase === 'inspecting' && 'Querying StorageStatsManager...'}
                {overlayPhase === 'clearing' && 'Dispatching ClearCache Event...'}
                {overlayPhase === 'done' && 'All locked caches reclaimed successfully!'}
              </span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex gap-2">
          {!isRunning && cleanedApps.length === 0 ? (
            <button
              onClick={() => setIsRunning(true)}
              className="w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: '#000000',
              }}
            >
              <Play size={14} />
              BEGIN GUIDED CACHE CLEAR
            </button>
          ) : (
            <button
              onClick={() => {
                setIsRunning(false);
                onComplete();
              }}
              className="w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20 text-white hover:bg-white/10"
            >
              <CheckCircle2 size={14} style={{ color: theme.accent }} />
              {cleanedApps.length === appsToClean.length ? 'FINISH & RETURN' : 'SKIP REMAINING'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
