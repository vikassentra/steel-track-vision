import { useState } from "react";
import { X, AlertTriangle, TrendingUp, ChevronRight } from "lucide-react";
import { waterfallData, driverDetails } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import DriverDetailModal from "./DriverDetailModal";

interface DeviationDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedDate?: string;
}

const DeviationDrawer = ({ open, onClose, selectedDate }: DeviationDrawerProps) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  if (!open) return null;

  // Transform waterfall data for visual rendering
  const waterfallChartData = waterfallData.map((item) => ({
    name: item.name,
    value: item.type === "total" ? item.value : Math.abs(item.value),
    fill: item.type === "total"
      ? "hsl(215 15% 40%)"
      : item.value > 0
      ? "hsl(0 72% 55%)"
      : "hsl(168 70% 50%)",
  }));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/60 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Why did emissions change?</h2>
            <p className="text-xs text-muted-foreground">{selectedDate || "Feb 28, 2025"}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Summary */}
          <div className="flex gap-3">
            <div className="flex-1 bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Emissions Change</p>
              <p className="text-lg font-bold text-chart-negative font-mono">+450 tCO2e</p>
              <p className="text-xs text-muted-foreground">+3.4% vs previous day</p>
            </div>
            <div className="flex-1 bg-secondary rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Intensity Change</p>
              <p className="text-lg font-bold text-chart-negative font-mono">+0.05 kgCO2e/t</p>
              <p className="text-xs text-muted-foreground">+1.8% vs previous day</p>
            </div>
          </div>

          {/* Waterfall */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Contribution Waterfall</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={waterfallChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(215 15% 55%)" }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220 18% 15%)",
                    border: "1px solid hsl(220 15% 22%)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {waterfallChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Driver Table */}
          <div>
            <h3 className="text-xs font-semibold text-foreground mb-3">Top Contributing Drivers</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left p-2 text-muted-foreground font-medium">Driver</th>
                    <th className="text-left p-2 text-muted-foreground font-medium">Scope</th>
                    <th className="text-left p-2 text-muted-foreground font-medium">Shop</th>
                    <th className="text-right p-2 text-muted-foreground font-medium">Δ Activity</th>
                    <th className="text-right p-2 text-muted-foreground font-medium">Δ tCO2e</th>
                    <th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {driverDetails.map((row) => (
                    <tr
                      key={row.driver}
                      onClick={() => setSelectedDriver(row.driver)}
                      className="border-t border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <td className="p-2 text-foreground flex items-center gap-1.5">
                        {row.anomaly && <AlertTriangle className="w-3 h-3 text-accent" />}
                        {row.driver}
                      </td>
                      <td className="p-2 text-muted-foreground">{row.scope}</td>
                      <td className="p-2 text-muted-foreground">{row.shop}</td>
                      <td className="p-2 text-right font-mono text-foreground">{row.valueChange}</td>
                      <td className={`p-2 text-right font-mono font-medium ${
                        row.emissionsChange > 0 ? "text-chart-negative" : "text-chart-positive"
                      }`}>
                        {row.emissionsChange > 0 ? "+" : ""}{row.emissionsChange}
                      </td>
                      <td className="p-2">
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Detail Modal */}
      <DriverDetailModal
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
      />
    </>
  );
};

export default DeviationDrawer;
