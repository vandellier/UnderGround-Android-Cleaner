import React, { useState, useEffect } from 'react';
import { ThemeConfig, SystemMetrics } from '../../types/cleaner';
import { formatBytes } from '../../theme/themes';
import {
  Activity,
  Cpu,
  Server,
  HardDrive,
  BatteryCharging,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  BellRing,
} from 'lucide-react';

interface SystemMonitorScreenProps {
  theme: ThemeConfig;
}

export const SystemMonitorScreen: React.FC<SystemMonitorScreenProps> = ({ theme }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsagePercent: 28,
    cpuTempCelsius: 38.4,
    coresActive: [32, 28, 45, 12, 18, 22, 64, 40], // Octa-core
    ramTotalMB: 12288, // 12 GB
    ramUsedMB: 7372, // ~60%
    storageTotalGB: 256,
    storageUsedGB: 184,
    batteryPercent: 82,
    batteryTempCelsius: 31.8,
    batteryHealth: 'Good',
    isCharging: false,
    history: Array.from({ length: 25 }, (_, i) => ({
      timestamp: Date.now() - (24 - i) * 12000,
      cpu: Math.floor(20 + Math.random() * 30),
      ram: Math.floor(58 + Math.random() * 8),
    })),
  });

  const [isLiveSampling, setIsLiveSampling] = useState<boolean>(true);
  const [foregroundServiceActive, setForegroundServiceActive] = useState<boolean>(false);

  // Live sampling ticker
  useEffect(() => {
    if (!isLiveSampling) return;

    const interval = setInterval(() => {
      setMetrics((prev) => {
        // Natural fluctuations
        const deltaCpu = (Math.random() - 0.48) * 12;
        const newCpu = Math.max(8, Math.min(94, Math.round(prev.cpuUsagePercent + deltaCpu)));
        const deltaRam = (Math.random() - 0.5) * 80;
        const newRamUsed = Math.max(5000, Math.min(11000, Math.round(prev.ramUsedMB + deltaRam)));
        const newTemp = parseFloat((37 + newCpu * 0.08 + (Math.random() - 0.5)).toFixed(1));

        const updatedHistory = [
          ...prev.history.slice(1),
          {
            timestamp: Date.now(),
            cpu: newCpu,
            ram: Math.round((newRamUsed / prev.ramTotalMB) * 100),
          },
        ];

        return {
          ...prev,
          cpuUsagePercent: newCpu,
          cpuTempCelsius: newTemp,
          ramUsedMB: newRamUsed,
          history: updatedHistory,
          coresActive: prev.coresActive.map((core) =>
            Math.max(5, Math.min(98, Math.round(core + (Math.random() - 0.5) * 20)))
          ),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveSampling]);

  const ramUsedGB = (metrics.ramUsedMB / 1024).toFixed(1);
  const ramTotalGB = (metrics.ramTotalMB / 1024).toFixed(0);
  const ramPercent = Math.round((metrics.ramUsedMB / metrics.ramTotalMB) * 100);

  // Sparkline coordinates generator
  const maxDataPoints = metrics.history.length;
  const svgWidth = 320;
  const svgHeight = 70;
  const points = metrics.history
    .map((h, i) => {
      const x = (i / (maxDataPoints - 1)) * svgWidth;
      const y = svgHeight - (h.cpu / 100) * (svgHeight - 10) - 5;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative min-h-full pb-24 text-white px-4 pt-3 space-y-4 font-mono-tech">
      {/* Real-time Status Header */}
      <div
        className="p-3.5 rounded-xl border backdrop-blur-md flex items-center justify-between"
        style={{
          backgroundColor: 'rgba(10, 14, 10, 0.85)',
          borderColor: `${theme.accent}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <Activity size={16} style={{ color: theme.accent }} />
          <span className="text-xs font-bold text-white uppercase">
            Linux Kernel Real-Time Telemetry
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsLiveSampling(!isLiveSampling)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              isLiveSampling
                ? 'border-green-500/40 text-green-400 bg-green-500/10'
                : 'border-white/20 text-neutral-400 bg-black'
            }`}
          >
            <RefreshCw size={10} className={isLiveSampling ? 'animate-spin' : ''} />
            {isLiveSampling ? 'LIVE 2.0s' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* 5-Minute CPU & Load Sparkline */}
      <div className="p-4 rounded-xl border border-white/10 bg-neutral-950/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cpu size={14} style={{ color: theme.accent }} />
            <span className="font-bold text-white">CPU Utilisation Sparkline (5m)</span>
          </div>
          <span className="text-sm font-bold" style={{ color: theme.accent }}>
            {metrics.cpuUsagePercent}%
          </span>
        </div>

        {/* SVG Sparkline Graph */}
        <div className="w-full h-20 bg-black/60 rounded-lg p-1 border border-white/5 relative overflow-hidden flex items-end">
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Grid lines */}
            <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
            <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

            {/* Sparkline polyline */}
            <polyline
              fill="none"
              stroke={theme.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>

        {/* 8-Core Activity Matrix */}
        <div className="pt-2">
          <div className="text-[10px] text-neutral-400 mb-1.5 uppercase">
            Octa-Core Cluster Topology:
          </div>
          <div className="grid grid-cols-8 gap-1">
            {metrics.coresActive.map((corePct, idx) => (
              <div
                key={idx}
                className="bg-black/80 border border-white/10 rounded p-1 text-center"
              >
                <div className="text-[8px] text-neutral-500">C{idx}</div>
                <div
                  className="text-[9px] font-bold mt-0.5"
                  style={{
                    color: corePct > 70 ? '#ef4444' : corePct > 40 ? '#f59e0b' : theme.accent,
                  }}
                >
                  {corePct}%
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded mt-1 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${corePct}%`,
                      backgroundColor:
                        corePct > 70 ? '#ef4444' : corePct > 40 ? '#f59e0b' : theme.accent,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Key Telemetry Gauges */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* RAM Card */}
        <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[10px] uppercase font-bold">LPDDR5X RAM</span>
            <Server size={14} style={{ color: theme.accent }} />
          </div>
          <div className="text-base font-bold text-white">
            {ramUsedGB}{' '}
            <span className="text-[10px] text-neutral-400 font-normal">/ {ramTotalGB} GB</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-300"
              style={{
                width: `${ramPercent}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
          <div className="text-[10px] text-neutral-400 flex justify-between">
            <span>{ramPercent}% Allocated</span>
            <span>{metrics.ramTotalMB - metrics.ramUsedMB} MB Free</span>
          </div>
        </div>

        {/* Battery & Thermal Card */}
        <div className="p-3.5 rounded-xl border border-white/10 bg-neutral-950/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 text-[10px] uppercase font-bold">BATTERY & THERMAL</span>
            <BatteryCharging size={14} className="text-green-400" />
          </div>
          <div className="text-base font-bold text-white flex items-center gap-1.5">
            <span>{metrics.batteryPercent}%</span>
            <span className="text-xs text-neutral-400 font-normal">
              · {metrics.batteryTempCelsius}°C
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-900 rounded overflow-hidden">
            <div
              className="h-full rounded bg-green-400 transition-all duration-300"
              style={{ width: `${metrics.batteryPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-neutral-400 flex justify-between">
            <span>Health: {metrics.batteryHealth}</span>
            <span>CPU: {metrics.cpuTempCelsius}°C</span>
          </div>
        </div>
      </div>

      {/* Low-Overhead Sampling & Foreground Service Setting */}
      <div className="p-3.5 rounded-xl border border-white/10 bg-black/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <BellRing size={16} className="text-neutral-400" />
          <div>
            <div className="font-semibold text-white text-xs">
              Foreground Service Notification
            </div>
            <div className="text-[10px] text-neutral-400">
              Low-overhead persistent notification to monitor battery temp
            </div>
          </div>
        </div>
        <button
          onClick={() => setForegroundServiceActive(!foregroundServiceActive)}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
            foregroundServiceActive ? 'bg-green-500' : 'bg-neutral-800'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              foregroundServiceActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
