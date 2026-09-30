import React, { useState } from 'react';
import { ThemeConfig } from '../types/cleaner';
import {
  X,
  Smartphone,
  QrCode,
  Copy,
  CheckCircle2,
  ExternalLink,
  Download,
  Terminal,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface InstallPhoneModalProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onOpenSourceTree: () => void;
}

export const InstallPhoneModal: React.FC<InstallPhoneModalProps> = ({
  theme,
  isOpen,
  onClose,
  onOpenSourceTree,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-...';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Generate QR code URL via standard reliable QR service
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    currentUrl
  )}&bgcolor=000000&color=${theme.accent.replace('#', '')}&qzone=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-2xl p-5 border relative overflow-hidden font-mono-tech shadow-2xl flex flex-col max-h-[92vh]"
        style={{
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.accent,
          boxShadow: `0 0 35px ${theme.accentGlow}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Smartphone size={20} style={{ color: theme.accent }} />
            <div>
              <span className="text-sm font-bold text-white uppercase">
                Run On Your Android Phone
              </span>
              <span className="text-[10px] text-neutral-400 block font-normal">
                Direct phone access & native APK
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {/* Method 1: Instant Phone Access via QR Code / URL */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <QrCode size={14} style={{ color: theme.accent }} />
                <span>1. Instant Phone Launch (Scan QR)</span>
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase"
                style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
              >
                Zero Install
              </span>
            </div>

            <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
              Scan this with your Android phone&apos;s camera to open and use UnderGround immediately:
            </p>

            {/* QR Code Display */}
            <div className="flex justify-center p-3 bg-black rounded-lg border border-white/10">
              <img
                src={qrApiUrl}
                alt="Scan to open on phone"
                className="w-36 h-36 rounded-md shadow-md"
                loading="lazy"
              />
            </div>

            {/* Copy Link button */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 p-2 rounded bg-neutral-900 border border-white/10 truncate text-[10px] text-neutral-400">
                {currentUrl}
              </div>
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 rounded font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                style={{
                  backgroundColor: theme.accent,
                  color: '#000000',
                }}
              >
                {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="p-2 rounded bg-white/[0.03] text-[10px] text-neutral-400 font-sans">
              💡 <strong>On your phone:</strong> In Chrome or Samsung Internet, tap{' '}
              <strong className="text-white">⋮ &gt; &quot;Add to Home screen&quot;</strong> or{' '}
              <strong className="text-white">&quot;Install App&quot;</strong> to install it with the native UnderGround icon!
            </div>
          </div>

          {/* Method 2: Native Android APK / AAB Build */}
          <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Terminal size={14} style={{ color: theme.accent }} />
                <span>2. Native Android Project (Kotlin / Gradle)</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-neutral-800 text-neutral-300">
                API 36 / Android 16
              </span>
            </div>

            <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
              The complete native Android Studio codebase with Kotlin, Jetpack Compose, Room, and
              Hilt is located in <code className="text-white font-mono-tech">/android</code>.
            </p>

            <div className="p-2.5 rounded bg-black border border-white/10 text-[10px] text-neutral-300 font-mono space-y-1">
              <div className="text-neutral-500"># Build Debug APK for sideloading on phone:</div>
              <div className="text-green-400">./gradlew assembleDebug</div>
              <div className="text-neutral-500 pt-1"># Output APK path:</div>
              <div className="text-white">app/build/outputs/apk/debug/app-debug.apk</div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenSourceTree();
              }}
              className="w-full py-2 rounded border border-white/20 hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>Inspect Android Studio Project Files</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 mt-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded font-bold text-xs cursor-pointer transition-colors"
            style={{ backgroundColor: theme.accent, color: '#000000' }}
          >
            CONTINUE USING APP
          </button>
        </div>
      </div>
    </div>
  );
};
