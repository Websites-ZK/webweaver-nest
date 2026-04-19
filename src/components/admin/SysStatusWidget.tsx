import { useEffect, useState } from "react";
import { useServerMonitor } from "@/hooks/useServerMonitor";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Cpu, MemoryStick, HardDrive, Network, Loader2 } from "lucide-react";

const MAX_SAMPLES = 12; // 12 × 5s = 60s window

const Sparkline = ({ values, stroke }: { values: number[]; stroke: string }) => {
  const width = 100;
  const height = 28;
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-40">
        <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const stepX = width / (MAX_SAMPLES - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const areaPoints = `0,${height} ${points} ${(values.length - 1) * stepX},${height}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={areaPoints} fill={stroke} opacity="0.15" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

interface DiskInfo {
  mount: string;
  used_gb: number;
  total_gb: number;
  percent: number;
}

interface SysStatusPayload {
  // Rich payload (preferred)
  cpu_percent?: number;
  cpu_cores?: number;
  load_avg?: number[];
  mem_used_mb?: number;
  mem_total_mb?: number;
  disks?: DiskInfo[];
  status?: string;
  // Legacy payload (fallback)
  cpu?: string;
  mem?: string;
  disk?: string;
}

interface NetworkPayload {
  rx_bps?: number; // bytes per second received
  tx_bps?: number; // bytes per second transmitted
  iface?: string;
  capacity_mbps?: number; // optional link speed for ring %
}

const formatRate = (bps: number) => {
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} GB/s`;
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} MB/s`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(1)} KB/s`;
  return `${Math.round(bps)} B/s`;
};

const toneFor = (pct: number) => {
  if (pct >= 85) return "text-destructive";
  if (pct >= 70) return "text-amber-500";
  return "text-emerald-500";
};

const strokeFor = (pct: number) => {
  if (pct >= 85) return "hsl(var(--destructive))";
  if (pct >= 70) return "hsl(38 92% 50%)";
  return "hsl(142 71% 45%)";
};

const Ring = ({ percent, label, size = 96 }: { percent: number; label: string; size?: number }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, percent));
  const offset = circumference - (safe / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeFor(safe)}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-lg font-bold ${toneFor(safe)}`}>{label}</span>
      </div>
    </div>
  );
};

const parseLegacyPercent = (val?: string): number | undefined => {
  if (!val) return undefined;
  const m = val.match(/(\d+(?:\.\d+)?)/);
  return m ? Math.min(100, parseFloat(m[1])) : undefined;
};

const parseLegacyMem = (val?: string): { used: number; total: number } | undefined => {
  if (!val) return undefined;
  const m = val.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? { used: parseInt(m[1]), total: parseInt(m[2]) } : undefined;
};

const SysStatusWidget = () => {
  const { data, loading } = useServerMonitor<SysStatusPayload>("system_health", undefined, 5000);
  const { data: net } = useServerMonitor<NetworkPayload>("network_stats", undefined, 5000);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memHistory, setMemHistory] = useState<number[]>([]);
  const [netHistory, setNetHistory] = useState<number[]>([]);

  // Resolve values with graceful fallback to legacy payload
  const cpuPercent = data?.cpu_percent ?? parseLegacyPercent(data?.cpu) ?? 0;
  const cpuCores = data?.cpu_cores;
  const loadAvg = data?.load_avg;
  const load1 = loadAvg?.[0] ?? 0;
  const loadPct = cpuCores ? Math.min(100, (load1 / cpuCores) * 100) : Math.min(100, load1 * 100);
  const isSmooth = cpuCores ? load1 < cpuCores * 0.7 : load1 < 1;

  const legacyMem = parseLegacyMem(data?.mem);
  const memUsed = data?.mem_used_mb ?? legacyMem?.used ?? 0;
  const memTotal = data?.mem_total_mb ?? legacyMem?.total ?? 0;
  const memPct = memTotal > 0 ? (memUsed / memTotal) * 100 : 0;

  const disks: DiskInfo[] = data?.disks && data.disks.length > 0
    ? data.disks
    : [{
        mount: "/",
        used_gb: 0,
        total_gb: 0,
        percent: parseLegacyPercent(data?.disk) ?? 0,
      }];

  const rxBps = net?.rx_bps ?? 0;
  const txBps = net?.tx_bps ?? 0;
  const totalBps = rxBps + txBps;
  // Ring %: prefer link capacity; otherwise use rolling max as a soft scale
  const linkBps = (net?.capacity_mbps ?? 1000) * 125_000; // mbps → bytes/s
  const netPct = Math.min(100, (totalBps / linkBps) * 100);

  // Buffer last 12 samples (60s @ 5s refresh)
  useEffect(() => {
    if (!data) return;
    setCpuHistory((prev) => [...prev, cpuPercent].slice(-MAX_SAMPLES));
    setMemHistory((prev) => [...prev, memPct].slice(-MAX_SAMPLES));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!net) return;
    setNetHistory((prev) => [...prev, totalBps].slice(-MAX_SAMPLES));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net]);

  if (loading && !data) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Sys Status</h3>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            refreshes every 5s
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {/* Load */}
          <div className="flex flex-col items-center text-center">
            <Ring percent={loadPct} label={`${load1.toFixed(2)}`} />
            <p className="mt-3 text-sm font-medium text-foreground">Load average</p>
            <p className={`text-xs ${isSmooth ? "text-emerald-500" : "text-amber-500"}`}>
              {isSmooth ? "Smooth operation" : "Busy"}
            </p>
            {loadAvg && (
              <p className="mt-1 text-xs text-muted-foreground">
                {loadAvg.map((v) => v.toFixed(2)).join(" / ")}
              </p>
            )}
          </div>

          {/* CPU */}
          <div className="flex flex-col items-center text-center">
            <Ring percent={cpuPercent} label={`${cpuPercent.toFixed(1)}%`} />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Cpu className="h-3.5 w-3.5" /> CPU usage
            </p>
            <p className="text-xs text-muted-foreground">
              {cpuCores ? `${cpuCores} Core${cpuCores > 1 ? "s" : ""}` : "—"}
            </p>
            <div className="mt-2" title="Last 60 seconds">
              <Sparkline values={cpuHistory} stroke={strokeFor(cpuPercent)} />
            </div>
          </div>

          {/* RAM */}
          <div className="flex flex-col items-center text-center">
            <Ring percent={memPct} label={`${memPct.toFixed(1)}%`} />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MemoryStick className="h-3.5 w-3.5" /> RAM usage
            </p>
            <p className="text-xs text-muted-foreground">
              {memUsed}/{memTotal} MB
            </p>
            <div className="mt-2" title="Last 60 seconds">
              <Sparkline values={memHistory} stroke={strokeFor(memPct)} />
            </div>
          </div>

          {/* Network */}
          <div className="flex flex-col items-center text-center">
            <Ring percent={netPct} label={`${netPct.toFixed(1)}%`} />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Network className="h-3.5 w-3.5" /> Network
            </p>
            <p className="text-xs text-muted-foreground">
              {net ? `↓ ${formatRate(rxBps)}  ↑ ${formatRate(txBps)}` : "—"}
            </p>
            {net?.iface && (
              <p className="text-[10px] text-muted-foreground/70">{net.iface}</p>
            )}
            <div className="mt-2" title="Last 60 seconds (total)">
              <Sparkline values={netHistory} stroke={strokeFor(netPct)} />
            </div>
          </div>

          {/* Disk(s) */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
              <HardDrive className="h-3.5 w-3.5" /> Disk usage
            </div>
            <div className="space-y-3">
              {disks.map((d) => (
                <div key={d.mount} className="flex items-center gap-3 rounded-md border border-border/40 bg-muted/30 p-2">
                  <Ring percent={d.percent} label={`${d.percent}%`} size={56} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-mono font-medium text-foreground">{d.mount}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.total_gb > 0
                        ? `${d.used_gb.toFixed(1)} / ${d.total_gb.toFixed(1)} GB`
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SysStatusWidget;
