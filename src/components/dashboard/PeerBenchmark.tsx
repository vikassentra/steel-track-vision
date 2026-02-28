import { useState } from "react";
import { peerBenchmarks, peerGroups } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import type { UnitMode } from "@/pages/Index";

interface PeerBenchmarkProps {
  unitMode: UnitMode;
}

const intUnit = (mode: UnitMode) => mode === "energy" ? "TJ/t" : "tCO2e/t";

const PeerBenchmark = ({ unitMode }: PeerBenchmarkProps) => {
  const [group, setGroup] = useState(peerGroups[0]);
  const u = intUnit(unitMode);

  const sorted = [...peerBenchmarks].sort((a, b) => a.intensity - b.intensity);
  const yourValue = peerBenchmarks.find((p) => p.type === "you");
  const median = peerBenchmarks.find((p) => p.name === "Industry Median");
  const rank = sorted.findIndex((p) => p.type === "you") + 1;

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Peer Benchmark</h3>
          <p className="text-xs text-muted-foreground">Intensity comparison ({u} crude steel)</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} domain={[0, 3.5]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} width={80} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 18% 15%)",
                  border: "1px solid hsl(220 15% 22%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v} ${u}`]}
              />
              {median && (
                <ReferenceLine x={median.intensity} stroke="hsl(330 80% 60%)" strokeDasharray="4 4" label={{ value: "Median", fontSize: 10, fill: "hsl(330 80% 60%)" }} />
              )}
              <Bar dataKey="intensity" radius={[0, 4, 4, 0]}>
                {sorted.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.type === "you" ? "hsl(168 70% 50%)" : "hsl(215 15% 35%)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Your Intensity</p>
            <p className="text-xl font-bold text-primary font-mono">{yourValue?.intensity}</p>
            <p className="text-xs text-muted-foreground">{u}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Benchmarks</p>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Best-in-class</span>
              <span className="text-foreground font-mono">1.82</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Median</span>
              <span className="text-foreground font-mono">3.04</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Your value</span>
              <span className="text-primary font-mono font-medium">{yourValue?.intensity}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            Benchmark is normalized by route/grade where possible. Data sources: WSA, company reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeerBenchmark;
