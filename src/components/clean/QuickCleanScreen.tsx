import React, { useState, useEffect, useMemo } from 'react';
import { ThemeConfig, JunkCategory } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import { MatrixRainCanvas } from '../MatrixRainCanvas';
import { Android16OverlayModal } from './Android16OverlayModal';
import {
  Trash2,
  CheckSquare,
  Square,
  Terminal,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FolderOpen,
  Info,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';

interface QuickCleanScreenProps {
  theme: ThemeConfig;
  categories: JunkCategory[];
  onUpdateCategories: (categories: JunkCategory[]) => void;
  onPurgeComplete: (reclaimedBytes: number, itemsCount: number) => void;
  lastCleanTimestamp: string | null;
  totalReclaimedAllTime: number;
  onOpenAdvisor?: () => void;
  growthRateMBPerDay?: number;
}

export const QuickCleanScreen: React.FC<QuickCleanScreenProps> = ({
  theme,
  categories,
  onUpdateCategories,
  onPurgeComplete,
  lastCleanTimestamp,
  totalReclaimedAllTime,
  onOpenAdvisor,
  growthRateMBPerDay = 412,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [tickerMessage, setTickerMessage] = useState('SYS_IDLE: READY FOR FORENSIC SCAN');
  const [hasScanned, setHasScanned] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Purge confirmation modal
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [typedConfirmation, setTypedConfirmation] = useState('');

  // 10s undo banner
  const [undoState, setUndoState] = useState<{
    active: boolean;
    reclaimedBytes: number;
    secondsLeft: number;
    backupCategories: JunkCategory[];
  }>({
    active: false,
    reclaimedBytes: 0,
    secondsLeft: 10,
    backupCategories: [],
  });

  // Android 16 Guided Overlay state
  const [showAndroid16Overlay, setShowAndroid16Overlay] = useState(false);

  // Calculate totals
  const selectedBytes = useMemo(() => {
    return categories
      .filter((c) => c.selected)
      .reduce((sum, cat) => {
        const itemSum = cat.items.filter((i) => i.selected).reduce((s, i) => s + i.sizeBytes, 0);
        return sum + itemSum;
      }, 0);
  }, [categories]);

  const selectedCount = useMemo(() => {
    return categories
      .filter((c) => c.selected)
      .reduce((sum, cat) => sum + cat.items.filter((i) => i.selected).length, 0);
  }, [categories]);

  // Scan simulation
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setHasScanned(false);

    const scanMessages = [
      'INITIALIZING SCANNER KERNEL...',
      'PROBING APP STORAGE STATS (StorageStatsManager)...',
      'SCANNING CACHE BUFFERS... 342 MB',
      'SCANNING CACHE BUFFERS... 1.2 GB',
      'DETECTING ORPHANED APP RESIDUALS (sdcard/Android/data)...',
      'INDEXING EMPTY DIRECTORIES & ORPHAN INODES...',
      'EVALUATING STALE LOGS, CRASH DUMPS & THUMBNAILS...',
      'ANALYZING DOWNLOADS (>30 DAYS RETENTION)...',
      'INSPECTING CLIPBOARD FRAGMENTS & BROWSER BUFFERS...',
      'COMPILING RECLAIMABLE STORAGE INDEX...',
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      const pct = Math.min(Math.round((step / scanMessages.length) * 100), 100);
      setScanProgress(pct);
      setTickerMessage(scanMessages[step - 1] || 'FINALIZING...');

      if (step >= scanMessages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsScanning(false);
          setHasScanned(true);
          setTickerMessage(`SCAN COMPLETE: FOUND ${formatBytes(selectedBytes)} JUNK`);
        }, 400);
      }
    }, 280);
  };

  // Undo countdown
  useEffect(() => {
    if (!undoState.active) return;
    const interval = setInterval(() => {
      setUndoState((prev) => {
        if (prev.secondsLeft <= 1) {
          clearInterval(interval);
          return { ...prev, active: false };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [undoState.active]);

  const handleToggleCategory = (catId: string) => {
    const updated = categories.map((c) => {
      if (c.id === catId) {
        const nextState = !c.selected;
        return {
          ...c,
          selected: nextState,
          items: c.items.map((item) => ({ ...item, selected: nextState })),
        };
      }
      return c;
    });
    onUpdateCategories(updated);
  };

  const handleToggleItem = (catId: string, itemId: string) => {
    const updated = categories.map((c) => {
      if (c.id === catId) {
        const newItems = c.items.map((i) => (i.id === itemId ? { ...i, selected: !i.selected } : i));
        const anySelected = newItems.some((i) => i.selected);
        return {
          ...c,
          selected: anySelected,
          items: newItems,
        };
      }
      return c;
    });
    onUpdateCategories(updated);
  };

  const executePurge = () => {
    setShowPurgeConfirm(false);
    const purgedBytes = selectedBytes;
    const purgedCount = selectedCount;

    // Check if App Cache is selected and Android 16 overlay applies
    const cacheCat = categories.find((c) => c.id === 'cache' && c.selected);
    if (cacheCat && cacheCat.requiresAndroid16Overlay) {
      setShowAndroid16Overlay(true);
      return;
    }

    commitPurge(purgedBytes, purgedCount);
  };

  const commitPurge = (purgedBytes: number, purgedCount: number) => {
    const backup = JSON.parse(JSON.stringify(categories));

    // Zero out or remove cleaned items
    const updated = categories.map((cat) => {
      if (!cat.selected) return cat;
      const unselectedItems = cat.items.filter((i) => !i.selected);
      const remainingBytes = unselectedItems.reduce((s, i) => s + i.sizeBytes, 0);
      return {
        ...cat,
        sizeBytes: remainingBytes,
        fileCount: unselectedItems.length,
        selected: false,
        items: unselectedItems,
      };
    });

    onUpdateCategories(updated);
    onPurgeComplete(purgedBytes, purgedCount);

    // Trigger 10s undo window
    setUndoState({
      active: true,
      reclaimedBytes: purgedBytes,
      secondsLeft: 10,
      backupCategories: backup,
    });
    setTickerMessage(`PURGE COMPLETED: RECLAIMED ${formatBytes(purgedBytes)}`);
  };

  const handleUndoPurge = () => {
    if (undoState.backupCategories.length > 0) {
      onUpdateCategories(undoState.backupCategories);
      setUndoState({ active: false, reclaimedBytes: 0, secondsLeft: 0, backupCategories: [] });
      setTickerMessage('PURGE ROLLBACK: RESTORED ORIGINAL INODES');
    }
  };

  // Reclaim ring percentage (arbitrary based on 3.5 GB capacity benchmark)
  const maxBenchmark = 3500000000;
  const ringPercentage = Math.min(Math.round((selectedBytes / maxBenchmark) * 100), 100);
  const strokeDashoffset = 440 - (440 * (isScanning ? scanProgress : ringPercentage)) / 100;

  return (
    <div className="relative min-h-full pb-24 text-white">
      {/* Background Matrix falling rain (Home screen only) */}
      <MatrixRainCanvas theme={theme} opacity={0.16} />

      <div className="relative z-10 px-4 pt-3 space-y-4">
        {/* Terminal Header Bar */}
        <div
          className="rounded-lg p-3 border font-mono-tech flex items-center justify-between text-xs"
          style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderColor: `${theme.accent}40`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
            <span className="text-neutral-400 font-medium">TERMINAL HUD</span>
            <span className="text-neutral-600">/</span>
            <span className="text-white font-semibold">{theme.terminalPrompt}</span>
          </div>

          <div className="text-[11px] text-neutral-400">
            {lastCleanTimestamp ? `LAST: ${lastCleanTimestamp}` : 'LAST: NEVER'}
          </div>
        </div>

        {/* 10s Undo Floating Bar */}
        {undoState.active && (
          <div
            className="p-3 rounded-lg border font-mono-tech flex items-center justify-between shadow-xl animate-bounce-once"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.accent,
            }}
          >
            <div className="flex items-center gap-2">
              <RotateCcw size={16} style={{ color: theme.accent }} />
              <div>
                <div className="text-xs font-bold text-white">
                  PURGED {formatBytes(undoState.reclaimedBytes)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Undo window closes in {undoState.secondsLeft}s
                </div>
              </div>
            </div>
            <button
              onClick={handleUndoPurge}
              className="px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: '#000000',
              }}
            >
              UNDO ROLLBACK
            </button>
          </div>
        )}

        {/* Central Circular Gauge / Scanner Area */}
        <div
          className="rounded-2xl p-6 border text-center relative overflow-hidden backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(5, 8, 5, 0.85)',
            borderColor: `${theme.accent}30`,
          }}
        >
          <div className="flex flex-col items-center justify-center my-2">
            {/* SVG Circular Progress Meter */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Track */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                />
                {/* Active Bar */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="10"
                  strokeDasharray="440"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                  style={{
                    filter: `drop-shadow(0 0 6px ${theme.accent})`,
                  }}
                />
              </svg>

              {/* Inside Gauge Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-tech">
                {isScanning ? (
                  <>
                    <span className="text-xs text-neutral-400 uppercase tracking-widest">
                      SCANNING
                    </span>
                    <span className="text-3xl font-extrabold" style={{ color: theme.accent }}>
                      {scanProgress}%
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-1">SYS INODES</span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider">
                      RECLAIMABLE
                    </span>
                    <span className="text-2xl font-black tracking-tight text-white mt-0.5">
                      {formatBytes(selectedBytes)}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1">
                      {selectedCount} JUNK ARTIFACTS
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Terminal Ticker */}
          <div className="mt-3 p-2.5 rounded bg-black/90 border border-white/10 font-mono-tech text-left text-xs flex items-center gap-2">
            <Terminal size={14} className="shrink-0" style={{ color: theme.accent }} />
            <div className="truncate text-neutral-300 text-[11px]">
              <span style={{ color: theme.accent }}>&gt; </span>
              {tickerMessage}
              <span className="cursor-blink ml-1 text-white">_</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="mt-5 flex gap-3">
            {!hasScanned && !isScanning ? (
              <button
                onClick={handleStartScan}
                className="w-full py-3.5 px-4 rounded-xl font-mono-tech font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] cursor-pointer"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000000',
                  boxShadow: `0 4px 20px ${theme.accentGlow}`,
                }}
              >
                <Sparkles size={16} />
                DEEP FORENSIC SCAN
              </button>
            ) : isScanning ? (
              <button
                disabled
                className="w-full py-3.5 px-4 rounded-xl font-mono-tech font-bold text-sm tracking-wider flex items-center justify-center gap-2 opacity-80 cursor-wait bg-neutral-800 text-neutral-400 border border-neutral-700"
              >
                <div
                  className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
                  style={{ borderTopColor: theme.accent }}
                />
                EXECUTING KERNEL PROBE...
              </button>
            ) : (
              <div className="w-full flex gap-2">
                <button
                  onClick={handleStartScan}
                  className="py-3 px-3 rounded-xl font-mono-tech font-medium text-xs border border-white/20 hover:bg-white/5 transition-colors cursor-pointer text-neutral-300"
                >
                  RE-SCAN
                </button>
                <button
                  onClick={() => setShowPurgeConfirm(true)}
                  disabled={selectedBytes === 0}
                  className="flex-1 py-3 px-4 rounded-xl font-mono-tech font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000000',
                    boxShadow: `0 4px 20px ${theme.accentGlow}`,
                  }}
                >
                  <Trash2 size={16} />
                  EXECUTE PURGE ({formatBytes(selectedBytes)})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* All-time Stats Metric strip */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
            >
              <Zap size={16} />
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 uppercase">Total Purged</div>
              <div className="text-sm font-bold text-white">
                {formatBytes(totalReclaimedAllTime || 12400000000)}
              </div>
            </div>
          </div>

          <div
            onClick={onOpenAdvisor}
            className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 hover:border-white/30 flex items-center justify-between cursor-pointer transition-all group"
            style={{
              borderColor: onOpenAdvisor ? `${theme.accent}30` : undefined,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg transition-transform group-hover:scale-105"
                style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[10px] text-neutral-400 uppercase">Smart Advisor</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>+{growthRateMBPerDay} MB/d</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-green-400 font-bold uppercase">WorkManager</div>
              <div className="text-[9px] text-neutral-500">Tap to inspect &gt;</div>
            </div>
          </div>
        </div>

        {/* Junk Categories Checkbox List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-tech text-neutral-400 px-1 pt-2">
            <span>DISCOVERED JUNK NODES ({categories.length})</span>
            <span style={{ color: theme.accent }}>
              {formatBytes(selectedBytes)} CHECKED
            </span>
          </div>

          {categories.map((cat) => {
            const isExpanded = expandedCategoryId === cat.id;
            const catSelectedSize = cat.items
              .filter((i) => i.selected)
              .reduce((s, i) => s + i.sizeBytes, 0);

            return (
              <div
                key={cat.id}
                className="rounded-xl border transition-all duration-200 overflow-hidden font-mono-tech"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.75)',
                  borderColor: cat.selected ? `${theme.accent}50` : 'rgba(255,255,255,0.08)',
                }}
              >
                {/* Header Row */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleCategory(cat.id)}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      {cat.selected ? (
                        <CheckSquare size={18} style={{ color: theme.accent }} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>

                    <div
                      className="cursor-pointer flex-1 min-w-0"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {cat.title}
                        </span>
                        {cat.requiresAndroid16Overlay && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${theme.accent}25`,
                              color: theme.accent,
                            }}
                          >
                            API 36
                          </span>
                        )}
                        {cat.isSensitive && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            Review
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {cat.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 ml-2">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {formatBytes(catSelectedSize)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {cat.items.length} items
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                      className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Sub-items drill-down */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-black/40 p-2.5 space-y-1.5">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(cat.id, item.id)}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {item.selected ? (
                            <CheckSquare size={14} style={{ color: theme.accent }} />
                          ) : (
                            <Square size={14} className="text-neutral-500" />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-white truncate text-[11px]">
                              {item.name}
                            </div>
                            <div className="text-[9px] text-neutral-500 truncate">
                              {item.details || item.path}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2 shrink-0 font-mono-tech text-[11px] font-semibold text-neutral-300">
                          {formatBytes(item.sizeBytes)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPurgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-sm rounded-xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.accent,
            }}
          >
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <AlertCircle size={20} />
              <span className="text-xs uppercase font-bold tracking-wider text-white">
                CONFIRM KERNEL PURGE
              </span>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-4">
              You are about to irreversibly purge{' '}
              <strong className="text-white font-mono-tech">{formatBytes(selectedBytes)}</strong> of
              selected junk across {selectedCount} system and app nodes.
            </p>

            <div className="p-2.5 rounded bg-black/60 border border-white/10 mb-4 text-[11px] text-neutral-400">
              <div className="text-neutral-500 text-[10px] mb-1">AUDIT SUMMARY:</div>
              <div>• Cache & stream buffers: Safe</div>
              <div>• Residual uninstalled configs: Safe</div>
              <div>• Photos & documents: Protected</div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                Type &quot;PURGE&quot; or tap Execute:
              </label>
              <input
                type="text"
                placeholder="PURGE"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
                className="w-full py-2 px-3 rounded bg-black border border-white/20 text-white font-mono-tech text-xs tracking-wider focus:outline-none"
                style={{ borderColor: theme.accent }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="flex-1 py-2.5 rounded border border-white/20 text-neutral-300 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
              >
                ABORT
              </button>
              <button
                onClick={executePurge}
                className="flex-1 py-2.5 rounded font-bold text-xs tracking-wider transition-all cursor-pointer"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000000',
                }}
              >
                EXECUTE PURGE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android 16 Guided Overlay Simulation */}
      <Android16OverlayModal
        theme={theme}
        isOpen={showAndroid16Overlay}
        onClose={() => setShowAndroid16Overlay(false)}
        onComplete={() => {
          setShowAndroid16Overlay(false);
          commitPurge(selectedBytes, selectedCount);
        }}
        appsToClean={[
          { name: 'YouTube', packageName: 'com.google.android.youtube', cacheSize: '642 MB' },
          { name: 'Spotify', packageName: 'com.spotify.music', cacheSize: '420 MB' },
          { name: 'Instagram', packageName: 'com.instagram.android', cacheSize: '318 MB' },
          { name: 'TikTok', packageName: 'com.zhiliaoapp.musically', cacheSize: '108 MB' },
        ]}
      />
    </div>
  );
};
