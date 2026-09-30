import React, { useState } from 'react';
import { ThemeId, JunkCategory, StorageBucket, LargeFile, DuplicateGroup, InstalledApp, PhotoItem, CompressionLevel, PermissionStatus, SmartAdvisorConfig } from './types/cleaner';
import { THEMES } from './theme/themes';
import {
  INITIAL_JUNK_CATEGORIES,
  INITIAL_STORAGE_BUCKETS,
  INITIAL_LARGE_FILES,
  INITIAL_DUPLICATES,
  INITIAL_INSTALLED_APPS,
  INITIAL_PHOTOS,
  INITIAL_PERMISSIONS,
} from './services/mockData';
import { AndroidFrame, NavTabId } from './components/AndroidFrame';
import { QuickCleanScreen } from './components/clean/QuickCleanScreen';
import { StorageAnalyzerScreen } from './components/storage/StorageAnalyzerScreen';
import { AppManagerScreen } from './components/apps/AppManagerScreen';
import { PhotoOptimizerScreen } from './components/photos/PhotoOptimizerScreen';
import { PrivacyCleanScreen } from './components/privacy/PrivacyCleanScreen';
import { SystemMonitorScreen } from './components/monitor/SystemMonitorScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AndroidExportDrawer } from './components/android-export/AndroidExportDrawer';
import { InstallPhoneModal } from './components/InstallPhoneModal';
import { SmartAdvisorModal } from './components/advisor/SmartAdvisorModal';
import { SystemNotificationBanner } from './components/advisor/SystemNotificationBanner';
import { Image, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme state (Matrix is default)
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('matrix');
  const currentTheme = THEMES[currentThemeId];

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTabId>('clean');

  // Secondary sub-screen selector (Photo Optimizer & Privacy Clean)
  const [subView, setSubView] = useState<'none' | 'photos' | 'privacy'>('none');

  // Core Data States
  const [categories, setCategories] = useState<JunkCategory[]>(INITIAL_JUNK_CATEGORIES);
  const [storageBuckets, setStorageBuckets] = useState<StorageBucket[]>(INITIAL_STORAGE_BUCKETS);
  const [largeFiles, setLargeFiles] = useState<LargeFile[]>(INITIAL_LARGE_FILES);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>(INITIAL_DUPLICATES);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>(INITIAL_INSTALLED_APPS);
  const [photos, setPhotos] = useState<PhotoItem[]>(INITIAL_PHOTOS);
  const [permissions, setPermissions] = useState<PermissionStatus[]>(INITIAL_PERMISSIONS);

  // Smart Advisor configuration
  const [advisorConfig, setAdvisorConfig] = useState<SmartAdvisorConfig>({
    enabled: true,
    thresholdBytes: 1073741824, // 1 GB alert limit
    checkIntervalHours: 12,
    requiresCharging: false,
    requiresBatteryNotLow: true,
    alertNotificationSound: true,
    growthRateMBPerDay: 412,
    lastCalculatedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recommendedCleanTimestamp: Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
    reasons: [
      'YouTube & Spotify stream caches (+180 MB/d)',
      'TikTok/Instagram short video preloads (+150 MB/d)',
      'Temporary browser caches & logcat dumps (+82 MB/d)',
    ],
  });

  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<{
    title: string;
    message: string;
    projectedBytes?: number;
  } | null>(null);

  // Applet state
  const [lastCleanTimestamp, setLastCleanTimestamp] = useState<string | null>(null);
  const [totalReclaimedAllTime, setTotalReclaimedAllTime] = useState<number>(12840000000); // 12.84 GB baseline
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(true);
  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState<boolean>(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [systemToast, setSystemToast] = useState<string | null>(null);

  const showSystemToast = (msg: string) => {
    setSystemToast(msg);
    setTimeout(() => setSystemToast(null), 3500);
  };

  // Quick Clean completion handler
  const handlePurgeComplete = (reclaimedBytes: number, itemsCount: number) => {
    const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastCleanTimestamp(dateStr);
    setTotalReclaimedAllTime((prev) => prev + reclaimedBytes);

    // Update storage buckets (reduce other/junk)
    setStorageBuckets((prev) =>
      prev.map((b) => {
        if (b.id === 'other') {
          return { ...b, sizeBytes: Math.max(100000000, b.sizeBytes - reclaimedBytes) };
        }
        return b;
      })
    );

    showSystemToast(`Freed ${(reclaimedBytes / 1024 / 1024).toFixed(1)} MB from ${itemsCount} items.`);
  };

  // Delete Large File
  const handleDeleteLargeFile = (fileId: string) => {
    const target = largeFiles.find((f) => f.id === fileId);
    if (!target) return;
    setLargeFiles((prev) => prev.filter((f) => f.id !== fileId));
    setTotalReclaimedAllTime((prev) => prev + target.sizeBytes);
    showSystemToast(`Deleted ${target.name}.`);
  };

  // Delete Duplicates
  const handleDeleteDuplicates = (fileIds: string[]) => {
    let reclaimed = 0;
    const updated = duplicates.map((group) => {
      const remaining = group.files.filter((f) => {
        if (fileIds.includes(f.id)) {
          reclaimed += group.fileSize;
          return false;
        }
        return true;
      });
      return { ...group, files: remaining };
    }).filter((g) => g.files.length > 1);

    setDuplicates(updated);
    setTotalReclaimedAllTime((prev) => prev + reclaimed);
    showSystemToast(`Reclaimed ${(reclaimed / 1024 / 1024).toFixed(1)} MB from duplicate copies.`);
  };

  // Uninstall Apps
  const handleUninstallApps = (packageNames: string[]) => {
    const count = packageNames.length;
    setInstalledApps((prev) => prev.filter((a) => !packageNames.includes(a.packageName)));
    showSystemToast(`Dispatched uninstall intent for ${count} apps.`);
  };

  // Hibernate App
  const handleToggleHibernateApp = (packageName: string) => {
    setInstalledApps((prev) =>
      prev.map((a) => {
        if (a.packageName === packageName) {
          const nextState = !a.isHibernated;
          showSystemToast(
            nextState
              ? `Hibernated ${a.appName}. Background alarms restricted.`
              : `Awakened ${a.appName}.`
          );
          return { ...a, isHibernated: nextState };
        }
        return a;
      })
    );
  };

  // Batch Hibernate
  const handleBatchHibernate = (packageNames: string[]) => {
    setInstalledApps((prev) =>
      prev.map((a) => {
        if (packageNames.includes(a.packageName)) {
          return { ...a, isHibernated: true };
        }
        return a;
      })
    );
    showSystemToast(`Put ${packageNames.length} apps into Android Standby bucket.`);
  };

  // Photo Optimization
  const handleOptimizePhotos = (
    photoIds: string[],
    level: CompressionLevel,
    moveToBackupFolder: boolean
  ) => {
    const ratio = level === 'low' ? 0.15 : level === 'moderate' ? 0.35 : level === 'high' ? 0.55 : 0.72;
    let reclaimed = 0;

    setPhotos((prev) =>
      prev.map((p) => {
        if (photoIds.includes(p.id)) {
          const savings = Math.round(p.originalSizeBytes * ratio);
          reclaimed += savings;
          return {
            ...p,
            originalSizeBytes: p.originalSizeBytes - savings,
            selected: false,
          };
        }
        return p;
      })
    );

    setTotalReclaimedAllTime((prev) => prev + reclaimed);
    showSystemToast(
      `Optimized ${photoIds.length} photos. Saved ${(reclaimed / 1024 / 1024).toFixed(1)} MB${
        moveToBackupFolder ? ' (Originals archived to .underground_backup/)' : ''
      }.`
    );
  };

  // Delete Photos
  const handleDeletePhotos = (photoIds: string[]) => {
    let reclaimed = 0;
    photos.forEach((p) => {
      if (photoIds.includes(p.id)) reclaimed += p.originalSizeBytes;
    });
    setPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)));
    setTotalReclaimedAllTime((prev) => prev + reclaimed);
    showSystemToast(`Purged ${photoIds.length} photos.`);
  };

  // Privacy Actions
  const handleClearClipboard = () => {
    showSystemToast('System clipboard memory sanitized.');
  };

  const handlePurgeCallLogs = (days: number) => {
    showSystemToast(`Purged call history entries older than ${days} days.`);
  };

  const handlePurgeSms = (days: number) => {
    showSystemToast(`Cleaned OTP and verification SMS older than ${days} days.`);
  };

  const handlePurgeBrowserTraces = () => {
    showSystemToast('Cleared browser caches for Chrome, Firefox and DuckDuckGo.');
  };

  // Toggle permission
  const handleTogglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === permissionId) {
          const next = !p.granted;
          showSystemToast(`${p.name} permission ${next ? 'granted' : 'revoked'}.`);
          return { ...p, granted: next };
        }
        return p;
      })
    );
  };

  return (
    <div className="relative w-full">
      <AndroidFrame
        theme={currentTheme}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSubView('none'); // Return to main tabs
        }}
        isSandboxMode={isSandboxMode}
        onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
        onOpenPhoneInstallModal={() => setIsPhoneModalOpen(true)}
      >
        {/* Sub-view switcher bar (Media Optimizer & Privacy Clean shortcuts) */}
        <div className="px-4 pt-2.5 pb-1 flex items-center justify-between font-mono-tech text-[11px] border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubView('none')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                subView === 'none' ? 'text-white font-bold bg-white/10' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Main Tab
            </button>
            <button
              onClick={() => setSubView('photos')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                subView === 'photos'
                  ? 'text-white font-bold bg-white/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
              style={{ color: subView === 'photos' ? currentTheme.accent : undefined }}
            >
              <Image size={12} />
              Photo Optimizer
            </button>
            <button
              onClick={() => setSubView('privacy')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                subView === 'privacy'
                  ? 'text-white font-bold bg-white/10'
                  : 'text-neutral-400 hover:text-white'
              }`}
              style={{ color: subView === 'privacy' ? currentTheme.accent : undefined }}
            >
              <ShieldAlert size={12} />
              Privacy Clean
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAdvisorModalOpen(true)}
              className="text-[10px] text-green-400 hover:underline cursor-pointer flex items-center gap-1 font-bold"
            >
              <span>Advisor (+{advisorConfig.growthRateMBPerDay}MB/d)</span>
            </button>
            <span className="text-neutral-600">·</span>
            <button
              onClick={() => setIsCodeDrawerOpen(true)}
              className="text-[10px] text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Source Tree
            </button>
          </div>
        </div>

        {/* Global Toast */}
        {systemToast && (
          <div
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg font-mono-tech text-xs text-white border shadow-2xl flex items-center gap-2 animate-fadeIn"
            style={{
              backgroundColor: currentTheme.surfaceElevated,
              borderColor: currentTheme.accent,
            }}
          >
            <CheckCircle2 size={14} style={{ color: currentTheme.accent }} />
            <span>{systemToast}</span>
          </div>
        )}

        {/* Simulated System Heads-up Notification Banner */}
        {activeNotification && (
          <SystemNotificationBanner
            theme={currentTheme}
            title={activeNotification.title}
            message={activeNotification.message}
            projectedBytes={activeNotification.projectedBytes}
            onDismiss={() => setActiveNotification(null)}
            onAction={() => {
              setActiveNotification(null);
              setActiveTab('clean');
              setSubView('none');
            }}
          />
        )}

        {/* Content routing */}
        {subView === 'photos' ? (
          <PhotoOptimizerScreen
            theme={currentTheme}
            photos={photos}
            onOptimizePhotos={handleOptimizePhotos}
            onDeletePhotos={handleDeletePhotos}
          />
        ) : subView === 'privacy' ? (
          <PrivacyCleanScreen
            theme={currentTheme}
            onClearClipboard={handleClearClipboard}
            onPurgeCallLogs={handlePurgeCallLogs}
            onPurgeSms={handlePurgeSms}
            onPurgeBrowserTraces={handlePurgeBrowserTraces}
          />
        ) : activeTab === 'clean' ? (
          <QuickCleanScreen
            theme={currentTheme}
            categories={categories}
            onUpdateCategories={setCategories}
            onPurgeComplete={handlePurgeComplete}
            lastCleanTimestamp={lastCleanTimestamp}
            totalReclaimedAllTime={totalReclaimedAllTime}
            onOpenAdvisor={() => setIsAdvisorModalOpen(true)}
            growthRateMBPerDay={advisorConfig.growthRateMBPerDay}
          />
        ) : activeTab === 'storage' ? (
          <StorageAnalyzerScreen
            theme={currentTheme}
            buckets={storageBuckets}
            largeFiles={largeFiles}
            duplicates={duplicates}
            onDeleteLargeFile={handleDeleteLargeFile}
            onDeleteDuplicates={handleDeleteDuplicates}
          />
        ) : activeTab === 'apps' ? (
          <AppManagerScreen
            theme={currentTheme}
            apps={installedApps}
            onUninstallApps={handleUninstallApps}
            onToggleHibernateApp={handleToggleHibernateApp}
            onBatchHibernate={handleBatchHibernate}
          />
        ) : activeTab === 'monitor' ? (
          <SystemMonitorScreen theme={currentTheme} />
        ) : (
          <SettingsScreen
            currentTheme={currentTheme}
            onSelectTheme={setCurrentThemeId}
            permissions={permissions}
            onTogglePermission={handleTogglePermission}
            isSandboxMode={isSandboxMode}
            onToggleSandboxMode={() => {
              setIsSandboxMode(!isSandboxMode);
              showSystemToast(
                !isSandboxMode ? 'Sandbox Preview Mode Enabled' : 'Sandbox Preview Mode Disabled'
              );
            }}
            onOpenCodeDrawer={() => setIsCodeDrawerOpen(true)}
            onOpenSmartAdvisor={() => setIsAdvisorModalOpen(true)}
          />
        )}
      </AndroidFrame>

      {/* Android Studio Export Hub */}
      <AndroidExportDrawer
        theme={currentTheme}
        isOpen={isCodeDrawerOpen}
        onClose={() => setIsCodeDrawerOpen(false)}
      />

      {/* Smart Advisor WorkManager Modal */}
      <SmartAdvisorModal
        theme={currentTheme}
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        advisorConfig={advisorConfig}
        onUpdateConfig={setAdvisorConfig}
        onTriggerSimulatedNotification={(title, message, projectedBytes) => {
          setActiveNotification({ title, message, projectedBytes });
          showSystemToast('WorkManager: Background evaluation triggered alert.');
        }}
        onNavigateToClean={() => {
          setIsAdvisorModalOpen(false);
          setActiveTab('clean');
          setSubView('none');
        }}
      />

      {/* Phone Install & QR Code Modal */}
      <InstallPhoneModal
        theme={currentTheme}
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onOpenSourceTree={() => {
          setIsPhoneModalOpen(false);
          setIsCodeDrawerOpen(true);
        }}
      />
    </div>
  );
}
