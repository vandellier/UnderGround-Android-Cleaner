import React, { useState, useMemo } from 'react';
import { ThemeConfig, StorageBucket, LargeFile, DuplicateGroup } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import {
  PieChart,
  HardDrive,
  Copy,
  FileText,
  Trash2,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StorageAnalyzerScreenProps {
  theme: ThemeConfig;
  buckets: StorageBucket[];
  largeFiles: LargeFile[];
  duplicates: DuplicateGroup[];
  onDeleteLargeFile: (fileId: string) => void;
  onDeleteDuplicates: (fileIds: string[]) => void;
}

export const StorageAnalyzerScreen: React.FC<StorageAnalyzerScreenProps> = ({
  theme,
  buckets,
  largeFiles,
  duplicates,
  onDeleteLargeFile,
  onDeleteDuplicates,
}) => {
  const [activeTab, setActiveTab] = useState<'treemap' | 'large_files' | 'duplicates'>('treemap');
  const [selectedBucket, setSelectedBucket] = useState<StorageBucket | null>(null);
  const [largeFileFilter, setLargeFileFilter] = useState<string>('all');
  const [selectedLargeFiles, setSelectedLargeFiles] = useState<string[]>([]);
  const [selectedDuplicateFiles, setSelectedDuplicateFiles] = useState<string[]>(() => {
    // Default to auto-selecting duplicate copies except primary
    const ids: string[] = [];
    duplicates.forEach((group) => {
      group.files.forEach((f) => {
        if (f.selected) ids.push(f.id);
      });
    });
    return ids;
  });

  const totalUsedBytes = useMemo(() => {
    return buckets.reduce((sum, b) => sum + b.sizeBytes, 0);
  }, [buckets]);

  const totalStorageCapacity = 128 * 1024 * 1024 * 1024; // 128 GB
  const usedPercentage = Math.round((totalUsedBytes / totalStorageCapacity) * 100);

  // Filter large files
  const filteredLargeFiles = useMemo(() => {
    if (largeFileFilter === 'all') return largeFiles;
    return largeFiles.filter((f) => f.type === largeFileFilter);
  }, [largeFiles, largeFileFilter]);

  // Handle duplicate selection
  const handleToggleDuplicate = (fileId: string) => {
    setSelectedDuplicateFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAllDuplicatesExceptNewest = () => {
    const ids: string[] = [];
    duplicates.forEach((group) => {
      // Keep primary, select rest
      group.files.forEach((f, idx) => {
        if (!f.isPrimary && idx > 0) {
          ids.push(f.id);
        }
      });
    });
    setSelectedDuplicateFiles(ids);
  };

  const totalDuplicateBytesToReclaim = useMemo(() => {
    let sum = 0;
    duplicates.forEach((g) => {
      g.files.forEach((f) => {
        if (selectedDuplicateFiles.includes(f.id)) {
          sum += g.fileSize;
        }
      });
    });
    return sum;
  }, [duplicates, selectedDuplicateFiles]);

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* Top Storage Bar Overview */}
      <div
        className="p-4 rounded-xl border backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(10, 14, 10, 0.85)',
          borderColor: `${theme.accent}30`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive size={16} style={{ color: theme.accent }} />
            <span className="text-xs uppercase tracking-wider font-semibold text-white">
              Storage Partition Allocation
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: theme.accent }}>
            {usedPercentage}% USED
          </span>
        </div>

        <div className="text-xl font-bold text-white mb-2">
          {formatBytes(totalUsedBytes)}{' '}
          <span className="text-xs text-neutral-400 font-normal">/ 128 GB INTERNAL UFS 4.0</span>
        </div>

        {/* Stacked Treemap Bar */}
        <div className="w-full h-3 rounded-md bg-neutral-900 overflow-hidden flex border border-white/10">
          {buckets.map((b) => (
            <div
              key={b.id}
              className="h-full hover:opacity-80 transition-opacity cursor-pointer relative group"
              style={{
                width: `${(b.sizeBytes / totalUsedBytes) * 100}%`,
                backgroundColor: b.color,
              }}
              title={`${b.label}: ${formatBytes(b.sizeBytes)}`}
              onClick={() => setSelectedBucket(b)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 text-[10px]">
          {buckets.slice(0, 4).map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBucket(b)}
              className="flex items-center gap-1.5 cursor-pointer truncate"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-neutral-300 truncate">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="flex rounded-lg p-1 bg-black/60 border border-white/10 text-xs">
        <button
          onClick={() => setActiveTab('treemap')}
          className={`flex-1 py-2 text-center rounded font-semibold transition-colors cursor-pointer ${
            activeTab === 'treemap' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
          style={{ color: activeTab === 'treemap' ? theme.accent : undefined }}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('large_files')}
          className={`flex-1 py-2 text-center rounded font-semibold transition-colors cursor-pointer ${
            activeTab === 'large_files' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
          style={{ color: activeTab === 'large_files' ? theme.accent : undefined }}
        >
          Large Files ({largeFiles.length})
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`flex-1 py-2 text-center rounded font-semibold transition-colors cursor-pointer ${
            activeTab === 'duplicates' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
          }`}
          style={{ color: activeTab === 'duplicates' ? theme.accent : undefined }}
        >
          Duplicates ({duplicates.length})
        </button>
      </div>

      {/* Tab 1: Categories Breakdown / Treemap Drill-down */}
      {activeTab === 'treemap' && (
        <div className="space-y-3">
          <div className="text-xs text-neutral-400 flex items-center justify-between">
            <span>STORAGE BUCKETS (TAP TO DRILL IN)</span>
            <span>TOTAL: {buckets.length} VOLUMES</span>
          </div>

          <div className="space-y-2">
            {buckets.map((bucket) => {
              const pctOfUsed = Math.round((bucket.sizeBytes / totalUsedBytes) * 100);
              return (
                <div
                  key={bucket.id}
                  onClick={() => setSelectedBucket(bucket)}
                  className="p-3 rounded-xl border border-white/10 hover:border-white/20 bg-neutral-950/70 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${bucket.color}25`, color: bucket.color }}
                    >
                      {pctOfUsed}%
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-green-400 transition-colors">
                        {bucket.label}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {bucket.fileCount.toLocaleString()} indexed files
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {formatBytes(bucket.sizeBytes)}
                      </div>
                      <div className="text-[9px] text-neutral-500">of internal disk</div>
                    </div>
                    <ChevronRight size={14} className="text-neutral-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Large Files Finder */}
      {activeTab === 'large_files' && (
        <div className="space-y-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'video', 'archive', 'apk', 'audio', 'other'].map((f) => (
              <button
                key={f}
                onClick={() => setLargeFileFilter(f)}
                className={`px-3 py-1.5 rounded-lg border text-[11px] capitalize cursor-pointer transition-colors ${
                  largeFileFilter === f
                    ? 'border-transparent text-black font-bold'
                    : 'border-white/10 text-neutral-400 hover:text-white bg-black/40'
                }`}
                style={{
                  backgroundColor: largeFileFilter === f ? theme.accent : undefined,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredLargeFiles.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-xl border border-white/10 bg-neutral-950/70 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="text-xs font-semibold text-white truncate">{file.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate mt-0.5">{file.path}</div>
                  <div className="text-[9px] text-neutral-500 mt-0.5">
                    Modified: {file.lastModified} · Type: {file.type.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white shrink-0">
                    {formatBytes(file.sizeBytes)}
                  </span>
                  <button
                    onClick={() => onDeleteLargeFile(file.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete Large File"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Duplicate File Finder (Chunked Hashing) */}
      {activeTab === 'duplicates' && (
        <div className="space-y-3">
          {/* Header Action Strip */}
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <div className="text-neutral-400 text-[10px]">CHUNKHASH ENGINE (SHA-256):</div>
              <div className="text-white font-bold text-xs">
                {selectedDuplicateFiles.length} Selected ({formatBytes(totalDuplicateBytesToReclaim)})
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSelectAllDuplicatesExceptNewest}
                className="px-2.5 py-1.5 rounded text-[11px] font-semibold border border-white/20 text-neutral-300 hover:text-white cursor-pointer"
              >
                Auto-Select
              </button>
              <button
                onClick={() => onDeleteDuplicates(selectedDuplicateFiles)}
                disabled={selectedDuplicateFiles.length === 0}
                className="px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000000',
                }}
              >
                Delete Selected
              </button>
            </div>
          </div>

          {/* Duplicates Groups List */}
          <div className="space-y-3">
            {duplicates.map((group) => (
              <div
                key={group.hash}
                className="rounded-xl border border-white/10 bg-neutral-950/80 overflow-hidden"
              >
                <div className="p-2.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-neutral-400 truncate max-w-[200px]">
                    <Copy size={12} style={{ color: theme.accent }} />
                    <span className="truncate">Hash: {group.hash.slice(0, 18)}...</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {formatBytes(group.fileSize)} each
                  </div>
                </div>

                <div className="p-2 space-y-1.5">
                  {group.files.map((f) => {
                    const isChecked = selectedDuplicateFiles.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => handleToggleDuplicate(f.id)}
                        className="p-2 rounded-lg bg-black/40 hover:bg-black/80 flex items-center justify-between cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded cursor-pointer"
                            style={{ accentColor: theme.accent }}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-xs font-medium truncate">
                                {f.name}
                              </span>
                              {f.isPrimary && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-bold">
                                  ORIGINAL
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] text-neutral-500 truncate">{f.path}</div>
                          </div>
                        </div>
                        <div className="text-[10px] text-neutral-400 shrink-0 ml-2">
                          {f.lastModified}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bucket Drill-down Modal */}
      {selectedBucket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: selectedBucket.color,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedBucket.color }}
                />
                <span className="text-sm font-bold text-white uppercase">
                  {selectedBucket.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedBucket(null)}
                className="text-xs px-2 py-1 rounded border border-white/20 text-neutral-300 hover:text-white"
              >
                CLOSE
              </button>
            </div>

            <div className="text-xs space-y-2 mb-4">
              <div className="flex justify-between text-neutral-300">
                <span>Total Partition Size:</span>
                <span className="font-bold text-white">{formatBytes(selectedBucket.sizeBytes)}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Total File Objects:</span>
                <span className="font-bold text-white">
                  {selectedBucket.fileCount.toLocaleString()} items
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Percentage of Disk:</span>
                <span className="font-bold text-white">{selectedBucket.percentage}%</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-[11px] text-neutral-400 mb-4 leading-relaxed font-sans">
              To inspect or clean specific files in this bucket, use the <strong>Large Files</strong>{' '}
              tab or deep-clean system junk via the <strong>Quick Clean</strong> terminal.
            </div>

            <button
              onClick={() => setSelectedBucket(null)}
              className="w-full py-2.5 rounded font-bold text-xs uppercase"
              style={{ backgroundColor: selectedBucket.color, color: '#000000' }}
            >
              DONE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
