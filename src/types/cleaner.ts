export type ThemeId = 'matrix' | 'pink' | 'red' | 'orange';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  accent: string;
  accentGlow: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  textMuted: string;
  textPrimary: string;
  terminalPrompt: string;
}

export interface JunkCategory {
  id: string;
  title: string;
  category: 'cache' | 'residual' | 'empty_folders' | 'temp_logs' | 'downloads' | 'clipboard' | 'browser';
  sizeBytes: number;
  fileCount: number;
  description: string;
  selected: boolean;
  isSensitive?: boolean;
  requiresAndroid16Overlay?: boolean;
  items: JunkItem[];
}

export interface JunkItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  packageName?: string;
  appIcon?: string;
  lastModified?: string;
  selected: boolean;
  details?: string;
}

export interface StorageBucket {
  id: string;
  label: string;
  sizeBytes: number;
  color: string;
  iconName: string;
  fileCount: number;
  percentage: number;
}

export interface LargeFile {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  type: 'video' | 'apk' | 'archive' | 'audio' | 'document' | 'other';
  lastModified: string;
}

export interface DuplicateGroup {
  hash: string;
  fileSize: number;
  files: {
    id: string;
    name: string;
    path: string;
    thumbnail?: string;
    lastModified: string;
    selected: boolean;
    isPrimary?: boolean;
  }[];
}

export interface InstalledApp {
  packageName: string;
  appName: string;
  versionName: string;
  appSizeBytes: number;
  cacheSizeBytes: number;
  dataSizeBytes: number;
  lastUsedDaysAgo: number;
  dataUsedMonthlyMB: number;
  batteryDrainImpact: 'Low' | 'Moderate' | 'High';
  isHibernated: boolean;
  isSystemApp: boolean;
  iconBg: string;
  iconInitial: string;
  selected?: boolean;
}

export interface PhotoItem {
  id: string;
  name: string;
  category: 'similar' | 'blurry' | 'dark' | 'bright' | 'old_screenshot';
  originalSizeBytes: number;
  width: number;
  height: number;
  dateTaken: string;
  isWhatsAppOrChat: boolean;
  previewUrl: string;
  compressedPreviewUrl?: string;
  selected: boolean;
  similarityGroupId?: string;
  issueDescription: string;
}

export type CompressionLevel = 'low' | 'moderate' | 'high' | 'aggressive';

export interface SystemMetrics {
  cpuUsagePercent: number;
  cpuTempCelsius: number;
  coresActive: number[];
  ramTotalMB: number;
  ramUsedMB: number;
  storageTotalGB: number;
  storageUsedGB: number;
  batteryPercent: number;
  batteryTempCelsius: number;
  batteryHealth: 'Good' | 'Fair' | 'Overheat';
  isCharging: boolean;
  history: {
    timestamp: number;
    cpu: number;
    ram: number;
  }[];
}

export interface ScanResultSummary {
  reclaimedBytes: number;
  itemsRemoved: number;
  timestamp: string;
  categoriesCleaned: string[];
}

export interface PermissionStatus {
  id: string;
  name: string;
  androidPermission: string;
  rationale: string;
  granted: boolean;
  isCritical: boolean;
  category: 'storage' | 'usage' | 'notifications' | 'privacy' | 'accessibility';
}

export interface SmartAdvisorConfig {
  enabled: boolean;
  thresholdBytes: number; // e.g. 1073741824 (1 GB)
  checkIntervalHours: number; // e.g. 6, 12, 24
  requiresCharging: boolean;
  requiresBatteryNotLow: boolean;
  alertNotificationSound: boolean;
  growthRateMBPerDay: number;
  lastCalculatedTimestamp: string;
  recommendedCleanTimestamp: number; // target epoch ms
  reasons: string[];
}

export interface GrowthDataPoint {
  dayLabel: string;
  junkAccumulatedMB: number;
  streamingCacheMB: number;
  socialCacheMB: number;
  tempLogsMB: number;
}
