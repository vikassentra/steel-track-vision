import { useShopBreakdown, useDrivers } from "@/hooks/useDashboardData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { UnitMode } from "@/pages/Index";

interface BreakdownPanelsProps {
  onShopClick: (shop: string) => void;
  onScopeClick: (scope: string) => void;
  onDriverClick?: (driver: string) => void;
  activeScope: string;
  unitMode: UnitMode;
}

const absUnit = (mode: UnitMode) => mode === "energy" ? "TJ/t" : "tCO2e/t";

const ShopTooltip = ({ active, payload, unitMode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const u = absUnit(unitMode);
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.shop}</p>
      <p><span className="text-scope1">S1:</span> {d.scope1.toLocaleString()}</p>
      <p><span className="text-scope2">S2:</span> {d.scope2.toLocaleString()}</p>
      <p><span className="text-scope3">S3:</span> {d.scope3.toLocaleString()}</p>
      <p className="font-medium mt-1">Total: {d.total.toLocaleString()} {u}</p>
    </div>
  );
};

const DriverTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.driver}</p>
      <p><span style={{ color: "hsl(168 70% 50%)" }}>Scope 1:</span> {d.scope1.toLocaleString()} tCO₂e</p>
      <p><span style={{ color: "hsl(45 95% 58%)" }}>Scope 2:</span> {d.scope2.toLocaleString()} tCO₂e</p>
      <p><span style={{ color: "hsl(270 60% 60%)" }}>Scope 3:</span> {d.scope3.toLocaleString()} tCO₂e</p>
      <p className="font-medium mt-1">Total: {(d.scope1 + d.scope2 + d.scope3).toLocaleString()} tCO₂e</p>
    </div>
  );
};

const BreakdownPanels = ({ onShopClick, onScopeClick, onDriverClick, activeScope, unitMode }: BreakdownPanelsProps) => {
  const { data: shopData, isLoading: shopsLoading } = useShopBreakdown();
  const { data: driverData, isLoading: driversLoading } = useDrivers();
  const u = absUnit(unitMode);

  const shopBreakdowns = shopData ?? [];
  const driverChartData = driverData ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* By Plant */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Emissions by Plant</h3>
        <p className="text-xs text-muted-foreground mb-3">{u} — click to filter</p>
        {shopsLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={shopBreakdowns} onClick={(e: any) => e?.activeLabel && onShopClick(e.activeLabel)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="shop" tick={{ fontSize: 9, fill: "hsl(215 15% 55%)" }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
              <Tooltip content={<ShopTooltip unitMode={unitMode} />} />
              <Bar dataKey="scope1" stackId="a" fill="hsl(168 70% 50%)" />
              <Bar dataKey="scope2" stackId="a" fill="hsl(45 95% 58%)" />
              <Bar dataKey="scope3" stackId="a" fill="hsl(270 60% 60%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 10 Drivers - Stacked Bar by Scope */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Top Drivers</h3>
        <p className="text-xs text-muted-foreground mb-3">Top 10 by emissions impact · stacked by scope</p>
        {driversLoading ? (
          <div className="animate-pulse h-[300px] bg-muted/20 rounded" />
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={driverChartData.length * 32 + 40}>
                <BarChart data={driverChartData} layout="vertical" barCategoryGap="18%" onClick={(e: any) => e?.activeLabel && onDriverClick?.(e.activeLabel)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
                  <YAxis type="category" dataKey="driver" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} width={90} />
                  <Tooltip content={<DriverTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 10 }}
                    formatter={(value: string) => {
                      const labels: Record<string, string> = { scope1: "Scope 1", scope2: "Scope 2", scope3: "Scope 3" };
                      return labels[value] || value;
                    }}
                  />
                  <Bar dataKey="scope1" stackId="a" fill="hsl(168 70% 50%)" name="scope1" />
                  <Bar dataKey="scope2" stackId="a" fill="hsl(45 95% 58%)" name="scope2" />
                  <Bar dataKey="scope3" stackId="a" fill="hsl(270 60% 60%)" name="scope3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="shrink-0 w-44">
              <div className="grid grid-cols-2 gap-x-2 mb-2 pt-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Δ Activity</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Δ tCO₂e</p>
              </div>
              <div>
                {driverChartData.map((row) => (
                  <div
                    key={row.driver}
                    onClick={() => onDriverClick?.(row.driver)}
                    className="grid grid-cols-2 gap-x-2 cursor-pointer hover:bg-secondary/30 rounded px-1 transition-colors items-center"
                    style={{ height: "32px" }}
                  >
                    <p className="text-[11px] font-mono text-foreground text-right">{Math.round(row.total).toLocaleString()}</p>
                    <p className={`text-[11px] font-mono font-semibold text-right ${row.emissionsChange > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {row.emissionsChange > 0 ? "+" : ""}{row.emissionsChange.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakdownPanels;
