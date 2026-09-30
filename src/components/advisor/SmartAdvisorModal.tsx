import React, { useState } from 'react';
import { ThemeConfig, SmartAdvisorConfig, GrowthDataPoint } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import {
  Clock,
  Calendar,
  AlertTriangle,
  BellRing,
  TrendingUp,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  X,
  Play,
  Sliders,
  BatteryCharging,
  Zap,
} from 'lucide-react';

interface SmartAdvisorModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  advisorConfig: SmartAdvisorConfig;
  onUpdateConfig: (config: SmartAdvisorConfig) => void;
  onTriggerSimulatedNotification: (title: string, message: string, projectedBytes: number) => void;
  onNavigateToClean: () => void;
}

export const MOCK_GROWTH_HISTORY: GrowthDataPoint[] = [
  { dayLabel: 'Thu', junkAccumulatedMB: 340, streamingCacheMB: 160, socialCacheMB: 120, tempLogsMB: 60 },
  { dayLabel: 'Fri', junkAccumulatedMB: 480, streamingCacheMB: 220, socialCacheMB: 180, tempLogsMB: 80 },
  { dayLabel: 'Sat', junkAccumulatedMB: 590, streamingCacheMB: 290, socialCacheMB: 210, tempLogsMB: 90 },
  { dayLabel: 'Sun', junkAccumulatedMB: 620, streamingCacheMB: 310, socialCacheMB: 220, tempLogsMB: 90 },
  { dayLabel: 'Mon', junkAccumulatedMB: 380, streamingCacheMB: 180, socialCacheMB: 140, tempLogsMB: 60 },
  { dayLabel: 'Tue', junkAccumulatedMB: 420, streamingCacheMB: 200, socialCacheMB: 160, tempLogsMB: 60 },
  { dayLabel: 'Today', junkAccumulatedMB: 450, streamingCacheMB: 215, socialCacheMB: 175, tempLogsMB: 60 },
];

export const SmartAdvisorModal: React.FC<SmartAdvisorModalProps> = ({
  theme,
  isOpen,
  onClose,
  advisorConfig,
  onUpdateConfig,
  onTriggerSimulatedNotification,
  onNavigateToClean,
}) => {
  const [isSimulatingWorker, setIsSimulatingWorker] = useState(false);
  const [workerLog, setWorkerLog] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate remaining time
  const now = Date.now();
  const msRemaining = Math.max(0, advisorConfig.recommendedCleanTimestamp - now);
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const remHours = hoursRemaining % 24;

  const handleSimulateWorkManager = () => {
    setIsSimulatingWorker(true);
    setWorkerLog('WorkManager: Initializing PeriodicWorkRequest constraints...');

    setTimeout(() => {
      setWorkerLog('StorageStatsManager: Querying linear delta over last 7 days (+412 MB/day)...');

      setTimeout(() => {
        setWorkerLog('SmartAdvisorWorker: Threshold limit reached (Projected 1.48 GB >= 1.00 GB).');

        setTimeout(() => {
          setIsSimulatingWorker(false);
          setWorkerLog(null);
          onTriggerSimulatedNotification(
            'UnderGround Smart Advisor',
            'Storage accumulation rate exceeded limit (+1.48 GB junk projected). Tap to review and purge.',
            1480000000
          );
        }, 600);
      }, 700);
    }, 600);
  };

  const handleSetThreshold = (bytes: number) => {
    // Recalculate target timestamp based on growth velocity
    const daysToReach = bytes / (advisorConfig.growthRateMBPerDay * 1024 * 1024);
    const newTarget = Date.now() + daysToReach * 24 * 60 * 60 * 1000;
    onUpdateConfig({
      ...advisorConfig,
      thresholdBytes: bytes,
      recommendedCleanTimestamp: Math.round(newTarget),
    });
  };

  const maxBarValue = 700;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div
        className="w-full max-w-lg rounded-2xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.accent,
          boxShadow: `0 0 35px ${theme.accentGlow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={20} style={{ color: theme.accent }} />
            <div>
              <span className="text-sm font-bold text-white uppercase">
                WorkManager Smart Advisor
              </span>
              <span className="text-[10px] text-neutral-400 block font-normal">
                Predictive Storage Growth Engine (targetSdk 36)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Main Status & Countdown Widget */}
          <div
            className="p-4 rounded-xl border relative overflow-hidden"
            style={{
              backgroundColor: 'rgba(5, 10, 5, 0.9)',
              borderColor: `${theme.accent}40`,
            }}
          >
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <span
                  className="w-2 h-2 rounded-full inline-block animate-pulse"
                  style={{ backgroundColor: theme.accent }}
                />
                ADVISOR REPUTATION SCORE: OPTIMAL
              </span>
              <span style={{ color: theme.accent }}>
                RATE: +{advisorConfig.growthRateMBPerDay} MB / DAY
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black text-white">
                {daysRemaining > 0 ? `${daysRemaining}d ${remHours}h` : `${hoursRemaining}h`}
              </span>
              <span className="text-neutral-400 text-xs font-normal">
                UNTIL NEXT RECOMMENDED CLEAN
              </span>
            </div>

            <div className="text-[11px] text-neutral-300 font-sans leading-relaxed">
              At your current accrual velocity (+{advisorConfig.growthRateMBPerDay} MB/day), storage
              will cross your alert threshold of{' '}
              <strong className="text-white font-mono-tech">
                {formatBytes(advisorConfig.thresholdBytes)}
              </strong>
              .
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-neutral-400">
              <span>WORKMANAGER JOB ID: #SMART_CLEAN_01</span>
              <span>BATTERY_NOT_LOW: ENFORCED</span>
            </div>
          </div>

          {/* 7-Day Accrual Trend Graph */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <TrendingUp size={14} style={{ color: theme.accent }} />
                <span>7-Day Accrual Velocity Breakdown</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                Avg: {advisorConfig.growthRateMBPerDay} MB/d
              </span>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-2 pt-3 pb-1 border-b border-white/10">
              {MOCK_GROWTH_HISTORY.map((item, idx) => {
                const heightPct = Math.round((item.junkAccumulatedMB / maxBarValue) * 100);
                const isToday = idx === MOCK_GROWTH_HISTORY.length - 1;

                return (
                  <div key={item.dayLabel} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="text-[9px] text-neutral-400">{item.junkAccumulatedMB}</div>
                    <div className="w-full bg-neutral-900 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: '100%',
                          backgroundColor: isToday ? theme.accent : 'rgba(255,255,255,0.25)',
                        }}
                        title={`${item.dayLabel}: +${item.junkAccumulatedMB} MB`}
                      />
                    </div>
                    <div className={`text-[10px] ${isToday ? 'font-bold text-white' : 'text-neutral-500'}`}>
                      {item.dayLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-neutral-400">
              <div>• Streaming: 48%</div>
              <div>• Social feeds: 38%</div>
              <div>• Temp logs: 14%</div>
            </div>
          </div>

          {/* User-Configurable Thresholds */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sliders size={14} style={{ color: theme.accent }} />
                <span>Notification Threshold Limit</span>
              </span>
              <span className="text-white font-bold">
                {formatBytes(advisorConfig.thresholdBytes)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '500 MB', bytes: 524288000 },
                { label: '1.0 GB', bytes: 1073741824 },
                { label: '2.0 GB', bytes: 2147483648 },
                { label: '4.0 GB', bytes: 4294967296 },
              ].map((p) => {
                const isSelected = advisorConfig.thresholdBytes === p.bytes;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSetThreshold(p.bytes)}
                    className={`py-2 rounded-lg border text-center font-bold text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-transparent text-black'
                        : 'border-white/10 text-neutral-300 hover:text-white bg-black/40'
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme.accent : undefined,
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* WorkManager Job Constraints */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 space-y-2.5">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <Cpu size={14} style={{ color: theme.accent }} />
              <span>WorkManager Constraints (Android 16 Battery Discipline)</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px]">
                  Requires Battery Not Low (&gt;20%)
                </span>
                <input
                  type="checkbox"
                  checked={advisorConfig.requiresBatteryNotLow}
                  onChange={(e) =>
                    onUpdateConfig({ ...advisorConfig, requiresBatteryNotLow: e.target.checked })
                  }
                  className="rounded cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px]">
                  Only run while device is charging
                </span>
                <input
                  type="checkbox"
                  checked={advisorConfig.requiresCharging}
                  onChange={(e) =>
                    onUpdateConfig({ ...advisorConfig, requiresCharging: e.target.checked })
                  }
                  className="rounded cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-neutral-300 text-[11px]">
                  Dispatch heads-up notification with sound
                </span>
                <input
                  type="checkbox"
                  checked={advisorConfig.alertNotificationSound}
                  onChange={(e) =>
                    onUpdateConfig({ ...advisorConfig, alertNotificationSound: e.target.checked })
                  }
                  className="rounded cursor-pointer"
                  style={{ accentColor: theme.accent }}
                />
              </label>
            </div>
          </div>

          {/* Worker Log Ticker if simulating */}
          {workerLog && (
            <div className="p-2.5 rounded bg-black border border-white/20 text-[11px] text-green-400 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin"
                style={{ borderTopColor: theme.accent }}
              />
              <span>{workerLog}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 mt-3 shrink-0 flex gap-2">
          <button
            onClick={handleSimulateWorkManager}
            disabled={isSimulatingWorker}
            className="flex-1 py-2.5 rounded border border-white/20 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <BellRing size={14} style={{ color: theme.accent }} />
            <span>Simulate WorkManager Alert</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToClean();
            }}
            className="flex-1 py-2.5 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            style={{ backgroundColor: theme.accent, color: '#000000' }}
          >
            <Zap size={14} />
            <span>Open Quick Clean</span>
          </button>
        </div>
      </div>
    </div>
  );
};
