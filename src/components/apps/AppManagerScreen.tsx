import React, { useState, useMemo } from 'react';
import { ThemeConfig, InstalledApp } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import {
  Smartphone,
  BatteryCharging,
  Wifi,
  Trash2,
  Moon,
  Clock,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckSquare,
  Square,
  ZapOff,
  Filter,
} from 'lucide-react';

interface AppManagerScreenProps {
  theme: ThemeConfig;
  apps: InstalledApp[];
  onUninstallApps: (packageNames: string[]) => void;
  onToggleHibernateApp: (packageName: string) => void;
  onBatchHibernate: (packageNames: string[]) => void;
}

export const AppManagerScreen: React.FC<AppManagerScreenProps> = ({
  theme,
  apps,
  onUninstallApps,
  onToggleHibernateApp,
  onBatchHibernate,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unused_30' | 'unused_60' | 'unused_90' | 'battery_heavy'>('all');
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [showUninstallModal, setShowUninstallModal] = useState(false);
  const [showHibernationExplainer, setShowHibernationExplainer] = useState(false);
  const [storageSettingsApp, setStorageSettingsApp] = useState<InstalledApp | null>(null);

  // Filter apps based on selection
  const filteredApps = useMemo(() => {
    switch (filterMode) {
      case 'unused_30':
        return apps.filter((a) => a.lastUsedDaysAgo >= 30);
      case 'unused_60':
        return apps.filter((a) => a.lastUsedDaysAgo >= 60);
      case 'unused_90':
        return apps.filter((a) => a.lastUsedDaysAgo >= 90);
      case 'battery_heavy':
        return apps.filter((a) => a.batteryDrainImpact === 'High');
      default:
        return apps;
    }
  }, [apps, filterMode]);

  const toggleSelectApp = (packageName: string) => {
    setSelectedPackages((prev) =>
      prev.includes(packageName) ? prev.filter((p) => p !== packageName) : [...prev, packageName]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedPackages.length === filteredApps.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(filteredApps.map((a) => a.packageName));
    }
  };

  const totalSelectedSize = useMemo(() => {
    return apps
      .filter((a) => selectedPackages.includes(a.packageName))
      .reduce((sum, a) => sum + (a.appSizeBytes + a.dataSizeBytes + a.cacheSizeBytes), 0);
  }, [apps, selectedPackages]);

  const handleConfirmBatchUninstall = () => {
    onUninstallApps(selectedPackages);
    setSelectedPackages([]);
    setShowUninstallModal(false);
  };

  const handleBatchHibernateSelected = () => {
    onBatchHibernate(selectedPackages);
    setSelectedPackages([]);
  };

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* Top Banner with Honest Hibernation Disclosure */}
      <div
        className="p-3.5 rounded-xl border backdrop-blur-md flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(10, 14, 10, 0.85)',
          borderColor: `${theme.accent}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${theme.accent}15`, color: theme.accent }}
          >
            <Smartphone size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {apps.length} INSTALLED PACKAGES
            </div>
            <div className="text-[10px] text-neutral-400">
              {apps.filter((a) => a.isHibernated).length} Apps currently hibernated
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowHibernationExplainer(true)}
          className="text-xs px-2.5 py-1.5 rounded border border-white/20 hover:bg-white/10 flex items-center gap-1.5 text-neutral-300 cursor-pointer"
        >
          <Info size={13} style={{ color: theme.accent }} />
          <span>Hibernation Info</span>
        </button>
      </div>

      {/* Filter Tabs for Unused Apps */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-neutral-400 flex justify-between items-center px-1">
          <span>APP FILTERS & UNUSED DETECTOR</span>
          <span>{filteredApps.length} FOUND</span>
        </div>

        <div className="flex rounded-lg p-1 bg-black/60 border border-white/10 text-xs overflow-x-auto">
          {[
            { id: 'all', label: 'All Apps' },
            { id: 'unused_30', label: 'Unused >30d' },
            { id: 'unused_60', label: 'Unused >60d' },
            { id: 'unused_90', label: 'Unused >90d' },
            { id: 'battery_heavy', label: 'High Battery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id as any);
                setSelectedPackages([]);
              }}
              className={`flex-1 py-1.5 px-2.5 text-center rounded whitespace-nowrap font-medium transition-colors cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              style={{ color: filterMode === tab.id ? theme.accent : undefined }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Action Bar (when apps selected) */}
      {selectedPackages.length > 0 && (
        <div
          className="p-3 rounded-xl border flex items-center justify-between animate-fadeIn text-xs shadow-xl"
          style={{
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.accent,
          }}
        >
          <div>
            <div className="font-bold text-white">
              {selectedPackages.length} selected ({formatBytes(totalSelectedSize)})
            </div>
            <div className="text-[10px] text-neutral-400">Multi-select staging active</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleBatchHibernateSelected}
              className="px-2.5 py-1.5 rounded text-[11px] font-semibold border border-white/20 hover:bg-white/10 flex items-center gap-1.5 text-neutral-300 cursor-pointer"
            >
              <Moon size={12} style={{ color: theme.accent }} />
              Hibernate
            </button>
            <button
              onClick={() => setShowUninstallModal(true)}
              className="px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: '#000000',
              }}
            >
              <Trash2 size={13} />
              Uninstall
            </button>
          </div>
        </div>
      )}

      {/* Select All Checkbox */}
      <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
        <button
          onClick={handleSelectAllFiltered}
          className="flex items-center gap-2 hover:text-white cursor-pointer"
        >
          {selectedPackages.length === filteredApps.length && filteredApps.length > 0 ? (
            <CheckSquare size={16} style={{ color: theme.accent }} />
          ) : (
            <Square size={16} />
          )}
          <span>Select all in view ({filteredApps.length})</span>
        </button>

        <span className="text-[10px]">Sort: Size & Activity</span>
      </div>

      {/* Apps List */}
      <div className="space-y-2">
        {filteredApps.map((app) => {
          const isSelected = selectedPackages.includes(app.packageName);
          const totalAppSize = app.appSizeBytes + app.dataSizeBytes + app.cacheSizeBytes;

          return (
            <div
              key={app.packageName}
              className="p-3 rounded-xl border border-white/10 bg-neutral-950/75 hover:border-white/20 transition-all text-xs"
              style={{
                borderColor: isSelected ? `${theme.accent}60` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                {/* Left check & app icon */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleSelectApp(app.packageName)}
                    className="mt-1 text-neutral-400 hover:text-white cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={16} style={{ color: theme.accent }} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: app.iconBg, color: '#ffffff' }}
                  >
                    {app.iconInitial}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white truncate text-xs">
                        {app.appName}
                      </span>
                      {app.isHibernated && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium">
                          HIBERNATED
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {app.packageName} · v{app.versionName}
                    </div>

                    {/* Stats pill strip */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {app.lastUsedDaysAgo === 0
                          ? 'Used today'
                          : `${app.lastUsedDaysAgo}d unused`}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wifi size={10} />
                        {app.dataUsedMonthlyMB} MB/mo
                      </span>
                      <span>·</span>
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{
                          color:
                            app.batteryDrainImpact === 'High'
                              ? '#ef4444'
                              : app.batteryDrainImpact === 'Moderate'
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      >
                        <BatteryCharging size={10} />
                        {app.batteryDrainImpact} Drain
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right size & actions */}
                <div className="text-right shrink-0">
                  <div className="font-bold text-white text-xs">{formatBytes(totalAppSize)}</div>
                  <div className="text-[9px] text-neutral-500">
                    Cache: {formatBytes(app.cacheSizeBytes)}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 mt-2">
                    <button
                      onClick={() => setStorageSettingsApp(app)}
                      className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Open System App Storage Settings"
                    >
                      <ExternalLink size={13} />
                    </button>
                    <button
                      onClick={() => onToggleHibernateApp(app.packageName)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        app.isHibernated
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'hover:bg-white/10 text-neutral-400 hover:text-white'
                      }`}
                      title={app.isHibernated ? 'Wake App' : 'Hibernate Background Activity'}
                    >
                      <Moon size={13} style={{ color: app.isHibernated ? theme.accent : undefined }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest Hibernation Explainer Modal */}
      {showHibernationExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.accent,
            }}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-4">
              <ZapOff size={18} style={{ color: theme.accent }} />
              <span className="text-xs uppercase font-bold tracking-wider text-white">
                Honest Architectural Disclosure: App Hibernation
              </span>
            </div>

            <div className="text-xs space-y-3 font-sans text-neutral-300 leading-relaxed mb-4">
              <p>
                <strong>What UnderGround actually does:</strong> We use Android&apos;s native
                <code className="text-[11px] font-mono-tech mx-1 px-1 bg-black rounded">
                  PACKAGE_USAGE_STATS
                </code>
                and system deep-links to invoke Android&apos;s OS-level App Standby bucket
                (RARE/RESTRICTED).
              </p>
              <div className="p-3 rounded bg-black/70 border border-white/10 text-[11px] text-neutral-400 space-y-1.5 font-mono-tech">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={13} /> NO MAGIC RAM MYTHS
                </div>
                <div>
                  Force-killing apps does <strong>NOT</strong> speed up Android. The Linux kernel will
                  simply reload background daemon processes, causing extra CPU spikes and battery
                  consumption.
                </div>
                <div>
                  Hibernation instead restricts background alarms, wake-locks, and push-sync job
                  dispatchers, saving battery honestly.
                </div>
              </div>
              <p className="text-[11px] text-neutral-400">
                Optional Accessibility mode can automate clicking &quot;Force Stop&quot; sequentially across
                chosen apps, but is disabled by default for user safety and Google Play policy.
              </p>
            </div>

            <button
              onClick={() => setShowHibernationExplainer(false)}
              className="w-full py-2.5 rounded font-bold text-xs"
              style={{ backgroundColor: theme.accent, color: '#000000' }}
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

      {/* Batch Uninstall Confirmation */}
      {showUninstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-sm rounded-xl p-5 border relative font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: '#ef4444',
            }}
          >
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <Trash2 size={18} />
              <span className="text-xs uppercase font-bold tracking-wider text-white">
                Dispatch System Uninstall Intents
              </span>
            </div>

            <p className="text-xs text-neutral-300 font-sans leading-relaxed mb-4">
              Android security models require explicit user approval per package. UnderGround will
              queue system uninstallation dialogs for {selectedPackages.length} selected apps,
              reclaiming approximately {formatBytes(totalSelectedSize)}.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUninstallModal(false)}
                className="flex-1 py-2 rounded border border-white/20 text-neutral-300 text-xs font-semibold hover:bg-white/10"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmBatchUninstall}
                className="flex-1 py-2 rounded bg-red-600 hover:bg-red-500 font-bold text-xs text-white"
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-App Storage Settings Shortcut Modal */}
      {storageSettingsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-sm rounded-xl p-5 border relative font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.accent,
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-white uppercase">
                {storageSettingsApp.appName} Storage
              </span>
              <button
                onClick={() => setStorageSettingsApp(null)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-neutral-400">
                <span>App Code Size:</span>
                <span className="text-white font-bold">{formatBytes(storageSettingsApp.appSizeBytes)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>User Data (Protected):</span>
                <span className="text-white font-bold">{formatBytes(storageSettingsApp.dataSizeBytes)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Temporary Cache:</span>
                <span className="text-green-400 font-bold">{formatBytes(storageSettingsApp.cacheSizeBytes)}</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-black/60 border border-white/10 text-[10px] text-neutral-400 mb-4">
              Direct intent mapped to:
              <br />
              <code className="text-white">
                android.settings.APPLICATION_DETAILS_SETTINGS?package={storageSettingsApp.packageName}
              </code>
            </div>

            <button
              onClick={() => {
                alert(`Simulated launch of Android Settings -> Storage for ${storageSettingsApp.appName}`);
                setStorageSettingsApp(null);
              }}
              className="w-full py-2.5 rounded font-bold text-xs uppercase"
              style={{ backgroundColor: theme.accent, color: '#000000' }}
            >
              LAUNCH SYSTEM APP STORAGE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
