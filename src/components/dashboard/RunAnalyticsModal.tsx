import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowRightLeft, TrendingUp, Factory, Fuel, Calendar } from "lucide-react";

interface RunAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

const locations = ["Rourkela Works", "Burnpur Works", "Durgapur Steel"];
const timePeriods = ["FY24 Q1", "FY24 Q2", "FY24 Q3", "FY24 Q4", "FY25 Q1", "FY25 Q2"];
const drivers = ["Coke Rate", "PCI Rate", "Scrap Ratio", "Power Mix", "BFG Recovery", "Sinter Ratio"];

const comparisonData = [
  { metric: "Total Emissions", rourkela: 14200, burnpur: 11800, durgapur: 9400, unit: "tCO₂e/day" },
  { metric: "Intensity", rourkela: 2.85, burnpur: 2.62, durgapur: 2.91, unit: "tCO₂e/t" },
  { metric: "Coke Rate", rourkela: 385, burnpur: 372, durgapur: 398, unit: "kg/tHM" },
  { metric: "PCI Rate", rourkela: 142, burnpur: 158, durgapur: 128, unit: "kg/tHM" },
  { metric: "Scrap Ratio", rourkela: 18, burnpur: 22, durgapur: 15, unit: "%" },
  { metric: "BFG Recovery", rourkela: 88, burnpur: 92, durgapur: 85, unit: "%" },
];

const trendComparisonData = timePeriods.map((tp, i) => ({
  period: tp,
  Rourkela: +(2.95 - i * 0.03 + Math.random() * 0.08).toFixed(2),
  Burnpur: +(2.72 - i * 0.04 + Math.random() * 0.06).toFixed(2),
  Durgapur: +(3.0 - i * 0.02 + Math.random() * 0.1).toFixed(2),
}));

const driverComparisonData = drivers.map((d) => ({
  driver: d,
  Rourkela: Math.round(300 + Math.random() * 200),
  Burnpur: Math.round(280 + Math.random() * 180),
  Durgapur: Math.round(320 + Math.random() * 220),
}));

type Tab = "location" | "time" | "drivers";

const RunAnalyticsModal = ({ open, onClose }: RunAnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("location");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["Rourkela Works", "Burnpur Works"]);

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "location", label: "Cross-Location", icon: <Factory className="w-3.5 h-3.5" /> },
    { key: "time", label: "Time Period", icon: <Calendar className="w-3.5 h-3.5" /> },
    { key: "drivers", label: "Driver Comparison", icon: <Fuel className="w-3.5 h-3.5" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Run Analytics
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Compare emissions performance across locations, time periods, and drivers</p>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="flex bg-secondary rounded-md p-0.5 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Location Selector */}
        <div className="flex gap-1.5 flex-wrap">
          {locations.map((loc) => (
            <Badge
              key={loc}
              variant={selectedLocations.includes(loc) ? "default" : "secondary"}
              className="cursor-pointer text-xs"
              onClick={() => toggleLocation(loc)}
            >
              {loc}
            </Badge>
          ))}
        </div>

        {/* Cross-Location Tab */}
        {activeTab === "location" && (
          <div className="space-y-4">
            {/* KPI Comparison Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Metric</th>
                    {locations.map((loc) => (
                      <th key={loc} className="text-right p-2.5 font-medium text-muted-foreground">{loc.split(" ")[0]}</th>
                    ))}
                    <th className="text-right p-2.5 font-medium text-muted-foreground">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row) => {
                    const values = [row.rourkela, row.burnpur, row.durgapur];
                    const best = Math.min(...values);
                    return (
                      <tr key={row.metric} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-2.5 font-medium">{row.metric}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.rourkela === best ? "text-emerald-400 font-semibold" : ""}`}>{row.rourkela.toLocaleString()}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.burnpur === best ? "text-emerald-400 font-semibold" : ""}`}>{row.burnpur.toLocaleString()}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.durgapur === best ? "text-emerald-400 font-semibold" : ""}`}>{row.durgapur.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-muted-foreground">{row.unit}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bar Chart */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-3">Emissions Intensity Comparison</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData.slice(0, 4)} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="rourkela" name="Rourkela" fill="hsl(168 70% 50%)" radius={[3, 3, 0, 0]} barSize={18} />
                  <Bar dataKey="burnpur" name="Burnpur" fill="hsl(45 95% 58%)" radius={[3, 3, 0, 0]} barSize={18} />
                  <Bar dataKey="durgapur" name="Durgapur" fill="hsl(270 60% 60%)" radius={[3, 3, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Time Period Tab */}
        {activeTab === "time" && (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-3">Intensity Trend by Location (tCO₂e/t crude steel)</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Rourkela" stroke="hsl(168 70% 50%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Burnpur" stroke="hsl(45 95% 58%)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Durgapur" stroke="hsl(270 60% 60%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Period summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { loc: "Rourkela", change: -4.2, best: "FY25 Q1" },
                { loc: "Burnpur", change: -6.8, best: "FY25 Q2" },
                { loc: "Durgapur", change: -1.5, best: "FY24 Q4" },
              ].map((s) => (
                <div key={s.loc} className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs font-medium">{s.loc}</p>
                  <p className={`text-sm font-bold mt-1 ${s.change < -3 ? "text-emerald-400" : "text-amber-400"}`}>{s.change}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">vs FY24 start · Best: {s.best}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Driver Comparison Tab */}
        {activeTab === "drivers" && (
          <div className="space-y-4">
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-3">Driver Impact by Location (tCO₂e contribution)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={driverComparisonData} layout="vertical" barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="driver" type="category" width={90} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Rourkela" fill="hsl(168 70% 50%)" radius={[0, 3, 3, 0]} barSize={14} />
                  <Bar dataKey="Burnpur" fill="hsl(45 95% 58%)" radius={[0, 3, 3, 0]} barSize={14} />
                  <Bar dataKey="Durgapur" fill="hsl(270 60% 60%)" radius={[0, 3, 3, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Best practices */}
            <div className="border border-border rounded-lg p-3">
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                Cross-Location Insights
              </p>
              <div className="space-y-2">
                {[
                  { insight: "Burnpur's PCI Rate (158 kg/tHM) is 11% higher than Rourkela — replicate injection strategy to save ~320 tCO₂e/day", tag: "Best Practice" },
                  { insight: "Durgapur's BFG Recovery (85%) lags peers by 5-7% — upgrade gas holder controls for ~180 tCO₂e/day reduction", tag: "Quick Win" },
                  { insight: "Rourkela's Scrap Ratio (18%) is mid-range — increasing to Burnpur's 22% could cut BOF emissions by ~240 tCO₂e/day", tag: "Opportunity" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">{item.tag}</Badge>
                    <p className="text-[11px] text-muted-foreground">{item.insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RunAnalyticsModal;
