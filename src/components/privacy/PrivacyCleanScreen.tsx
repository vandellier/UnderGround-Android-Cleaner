import React, { useState } from 'react';
import { ThemeConfig } from '../../types/cleaner';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  ClipboardCheck,
  Globe,
  Trash2,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface PrivacyCleanScreenProps {
  theme: ThemeConfig;
  onClearClipboard: () => void;
  onPurgeCallLogs: (days: number) => void;
  onPurgeSms: (days: number) => void;
  onPurgeBrowserTraces: () => void;
}

export const PrivacyCleanScreen: React.FC<PrivacyCleanScreenProps> = ({
  theme,
  onClearClipboard,
  onPurgeCallLogs,
  onPurgeSms,
  onPurgeBrowserTraces,
}) => {
  const [callLogDays, setCallLogDays] = useState<number>(30);
  const [smsDays, setSmsDays] = useState<number>(7);
  const [hasCallLogPermission, setHasCallLogPermission] = useState<boolean>(false);
  const [hasSmsPermission, setHasSmsPermission] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleClipboardWipe = () => {
    onClearClipboard();
    showNotification('System clipboard cleared and overwritten with null bytes.');
  };

  const handleCallLogPurge = () => {
    if (!hasCallLogPermission) {
      setHasCallLogPermission(true);
      showNotification('Simulated Runtime Permission: READ_CALL_LOG granted.');
      return;
    }
    onPurgeCallLogs(callLogDays);
    showNotification(`Purged call logs older than ${callLogDays} days.`);
  };

  const handleSmsPurge = () => {
    if (!hasSmsPermission) {
      setHasSmsPermission(true);
      showNotification('Simulated Runtime Permission: READ_SMS granted.');
      return;
    }
    onPurgeSms(smsDays);
    showNotification(`Purged expired OTPs & promotional SMS older than ${smsDays} days.`);
  };

  const handleBrowserPurge = () => {
    onPurgeBrowserTraces();
    showNotification('Browser caches & temporary tracker databases cleared.');
  };

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className="p-3 rounded-lg border text-xs flex items-center gap-2 animate-fadeIn"
          style={{
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.accent,
            color: '#ffffff',
          }}
        >
          <CheckCircle2 size={16} style={{ color: theme.accent }} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header notice */}
      <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-white/10 flex items-start gap-3 text-xs">
        <Lock size={16} style={{ color: theme.accent }} className="shrink-0 mt-0.5" />
        <div className="text-neutral-300 font-sans text-xs leading-relaxed">
          <strong className="text-white font-mono-tech block mb-0.5">
            OPT-IN PRIVACY PROTOCOL
          </strong>
          UnderGround never asks for sensitive Call or SMS permissions at startup. Permissions are
          only requested just-in-time when you trigger these actions, and all operations remain
          strictly on-device.
        </div>
      </div>

      {/* Card 1: Clipboard Sanitizer */}
      <div
        className="p-4 rounded-xl border space-y-3"
        style={{
          backgroundColor: 'rgba(10, 14, 10, 0.85)',
          borderColor: `${theme.accent}30`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardCheck size={16} style={{ color: theme.accent }} />
            <span className="font-bold text-xs text-white uppercase">System Clipboard Memory</span>
          </div>
          <span className="text-[10px] text-green-400 font-mono-tech">ACTIVE BUFFER</span>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
          Sensitive passwords, 2FA codes, crypto addresses, and tokens remain cached in the Android
          clipboard until cleared.
        </p>

        <button
          onClick={handleClipboardWipe}
          className="w-full py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{
            backgroundColor: theme.accent,
            color: '#000000',
          }}
        >
          <Trash2 size={13} />
          WIPE CLIPBOARD BUFFER NOW
        </button>
      </div>

      {/* Card 2: Call Log Cleanup */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PhoneCall size={16} className="text-blue-400" />
            <span className="font-bold text-xs text-white uppercase">Call History Sanitizer</span>
          </div>
          <span className="text-[10px] text-neutral-400">
            {hasCallLogPermission ? 'PERMISSION GRANTED' : 'OPT-IN REQUIRED'}
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
          Purge outgoing, incoming, and missed call logs older than your specified threshold to
          protect communication records.
        </p>

        <div className="flex items-center gap-2 text-xs">
          <Clock size={14} className="text-neutral-500" />
          <span className="text-neutral-400">Delete calls older than:</span>
          <select
            value={callLogDays}
            onChange={(e) => setCallLogDays(Number(e.target.value))}
            className="bg-black border border-white/20 rounded px-2 py-1 text-white text-xs"
          >
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={90}>90 Days</option>
            <option value={180}>180 Days</option>
          </select>
        </div>

        <button
          onClick={handleCallLogPurge}
          className="w-full py-2.5 rounded border border-white/20 text-neutral-200 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
        >
          {hasCallLogPermission
            ? `PURGE CALL LOGS (>${callLogDays}d)`
            : 'GRANT CALL_LOG & SANITIZE'}
        </button>
      </div>

      {/* Card 3: SMS Cleanup (OTPs / Promotions) */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MessageSquare size={16} className="text-purple-400" />
            <span className="font-bold text-xs text-white uppercase">Expired OTPs & Promo SMS</span>
          </div>
          <span className="text-[10px] text-neutral-400">
            {hasSmsPermission ? 'PERMISSION GRANTED' : 'OPT-IN REQUIRED'}
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
          One-time passcodes and commercial verification codes are useless after 7 days and only
          clutter your inbox.
        </p>

        <div className="flex items-center gap-2 text-xs">
          <Clock size={14} className="text-neutral-500" />
          <span className="text-neutral-400">Delete OTP messages older than:</span>
          <select
            value={smsDays}
            onChange={(e) => setSmsDays(Number(e.target.value))}
            className="bg-black border border-white/20 rounded px-2 py-1 text-white text-xs"
          >
            <option value={3}>3 Days</option>
            <option value={7}>7 Days</option>
            <option value={14}>14 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>

        <button
          onClick={handleSmsPurge}
          className="w-full py-2.5 rounded border border-white/20 text-neutral-200 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
        >
          {hasSmsPermission ? `PURGE EXPIRED SMS (>${smsDays}d)` : 'GRANT SMS & SANITIZE'}
        </button>
      </div>

      {/* Card 4: Browser Traces */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe size={16} className="text-amber-400" />
            <span className="font-bold text-xs text-white uppercase">Browser Traces & Web Caches</span>
          </div>
          <span className="text-[10px] text-green-400">SAF COMPATIBLE</span>
        </div>

        <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
          Cleans temporary HTTP caches, icon tables, and tracker data for supported browsers (Chrome,
          Firefox, DuckDuckGo, Brave). Saved passwords and autofill data are strictly preserved.
        </p>

        <button
          onClick={handleBrowserPurge}
          className="w-full py-2.5 rounded border border-white/20 text-neutral-200 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer"
        >
          CLEAR BROWSER TRACES
        </button>
      </div>
    </div>
  );
};
