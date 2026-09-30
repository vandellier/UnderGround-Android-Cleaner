import React, { useEffect } from 'react';
import { ThemeConfig } from '../../types/cleaner';
import { Trash2, X, Bell, ChevronRight, Zap } from 'lucide-react';

interface SystemNotificationBannerProps {
  theme: ThemeConfig;
  title: string;
  message: string;
  projectedBytes?: number;
  onDismiss: () => void;
  onAction: () => void;
}

export const SystemNotificationBanner: React.FC<SystemNotificationBannerProps> = ({
  theme,
  title,
  message,
  projectedBytes,
  onDismiss,
  onAction,
}) => {
  useEffect(() => {
    // Auto-dismiss after 12 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="absolute top-2 inset-x-2 z-50 animate-slide-down">
      <div
        className="rounded-2xl p-3.5 border shadow-2xl backdrop-blur-xl font-mono-tech flex flex-col gap-2 relative overflow-hidden"
        style={{
          backgroundColor: 'rgba(12, 16, 12, 0.95)',
          borderColor: theme.accent,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${theme.accentGlow}`,
        }}
      >
        {/* App metadata header */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px]"
              style={{ backgroundColor: theme.accent, color: '#000000' }}
            >
              U
            </div>
            <span className="font-semibold text-white">UnderGround Cleaner</span>
            <span className="text-[10px] text-neutral-500">· now</span>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Notification body */}
        <div className="pl-7 pr-2">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
            <span>{title}</span>
          </div>
          <div className="text-[11px] text-neutral-300 font-sans leading-snug mt-1">
            {message}
          </div>
        </div>

        {/* Action buttons */}
        <div className="pl-7 flex items-center gap-2 mt-1">
          <button
            onClick={onAction}
            className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            style={{
              backgroundColor: theme.accent,
              color: '#000000',
            }}
          >
            <Zap size={12} />
            <span>REVIEW &amp; PURGE</span>
          </button>

          <button
            onClick={onDismiss}
            className="px-2.5 py-1.5 rounded-lg border border-white/20 text-neutral-300 hover:text-white text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
