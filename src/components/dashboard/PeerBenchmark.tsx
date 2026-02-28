import { useState } from "react";
import { peerBenchmarks, peerGroups } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { UnitMode } from "@/pages/Index";

interface PeerBenchmarkProps {
  unitMode: UnitMode;
}

const intUnit = (mode: UnitMode) => mode === "energy" ? "TJ/t" : "tCO2e/t";

const yourIntensityHistory = [
  { name: "You (FY 24)", intensity: 3.05, type: "you-history" as const },
  { name: "You (FY 25)", intensity: 2.92, type: "you-history" as const },
  { name: "You (FY 26)", intensity: 2.81, type: "you-history" as const },
  { name: "You (Prev Mo)", intensity: 2.78, type: "you-history" as const },
];

const getBarColor = (type: string) => {
  if (type === "you") return "hsl(168 70% 50%)";
  if (type === "you-history") return "hsl(168 50% 38%)";
  return "hsl(215 15% 35%)";
};

const PeerBenchmark = ({ unitMode }: PeerBenchmarkProps) => {
  const [group, setGroup] = useState(peerGroups[0]);
  const u = intUnit(unitMode);

  const yourValue = peerBenchmarks.find((p) => p.type === "you");
  const median = peerBenchmarks.find((p) => p.name === "Industry Median");

  // Merge peer data with your historical intensity, rename "You" to "You (Today)"
  const combined = [
    ...peerBenchmarks.filter((p) => p.type !== "you").map((p) => ({ ...p })),
    ...yourIntensityHistory,
    { name: "You (Today)", intensity: yourValue?.intensity ?? 2.85, type: "you" as const },
  ].sort((a, b) => a.intensity - b.intensity);

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Peer Benchmark & Your Intensity</h3>
          <p className="text-xs text-muted-foreground">Intensity comparison ({u} crude steel)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(168 70% 50%)" }} />You (Today)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(168 50% 38%)" }} />You (Historical)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "hsl(215 15% 35%)" }} />Peers</span>
          </div>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="px-3 py-1.5 text-xs bg-secondary rounded-md text-secondary-foreground border-none outline-none cursor-pointer">
            {peerGroups.map((g) =>
              <option key={g} value={g}>{g}</option>
            )}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={combined} layout="vertical" margin={{ left: 100, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} domain={[0, 3.5]} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} width={100} />
          <Tooltip
            contentStyle={{
              background: "hsl(220 18% 15%)",
              border: "1px solid hsl(220 15% 22%)",
              borderRadius: 8,
              fontSize: 12
            }}
            formatter={(v: number) => [`${v} ${u}`]} />
          {median &&
            <ReferenceLine x={median.intensity} stroke="hsl(330 80% 60%)" strokeDasharray="4 4" label={{ value: "Median", fontSize: 10, fill: "hsl(330 80% 60%)" }} />
          }
          <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
            {combined.map((entry) =>
              <Cell key={entry.name} fill={getBarColor(entry.type)} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-muted-foreground italic leading-relaxed mt-3">
        Benchmark is normalized by route/grade where possible. Data sources: WSA, company reports.
      </p>
    </div>);

};

export default PeerBenchmark;