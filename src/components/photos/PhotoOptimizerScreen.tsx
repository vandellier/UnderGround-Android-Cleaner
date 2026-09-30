import React, { useState, useMemo } from 'react';
import { ThemeConfig, PhotoItem, CompressionLevel } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import {
  Image,
  Sliders,
  Sparkles,
  Layers,
  AlertTriangle,
  FolderArchive,
  Trash2,
  Eye,
  CheckCircle2,
  ShieldCheck,
  CheckSquare,
  Square,
  ChevronRight,
} from 'lucide-react';

interface PhotoOptimizerScreenProps {
  theme: ThemeConfig;
  photos: PhotoItem[];
  onOptimizePhotos: (
    photoIds: string[],
    level: CompressionLevel,
    moveToBackupFolder: boolean
  ) => void;
  onDeletePhotos: (photoIds: string[]) => void;
}

export const PhotoOptimizerScreen: React.FC<PhotoOptimizerScreenProps> = ({
  theme,
  photos,
  onOptimizePhotos,
  onDeletePhotos,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'similar' | 'blurry' | 'dark' | 'bright' | 'old_screenshot'
  >('similar');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(() =>
    photos.filter((p) => p.selected).map((p) => p.id)
  );
  const [compressionPreset, setCompressionPreset] = useState<CompressionLevel>('moderate');
  const [moveToBackupFolder, setMoveToBackupFolder] = useState<boolean>(true);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);

  // Filtered photos by category
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => p.category === activeCategory);
  }, [photos, activeCategory]);

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllCategory = () => {
    const currentCategoryIds = filteredPhotos.map((p) => p.id);
    const allSelected = currentCategoryIds.every((id) => selectedPhotoIds.includes(id));
    if (allSelected) {
      setSelectedPhotoIds((prev) => prev.filter((id) => !currentCategoryIds.includes(id)));
    } else {
      setSelectedPhotoIds((prev) => Array.from(new Set([...prev, ...currentCategoryIds])));
    }
  };

  // Compression savings multipliers
  const compressionRatio = useMemo(() => {
    switch (compressionPreset) {
      case 'low':
        return 0.15; // 15% reduction
      case 'moderate':
        return 0.35; // 35% reduction
      case 'high':
        return 0.55; // 55% reduction
      case 'aggressive':
        return 0.72; // 72% reduction
    }
  }, [compressionPreset]);

  const totalSelectedOriginalBytes = useMemo(() => {
    return photos
      .filter((p) => selectedPhotoIds.includes(p.id))
      .reduce((sum, p) => sum + p.originalSizeBytes, 0);
  }, [photos, selectedPhotoIds]);

  const projectedSavingsBytes = Math.round(totalSelectedOriginalBytes * compressionRatio);

  const handleExecuteOptimization = () => {
    onOptimizePhotos(selectedPhotoIds, compressionPreset, moveToBackupFolder);
    setSelectedPhotoIds([]);
  };

  const handleExecuteDelete = () => {
    onDeletePhotos(selectedPhotoIds);
    setSelectedPhotoIds([]);
  };

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* WhatsApp Isolation Protection Notice */}
      <div className="p-3 rounded-xl bg-neutral-950/80 border border-white/10 flex items-start gap-2.5 text-xs">
        <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-neutral-300 font-sans text-[11px] leading-relaxed">
          <strong className="text-white font-mono-tech">PRIVACY GUARD ACTIVE:</strong> WhatsApp,
          Signal & private chat media folders are strictly excluded by default to avoid deleting
          personal memories without folder-level SAF grant.
        </div>
      </div>

      {/* Category Tabs */}
      <div className="space-y-1.5">
        <div className="text-[11px] text-neutral-400 flex justify-between px-1">
          <span>ON-DEVICE MEDIA AUDITOR</span>
          <span>{photos.length} DETECTED</span>
        </div>

        <div className="flex rounded-lg p-1 bg-black/60 border border-white/10 text-xs overflow-x-auto">
          {[
            { id: 'similar', label: 'Similar Burst' },
            { id: 'blurry', label: 'Blurry / Motion' },
            { id: 'dark', label: 'Underexposed' },
            { id: 'old_screenshot', label: 'Old Screens' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex-1 py-1.5 px-2.5 text-center rounded whitespace-nowrap font-medium transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              style={{ color: activeCategory === cat.id ? theme.accent : undefined }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compression Configuration Card */}
      <div
        className="p-3.5 rounded-xl border backdrop-blur-md space-y-3"
        style={{
          backgroundColor: 'rgba(10, 14, 10, 0.85)',
          borderColor: `${theme.accent}30`,
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sliders size={14} style={{ color: theme.accent }} />
            <span className="font-bold text-white uppercase">Compression Engine</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono-tech">
            Est. Savings: {formatBytes(projectedSavingsBytes)}
          </span>
        </div>

        {/* Preset Selector */}
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {(['low', 'moderate', 'high', 'aggressive'] as CompressionLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setCompressionPreset(level)}
              className={`py-1.5 px-2 rounded-lg border text-center uppercase text-[10px] font-bold cursor-pointer transition-colors ${
                compressionPreset === level
                  ? 'border-transparent text-black'
                  : 'border-white/10 text-neutral-400 hover:text-white bg-black/40'
              }`}
              style={{
                backgroundColor: compressionPreset === level ? theme.accent : undefined,
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Backup Original Toggle */}
        <label className="flex items-center gap-2.5 text-xs text-neutral-300 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={moveToBackupFolder}
            onChange={(e) => setMoveToBackupFolder(e.target.checked)}
            className="rounded cursor-pointer"
            style={{ accentColor: theme.accent }}
          />
          <span className="text-[11px]">
            Keep originals safely in <code className="text-white">.underground_backup/</code>
          </span>
        </label>
      </div>

      {/* Action Bar (when photos selected) */}
      {selectedPhotoIds.length > 0 && (
        <div
          className="p-3 rounded-xl border flex items-center justify-between animate-fadeIn text-xs shadow-xl"
          style={{
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.accent,
          }}
        >
          <div>
            <div className="font-bold text-white">
              {selectedPhotoIds.length} photos selected
            </div>
            <div className="text-[10px] text-neutral-400">
              Original: {formatBytes(totalSelectedOriginalBytes)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExecuteDelete}
              className="px-2.5 py-1.5 rounded text-[11px] font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={12} />
              Purge
            </button>
            <button
              onClick={handleExecuteOptimization}
              className="px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: theme.accent,
                color: '#000000',
              }}
            >
              <Sparkles size={13} />
              Optimize (-{formatBytes(projectedSavingsBytes)})
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      <div className="flex items-center justify-between text-xs px-1 text-neutral-400">
        <button
          onClick={handleSelectAllCategory}
          className="flex items-center gap-2 hover:text-white cursor-pointer"
        >
          {filteredPhotos.every((p) => selectedPhotoIds.includes(p.id)) &&
          filteredPhotos.length > 0 ? (
            <CheckSquare size={16} style={{ color: theme.accent }} />
          ) : (
            <Square size={16} />
          )}
          <span>Select all in category ({filteredPhotos.length})</span>
        </button>
      </div>

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPhotos.map((photo) => {
          const isSelected = selectedPhotoIds.includes(photo.id);
          return (
            <div
              key={photo.id}
              className="rounded-xl border border-white/10 bg-neutral-950/80 overflow-hidden text-xs transition-all hover:border-white/20"
              style={{
                borderColor: isSelected ? `${theme.accent}60` : undefined,
              }}
            >
              {/* Photo Preview Container */}
              <div className="relative h-40 bg-neutral-900 overflow-hidden group">
                <img
                  src={photo.previewUrl}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />

                {/* Top overlay pills */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-white border border-white/10">
                    {formatBytes(photo.originalSizeBytes)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewPhoto(photo);
                    }}
                    className="pointer-events-auto p-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs border border-white/10 transition-colors cursor-pointer"
                    title="Compare before and after"
                  >
                    <Eye size={13} />
                  </button>
                </div>

                {/* Bottom caption */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                  <div className="text-[10px] text-white font-medium truncate">{photo.name}</div>
                  <div className="text-[9px] text-neutral-400">{photo.issueDescription}</div>
                </div>
              </div>

              {/* Bottom selection footer */}
              <div
                onClick={() => toggleSelectPhoto(photo.id)}
                className="p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <CheckSquare size={16} style={{ color: theme.accent }} />
                  ) : (
                    <Square size={16} className="text-neutral-500" />
                  )}
                  <span className="text-[11px] text-neutral-300">
                    {isSelected ? 'Ready for action' : 'Keep original'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">{photo.dateTaken}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before / After Comparison Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-lg rounded-xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl"
            style={{
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.accent,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-xs font-bold text-white uppercase">
                Interactive Before / After Inspector
              </span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1 rounded border border-white/10"
              >
                CLOSE
              </button>
            </div>

            {/* Split Comparison Viewer */}
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-neutral-900 border border-white/10 mb-4 select-none">
              {/* After image (compressed preview) */}
              <img
                src={previewPhoto.previewUrl}
                alt="Compressed"
                className="absolute inset-0 w-full h-full object-cover filter contrast-105"
              />
              <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/80 text-green-400 border border-white/10 font-bold">
                COMPRESSED ({formatBytes(previewPhoto.originalSizeBytes * (1 - compressionRatio))})
              </div>

              {/* Before image with clip-path according to slider position */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${comparisonSliderPos}%` }}
              >
                <img
                  src={previewPhoto.previewUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
                <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/80 text-white border border-white/10 font-bold">
                  ORIGINAL ({formatBytes(previewPhoto.originalSizeBytes)})
                </div>
              </div>

              {/* Slider divider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-lg"
                style={{ left: `${comparisonSliderPos}%` }}
              >
                <div
                  className="w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center -ml-[11px] top-1/2 -mt-3 absolute shadow-md"
                  style={{ color: '#000000' }}
                >
                  ↔
                </div>
              </div>
            </div>

            {/* Slider Control */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Drag to compare image fidelity:</span>
                <span>{comparisonSliderPos}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={comparisonSliderPos}
                onChange={(e) => setComparisonSliderPos(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: theme.accent }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="flex-1 py-2 rounded border border-white/20 text-neutral-300 text-xs font-semibold hover:bg-white/10"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  toggleSelectPhoto(previewPhoto.id);
                  setPreviewPhoto(null);
                }}
                className="flex-1 py-2 rounded font-bold text-xs"
                style={{ backgroundColor: theme.accent, color: '#000000' }}
              >
                SELECT FOR COMPRESSION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
