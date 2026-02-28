import { useState } from "react";
import { peerBenchmarks, peerGroups } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LabelList,
  ComposedChart, Line, Scatter
} from "recharts";
import type { UnitMode } from "@/pages/Index";

interface PeerBenchmarkProps {
  unitMode: UnitMode;
}

const intUnit = (mode: UnitMode) => (mode === "energy" ? "TJ/t" : "tCO2e/t");

const yourTrend = [
  { period: "FY 24", value: 3.05 },
  { period: "FY 25", value: 2.92 },
  { period: "FY 26", value: 2.81 },
  { period: "Prev Mo", value: 2.78 },
  { period: "Today", value: 2.85 },
];

const PeerBenchmark = ({ unitMode }: PeerBenchmarkProps) => {
  const [group, setGroup] = useState(peerGroups[0]);
  const u = intUnit(unitMode);

  const peers = peerBenchmarks.filter((p) => p.type !== "you");
  const median = peerBenchmarks.find((p) => p.name === "Industry Median");
  const peersSorted = [...peers].sort((a, b) => a.intensity - b.intensity);

  // Peers only — "You (Today)" shown as a reference line
  const yourTodayIntensity = 2.85;
  const peerWithYou = peersSorted;

  const tooltipStyle = {
    background: "hsl(220 18% 12%)",
    border: "1px solid hsl(220 15% 22%)",
    borderRadius: 8,
    fontSize: 11,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Peer Benchmark & Intensity Trend
          </h3>
          <p className="text-xs text-muted-foreground">
            Intensity comparison ({u} crude steel)
          </p>
        </div>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="px-3 py-1.5 text-xs bg-secondary rounded-md text-secondary-foreground border-none outline-none cursor-pointer"
        >
          {peerGroups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Your Intensity Trend — vertical bar + line */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Your Intensity Trend
            </p>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "hsl(168 70% 50%)" }} />
                Current
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "hsl(168 40% 32%)" }} />
                Historical
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={yourTrend} margin={{ top: 20, right: 10, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168 70% 50%)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(168 50% 35%)" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="barGradientHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(168 40% 38%)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="hsl(168 30% 25%)" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                domain={[2.4, 3.2]}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ${u}`, "Intensity"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36}>
                <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: "hsl(215 15% 65%)", fontFamily: "monospace" }} />
                {yourTrend.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === yourTrend.length - 1 ? "url(#barGradient)" : "url(#barGradientHist)"}
                  />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(330 80% 60%)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
              <Scatter dataKey="value" fill="hsl(330 80% 60%)" r={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Peer Comparison — horizontal bars */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              Peer Comparison
            </p>
            <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 border-t border-dashed" style={{ borderColor: "hsl(330 80% 60%)" }} />
                You (Today)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm" style={{ background: "hsl(215 20% 45%)" }} />
                Peers
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peerWithYou} layout="vertical" margin={{ left: 90, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 16%)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                domain={[0, 3.5]}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }}
                width={90}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} ${u}`]} />
              <ReferenceLine
                x={yourTodayIntensity}
                stroke="hsl(330 80% 60%)"
                strokeDasharray="4 4"
                label={{
                  value: `You ${yourTodayIntensity}`,
                  fontSize: 9,
                  fill: "hsl(330 80% 60%)",
                  position: "top",
                }}
              />
              <Bar dataKey="intensity" radius={[0, 6, 6, 0]} barSize={20}>
                <LabelList
                  dataKey="intensity"
                  position="right"
                  style={{ fontSize: 9, fill: "hsl(215 15% 55%)", fontFamily: "monospace" }}
                />
                {peerWithYou.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill="hsl(215 20% 35%)"
                    opacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground italic leading-relaxed mt-3">
        Benchmark is normalized by route/grade where possible. Data sources: WSA, company reports.
      </p>
    </div>
  );
};

export default PeerBenchmark;
