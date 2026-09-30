import React, { useState } from 'react';
import { ThemeConfig, ThemeId, PermissionStatus } from '../../types/cleaner';
import { THEMES } from '../../theme/themes';
import {
  Palette,
  Calendar,
  ShieldCheck,
  FileText,
  Sliders,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Terminal,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Code,
} from 'lucide-react';

interface SettingsScreenProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  permissions: PermissionStatus[];
  onTogglePermission: (permissionId: string) => void;
  isSandboxMode: boolean;
  onToggleSandboxMode: () => void;
  onOpenCodeDrawer: () => void;
  onOpenSmartAdvisor?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentTheme,
  onSelectTheme,
  permissions,
  onTogglePermission,
  isSandboxMode,
  onToggleSandboxMode,
  onOpenCodeDrawer,
  onOpenSmartAdvisor,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'scheduler' | 'permissions' | 'store_copy'>('theme');
  const [scheduleFreq, setScheduleFreq] = useState<'daily' | 'weekly' | 'off'>('weekly');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const shortDescriptionPlayStore =
    'High-performance terminal cleaner, storage analyzer & app manager for Android.';

  const fullDescriptionPlayStore = `UnderGround Android Cleaner (com.underground.cleaner) is an elite, forensic-grade storage optimizer designed for modern Android devices (up to Android 16 / API 36).

CORE PROTOCOLS:
• Quick Clean & Cache Purge: Safely cleans hidden & visible app cache, orphaned residual directories from uninstalled apps, empty folder trees, and obsolete crash logs.
• Android 16 Scoped Storage Ready: Employs guided cache clearance routines compatible with targetSdk 36 restrictions.
• Storage Analyzer: Interactive partition treemap, sortable large files radar, and chunked SHA-256 duplicate file detection.
• App Impact & Hibernation: Real-time diagnostics for battery drain and background memory consumption. Identify unused apps (30/60/90 days) and batch-uninstall without root.
• Media & Photo Optimizer: On-device visual analyzer finds motion-blurry, underexposed, overexposed, and duplicate burst photos with 4-level compression presets. WhatsApp & private media are isolated and protected by default.
• Privacy Sanitizer: Opt-in sanitization of clipboard memory, call history, and expired SMS OTP codes.
• Live System Monitor: Real-time CPU core telemetry, LPDDR5X RAM allocation, and battery thermal readings.
• 4 Terminal Themes: Matrix Default (#00FF41), Cyber Pink (#FF2D95), Crimson (#FF1A1A), and Amber (#FF7A00).

SAFETY & LOCAL-FIRST COMMITMENT:
No root required. No automated silent deletion. Includes a 10-second undo recovery safety window. Zero third-party telemetry, ads, or data resale.`;

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* Toast Notification */}
      {copyFeedback && (
        <div
          className="p-3 rounded-lg border text-xs flex items-center gap-2 animate-fadeIn"
          style={{
            backgroundColor: currentTheme.surfaceElevated,
            borderColor: currentTheme.accent,
          }}
        >
          <CheckCircle2 size={16} style={{ color: currentTheme.accent }} />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Developer Source Code & APK Button */}
      <div
        onClick={onOpenCodeDrawer}
        className="p-3.5 rounded-xl border border-white/20 bg-gradient-to-r from-neutral-900 to-black hover:border-white/40 flex items-center justify-between cursor-pointer transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
          >
            <Code size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Android Studio Code & Release Hub</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ backgroundColor: currentTheme.accent, color: '#000000' }}
              >
                API 36
              </span>
            </div>
            <div className="text-[10px] text-neutral-400">
              Inspect build.gradle.kts, Room DB, Compose Theme & AAB instructions
            </div>
          </div>
        </div>
        <ExternalLink size={14} className="text-neutral-400" />
      </div>

      {/* Sub-Tabs */}
      <div className="flex rounded-lg p-1 bg-black/60 border border-white/10 text-xs overflow-x-auto">
        {[
          { id: 'theme', label: 'Matrix Themes' },
          { id: 'scheduler', label: 'Scheduler' },
          { id: 'permissions', label: 'Permissions' },
          { id: 'store_copy', label: 'Play Store Copy' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 px-2.5 text-center rounded whitespace-nowrap font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white/15 text-white font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            style={{ color: activeTab === tab.id ? currentTheme.accent : undefined }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Theme Switcher */}
      {activeTab === 'theme' && (
        <div className="space-y-3">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Palette size={14} style={{ color: currentTheme.accent }} />
            <span>SELECT TERMINAL PALETTE (DATASTORE PERSISTED)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(THEMES) as ThemeId[]).map((themeKey) => {
              const th = THEMES[themeKey];
              const isActive = currentTheme.id === th.id;

              return (
                <div
                  key={th.id}
                  onClick={() => onSelectTheme(th.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isActive ? 'scale-[1.02]' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: th.surfaceElevated,
                    borderColor: isActive ? th.accent : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 15px ${th.accentGlow}` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: th.accent }}
                    />
                    {isActive && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: th.accent, color: '#000000' }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white">{th.name}</div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-1">
                    {th.accent} on {th.bg}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] text-neutral-400 font-sans leading-relaxed">
            All themes are OLED power-optimized with deep #000000 / #0A0A0A blacks, zero blue-light
            bleed, and high WCAG AA contrast.
          </div>
        </div>
      )}

      {/* TAB 2: Scheduler / Advisor */}
      {activeTab === 'scheduler' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: currentTheme.accent }} />
                <span className="font-bold text-xs text-white uppercase">
                  WorkManager Background Scan
                </span>
              </div>
              <span className="text-[10px] text-green-400">NON-DESTRUCTIVE</span>
            </div>

            <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
              UnderGround will periodically calculate accumulated junk in the background and notify
              you. It will <strong>never</strong> auto-delete files without explicit user
              confirmation.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] text-neutral-400 uppercase">Scan Frequency:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'off'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setScheduleFreq(freq)}
                    className={`py-2 rounded-lg border text-center capitalize text-xs font-bold cursor-pointer transition-colors ${
                      scheduleFreq === freq
                        ? 'border-transparent text-black'
                        : 'border-white/10 text-neutral-400 hover:text-white bg-black/40'
                    }`}
                    style={{
                      backgroundColor: scheduleFreq === freq ? currentTheme.accent : undefined,
                    }}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cleaning Advisor */}
          <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Clock size={14} style={{ color: currentTheme.accent }} />
                <span>Smart Junk Accrual Advisor</span>
              </div>
              <span className="text-[10px] text-green-400 font-bold">API 36 WORKER</span>
            </div>

            <div className="text-xs text-neutral-300 font-sans leading-relaxed">
              Calculates daily junk growth (+412 MB/day) using WorkManager background evaluations
              and alerts you when threshold is reached.
              <br />
              <strong className="text-white font-mono-tech block mt-1">
                NEXT RECOMMENDED PURGE: In 2 days (Projected +1.48 GB)
              </strong>
            </div>

            <button
              onClick={onOpenSmartAdvisor}
              className="w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: currentTheme.accent,
                color: '#000000',
              }}
            >
              <Clock size={14} />
              <span>CONFIGURE PREDICTIVE ADVISOR &amp; THRESHOLDS</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Permissions Manager & Sandbox Mode */}
      {activeTab === 'permissions' && (
        <div className="space-y-3">
          {/* Sandbox Toggle */}
          <div className="p-3.5 rounded-xl bg-black/80 border border-white/20 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white">Sandbox Preview Mode</div>
              <div className="text-[10px] text-neutral-400">
                Simulates real Android environment without crashing if system permissions are denied
              </div>
            </div>
            <button
              onClick={onToggleSandboxMode}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                isSandboxMode
                  ? 'bg-emerald-400 text-black'
                  : 'bg-neutral-800 text-neutral-300 border border-white/10'
              }`}
            >
              {isSandboxMode ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="text-xs text-neutral-400">ANDROID SYSTEM PERMISSION AUDIT:</div>

          <div className="space-y-2">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="p-3 rounded-xl border border-white/10 bg-neutral-950/80 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{perm.name}</span>
                    {perm.isCritical && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-sans mt-0.5">
                    {perm.rationale}
                  </div>
                  <div className="text-[9px] text-neutral-600 truncate mt-0.5">
                    {perm.androidPermission}
                  </div>
                </div>

                <button
                  onClick={() => onTogglePermission(perm.id)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    perm.granted
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                      : 'bg-white/10 text-neutral-400 hover:text-white border border-white/20'
                  }`}
                >
                  {perm.granted ? 'GRANTED' : 'REQUEST'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Google Play Store Listing & Data Safety */}
      {activeTab === 'store_copy' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">App Name & Package</span>
              <button
                onClick={() =>
                  handleCopyText(
                    'UnderGround Android Cleaner (com.underground.cleaner)',
                    'App Name'
                  )
                }
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="p-2 rounded bg-black border border-white/10 text-neutral-300">
              <strong>UnderGround Android Cleaner</strong>
              <div className="text-[10px] text-neutral-500">Package: com.underground.cleaner</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">
                Short Description (80 Chars Max)
              </span>
              <button
                onClick={() => handleCopyText(shortDescriptionPlayStore, 'Short Description')}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="p-2 rounded bg-black border border-white/10 text-neutral-300 text-[11px]">
              {shortDescriptionPlayStore}
            </div>
            <div className="text-[9px] text-neutral-500 text-right">
              {shortDescriptionPlayStore.length} / 80 characters
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase">Full Play Store Description</span>
              <button
                onClick={() => handleCopyText(fullDescriptionPlayStore, 'Full Description')}
                className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <Copy size={13} />
              </button>
            </div>
            <div className="p-2 rounded bg-black border border-white/10 text-neutral-300 text-[10px] whitespace-pre-line max-h-48 overflow-y-auto">
              {fullDescriptionPlayStore}
            </div>
          </div>

          {/* Data Safety & Ratings Section */}
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 space-y-2 text-xs">
            <div className="font-bold text-white uppercase">Play Console Data Safety Form</div>
            <div className="text-[11px] text-neutral-400 font-sans space-y-1">
              <div>• <strong>Data Collection:</strong> No personal data collected or shared.</div>
              <div>• <strong>Data Transfer:</strong> 100% on-device local storage. No third-party network egress.</div>
              <div>• <strong>Content Rating:</strong> Everyone (utility tools app, no UGC, no violence).</div>
              <div>• <strong>Target API:</strong> API 36 (Android 16 compatible).</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
