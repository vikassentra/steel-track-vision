import { useTrend } from "@/hooks/useDashboardData";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import type { UnitMode } from "@/pages/Index";

interface TrendChartProps {
  onPointClick: (date: string) => void;
  unitMode: UnitMode;
  frequency: "Monthly" | "Daily";
  fromMonth?: string;
  toMonth?: string;
}

const absUnit = (mode: UnitMode) => mode === "energy" ? "TJ" : "tCO2e";
const intUnit = (mode: UnitMode) => mode === "energy" ? "TJ/t" : "kgCO2e/t";

const CustomTooltip = ({ active, payload, label, unitMode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl text-xs space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">Total: <span className="text-foreground font-mono">{d.totalEmissions?.toLocaleString()} {absUnit(unitMode)}</span></p>
      <p className="text-muted-foreground">Intensity: <span className="text-foreground font-mono">{d.intensity} {intUnit(unitMode)}</span></p>
      <p className="text-muted-foreground">Production: <span className="text-foreground font-mono">{d.production?.toLocaleString()} t</span></p>
      <div className="flex gap-3 pt-1 border-t border-border mt-1">
        <span className="text-scope1">S1: {d.scope1?.toLocaleString()}</span>
        <span className="text-scope2">S2: {d.scope2?.toLocaleString()}</span>
        <span className="text-scope3">S3: {d.scope3?.toLocaleString()}</span>
      </div>
    </div>
  );
};

const TrendChart = ({ onPointClick, unitMode, frequency, fromMonth, toMonth }: TrendChartProps) => {
  const { data: trendData, isLoading } = useTrend(fromMonth, toMonth);
  const periodLabel = frequency === "Daily" ? "day" : "month";

  if (isLoading || !trendData) {
    return (
      <div className="bg-card border-y border-border px-4 py-5">
        <div className="animate-pulse h-[320px] bg-muted/20 rounded" />
      </div>
    );
  }

  const data = trendData.map((d) => ({
    ...d,
    date: d.date, // Already in YYYY-MM format
  }));

  return (
    <div className="bg-card border-y border-border px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Emissions Trend</h3>
          <p className="text-xs text-muted-foreground">{absUnit(unitMode)} by {periodLabel} — click a point to explore deviations</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-scope1" />Scope 1</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-scope2" />Scope 2</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-scope3" />Scope 3</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} onClick={(e: any) => e?.activeLabel && onPointClick(e.activeLabel)}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
          <Tooltip content={<CustomTooltip unitMode={unitMode} />} />
          <Bar dataKey="scope1" stackId="a" fill="hsl(168 70% 50%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="scope2" stackId="a" fill="hsl(45 95% 58%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="scope3" stackId="a" fill="hsl(270 60% 60%)" radius={[2, 2, 0, 0]} />
          <Line type="monotone" dataKey="intensity" stroke="hsl(330 80% 60%)" strokeWidth={2} dot={false} yAxisId="right" name="Intensity" />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
