import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '../types/cleaner';
import {
  Trash2,
  HardDrive,
  Smartphone,
  Activity,
  Settings,
  Wifi,
  Signal,
  Battery,
  Maximize2,
  Minimize2,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export type NavTabId = 'clean' | 'storage' | 'apps' | 'monitor' | 'settings';

interface AndroidFrameProps {
  theme: ThemeConfig;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  children: React.ReactNode;
  isSandboxMode: boolean;
  onOpenCodeDrawer: () => void;
  onOpenPhoneInstallModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  theme,
  activeTab,
  onSelectTab,
  children,
  isSandboxMode,
  onOpenCodeDrawer,
  onOpenPhoneInstallModal,
}) => {
  const [isDeviceMockup, setIsDeviceMockup] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 768 : false
  );
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: NavTabId; label: string; icon: React.FC<any> }[] = [
    { id: 'clean', label: 'Clean', icon: Trash2 },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-0 sm:p-4 transition-colors duration-500"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Top Bar for Desktop view (Mockup toggle & code export shortcut) */}
      <header className="w-full max-w-4xl flex items-center justify-between px-4 py-2.5 mb-2 text-xs font-mono-tech border-b sm:border border-white/10 sm:rounded-xl bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }}
          />
          <span className="font-bold text-white tracking-wide">
            UnderGround Android Cleaner
          </span>
          <span className="text-[10px] text-neutral-400">v1.0.0 (API 36)</span>
          {isSandboxMode && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ backgroundColor: `${theme.accent}25`, color: theme.accent }}
            >
              SANDBOX
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPhoneInstallModal}
            className="px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
            style={{
              backgroundColor: theme.accent,
              color: '#000000',
            }}
          >
            <Smartphone size={13} />
            <span>Install / Scan to Phone</span>
          </button>

          <button
            onClick={onOpenCodeDrawer}
            className="px-2.5 py-1 rounded border border-white/20 hover:bg-white/10 text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
          >
            <span>Kotlin & Gradle</span>
          </button>

          <button
            onClick={() => setIsDeviceMockup(!isDeviceMockup)}
            className="p-1.5 rounded border border-white/20 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isDeviceMockup ? 'Switch to Full-Width View' : 'Switch to Phone Mockup'}
          >
            {isDeviceMockup ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Main Container: Device Mockup or Responsive Shell */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          isDeviceMockup
            ? 'max-w-[420px] h-[860px] rounded-[42px] border-[8px] border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9)]'
            : 'max-w-4xl min-h-[820px] rounded-2xl border border-white/10 shadow-2xl'
        }`}
        style={{
          backgroundColor: theme.bg,
          borderColor: isDeviceMockup ? '#1c1c1e' : 'rgba(255,255,255,0.1)',
        }}
      >
        {/* Android Punch-Hole Camera (Phone Mockup Mode) */}
        {isDeviceMockup && (
          <div className="absolute top-3 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-black border border-neutral-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
            </div>
          </div>
        )}

        {/* Android Status Bar */}
        <div
          className="h-10 px-5 flex items-center justify-between text-xs font-mono-tech select-none z-40 shrink-0 border-b border-white/5"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <span className="font-semibold text-white tracking-wider">{currentTime}</span>

          <div className="flex items-center gap-3 text-neutral-300">
            <span className="text-[10px] font-bold tracking-tight" style={{ color: theme.accent }}>
              5G
            </span>
            <Wifi size={13} />
            <Signal size={13} />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold">82%</span>
              <Battery size={13} className="text-white" />
            </div>
          </div>
        </div>

        {/* Dynamic App Content Screen Area */}
        <main className="flex-1 overflow-y-auto relative">{children}</main>

        {/* Bottom Android Navigation Bar */}
        <nav
          className="h-16 border-t font-mono-tech flex items-center justify-around px-2 z-40 select-none shrink-0 backdrop-blur-lg"
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.92)',
            borderColor: `${theme.accent}25`,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all duration-200 cursor-pointer relative group"
              >
                <div
                  className="p-1 rounded-md transition-colors"
                  style={{
                    color: isActive ? theme.accent : '#888888',
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span
                  className="text-[10px] font-medium tracking-wide mt-0.5 transition-colors"
                  style={{
                    color: isActive ? theme.accent : '#888888',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>

                {/* Subtle active dot */}
                {isActive && (
                  <span
                    className="w-1 h-1 rounded-full absolute bottom-1"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Android Gesture Bar Pill (Bottom) */}
        <div className="h-4 bg-black flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-neutral-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
