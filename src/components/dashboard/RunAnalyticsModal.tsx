import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { ArrowRightLeft, TrendingUp, Factory, Fuel, Calendar, Plus, X, Sparkles, AlertTriangle, CheckCircle, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface RunAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

const locations = ["Rourkela Works", "Burnpur Works", "Durgapur Steel"];
const timePeriods = ["FY24 Q1", "FY24 Q2", "FY24 Q3", "FY24 Q4", "FY25 Q1", "FY25 Q2"];
const drivers = ["Coke Rate", "PCI Rate", "Scrap Ratio", "Power Mix", "BFG Recovery", "Sinter Ratio"];

interface MetricRow {
  metric: string;
  rourkela: number;
  burnpur: number;
  durgapur: number;
  unit: string;
}

const allAvailableMetrics: MetricRow[] = [
  { metric: "Intensity", rourkela: 2.85, burnpur: 2.62, durgapur: 2.91, unit: "tCO₂e/t" },
  { metric: "Coke Rate", rourkela: 385, burnpur: 372, durgapur: 398, unit: "kg/tHM" },
  { metric: "PCI Rate", rourkela: 142, burnpur: 158, durgapur: 128, unit: "kg/tHM" },
  { metric: "Scrap Ratio", rourkela: 18, burnpur: 22, durgapur: 15, unit: "%" },
  { metric: "BFG Recovery", rourkela: 88, burnpur: 92, durgapur: 85, unit: "%" },
  { metric: "Sinter Ratio", rourkela: 78, burnpur: 82, durgapur: 74, unit: "%" },
  { metric: "Power Mix", rourkela: 42, burnpur: 38, durgapur: 45, unit: "% renewable" },
  { metric: "Slag Rate", rourkela: 320, burnpur: 298, durgapur: 345, unit: "kg/tHM" },
  { metric: "Pellet Ratio", rourkela: 25, burnpur: 30, durgapur: 20, unit: "%" },
  { metric: "COG Recovery", rourkela: 91, burnpur: 89, durgapur: 87, unit: "%" },
];

const defaultMetrics = ["Intensity", "Coke Rate", "PCI Rate", "Scrap Ratio", "BFG Recovery"];

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

const allTimePeriods = ["FY23 Q1", "FY23 Q2", "FY23 Q3", "FY23 Q4", "FY24 Q1", "FY24 Q2", "FY24 Q3", "FY24 Q4", "FY25 Q1", "FY25 Q2"];

const generateTrendData = (periods: string[], locs: string[], driver: string) => {
  const baseValues: Record<string, Record<string, number>> = {
    "Intensity": { Rourkela: 2.95, Burnpur: 2.72, Durgapur: 3.0 },
    "Coke Rate": { Rourkela: 395, Burnpur: 380, Durgapur: 405 },
    "PCI Rate": { Rourkela: 135, Burnpur: 150, Durgapur: 122 },
    "Scrap Ratio": { Rourkela: 16, Burnpur: 20, Durgapur: 13 },
    "BFG Recovery": { Rourkela: 85, Burnpur: 89, Durgapur: 82 },
    "Sinter Ratio": { Rourkela: 75, Burnpur: 79, Durgapur: 71 },
  };
  const base = baseValues[driver] || baseValues["Intensity"];
  return periods.map((tp, i) => {
    const row: Record<string, any> = { period: tp };
    locs.forEach((loc) => {
      const key = loc.split(" ")[0];
      const b = base[key] || 2.8;
      row[key] = +(b - i * (b * 0.01) + Math.random() * (b * 0.03)).toFixed(2);
    });
    return row;
  });
};

const driverUnits: Record<string, string> = {
  "Intensity": "tCO₂e/t crude steel",
  "Coke Rate": "kg/tHM",
  "PCI Rate": "kg/tHM",
  "Scrap Ratio": "%",
  "BFG Recovery": "%",
  "Sinter Ratio": "%",
};

const RunAnalyticsModal = ({ open, onClose }: RunAnalyticsModalProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("location");
  const [selectedLocations, setSelectedLocations] = useState<string[]>(["Rourkela Works", "Burnpur Works"]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultMetrics);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  // Time period tab state
  const [trendPeriods, setTrendPeriods] = useState<string[]>(["FY24 Q1", "FY24 Q2", "FY24 Q3", "FY24 Q4", "FY25 Q1", "FY25 Q2"]);
  const [trendLocations, setTrendLocations] = useState<string[]>(["Rourkela Works", "Burnpur Works", "Durgapur Steel"]);
  const [trendDriver, setTrendDriver] = useState<string>("Intensity");
  // Driver comparison tab state
  const allDrivers = ["Coke Rate", "PCI Rate", "Scrap Ratio", "Power Mix", "BFG Recovery", "Sinter Ratio", "Slag Rate", "Pellet Ratio", "COG Recovery", "Limestone"];
  const [driverTabDrivers, setDriverTabDrivers] = useState<string[]>(["Coke Rate", "PCI Rate", "Scrap Ratio", "Power Mix", "BFG Recovery", "Sinter Ratio"]);
  const [driverTabLocations, setDriverTabLocations] = useState<string[]>(["Rourkela Works", "Burnpur Works", "Durgapur Steel"]);
  const [driverAddMenuOpen, setDriverAddMenuOpen] = useState(false);
  const driverAvailableToAdd = allDrivers.filter((d) => !driverTabDrivers.includes(d));
  const filteredDriverData = driverTabDrivers.map((d) => ({
    driver: d,
    Rourkela: Math.round(300 + Math.abs(d.charCodeAt(0) * 7 % 200)),
    Burnpur: Math.round(280 + Math.abs(d.charCodeAt(1) * 5 % 180)),
    Durgapur: Math.round(320 + Math.abs(d.charCodeAt(2) * 6 % 220)),
  }));
  const locationColors: Record<string, string> = {
    "Rourkela Works": "hsl(168 70% 50%)",
    "Burnpur Works": "hsl(45 95% 58%)",
    "Durgapur Steel": "hsl(270 60% 60%)",
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const removeMetric = (metric: string) => {
    setSelectedMetrics((prev) => prev.filter((m) => m !== metric));
  };

  const addMetric = (metric: string) => {
    if (!selectedMetrics.includes(metric)) {
      setSelectedMetrics((prev) => [...prev, metric]);
    }
    setAddMenuOpen(false);
  };

  const availableToAdd = allAvailableMetrics.filter((m) => !selectedMetrics.includes(m.metric));
  const filteredData = allAvailableMetrics.filter((m) => selectedMetrics.includes(m.metric));

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
            {/* Metrics selector chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedMetrics.map((m) => (
                <Badge key={m} variant="outline" className="text-xs flex items-center gap-1 pr-1">
                  {m}
                  <button
                    onClick={() => removeMetric(m)}
                    className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </Badge>
              ))}
              {availableToAdd.length > 0 && (
                <Popover open={addMenuOpen} onOpenChange={setAddMenuOpen}>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-primary border border-dashed border-primary/40 rounded-md hover:bg-primary/10 transition-colors">
                      <Plus className="w-3 h-3" />
                      Add Metric
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    <div className="max-h-48 overflow-y-auto">
                      {availableToAdd.map((m) => (
                        <button
                          key={m.metric}
                          onClick={() => addMetric(m.metric)}
                          className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-secondary rounded transition-colors"
                        >
                          {m.metric} <span className="text-muted-foreground">({m.unit})</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

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
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => {
                    const values = [row.rourkela, row.burnpur, row.durgapur];
                    const best = Math.min(...values);
                    return (
                      <tr key={row.metric} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="p-2.5 font-medium">{row.metric}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.rourkela === best ? "text-emerald-400 font-semibold" : ""}`}>{row.rourkela.toLocaleString()}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.burnpur === best ? "text-emerald-400 font-semibold" : ""}`}>{row.burnpur.toLocaleString()}</td>
                        <td className={`p-2.5 text-right tabular-nums ${row.durgapur === best ? "text-emerald-400 font-semibold" : ""}`}>{row.durgapur.toLocaleString()}</td>
                        <td className="p-2.5 text-right text-muted-foreground">{row.unit}</td>
                        <td className="p-1">
                          <button
                            onClick={() => removeMetric(row.metric)}
                            className="p-1 rounded hover:bg-destructive/20 transition-colors"
                          >
                            <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Individual Bar Charts per Metric */}
            <div className="grid grid-cols-2 gap-3">
              {filteredData.map((row) => {
                const chartData = [
                  { name: "Rourkela", value: row.rourkela, fill: "hsl(168 70% 50%)" },
                  { name: "Burnpur", value: row.burnpur, fill: "hsl(45 95% 58%)" },
                  { name: "Durgapur", value: row.durgapur, fill: "hsl(270 60% 60%)" },
                ];
                return (
                  <div key={row.metric} className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-[11px] font-medium mb-1">{row.metric} <span className="text-muted-foreground font-normal">({row.unit})</span></p>
                    <ResponsiveContainer width="100%" height={90}>
                      <BarChart data={chartData} layout="vertical" barGap={2}>
                        <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} hide />
                        <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                        <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={14}>
                          {chartData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Period Tab */}
        {activeTab === "time" && (
          <div className="space-y-4">
            {/* Filters row */}
            <div className="flex flex-wrap gap-3 items-start">
              {/* Time Period selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Time Periods</p>
                <div className="flex gap-1 flex-wrap">
                  {allTimePeriods.map((tp) => (
                    <Badge
                      key={tp}
                      variant={trendPeriods.includes(tp) ? "default" : "secondary"}
                      className="cursor-pointer text-[10px]"
                      onClick={() =>
                        setTrendPeriods((prev) =>
                          prev.includes(tp) ? prev.filter((p) => p !== tp) : [...prev, tp]
                        )
                      }
                    >
                      {tp}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Locations</p>
                <div className="flex gap-1 flex-wrap">
                  {locations.map((loc) => (
                    <Badge
                      key={loc}
                      variant={trendLocations.includes(loc) ? "default" : "secondary"}
                      className="cursor-pointer text-[10px]"
                      onClick={() =>
                        setTrendLocations((prev) =>
                          prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
                        )
                      }
                    >
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Driver selector (single) */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Driver</p>
                <div className="flex gap-1 flex-wrap">
                  {drivers.map((d) => (
                    <Badge
                      key={d}
                      variant={trendDriver === d ? "default" : "secondary"}
                      className="cursor-pointer text-[10px]"
                      onClick={() => setTrendDriver(d)}
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-3">{trendDriver} Trend by Location ({driverUnits[trendDriver] || ""})</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={generateTrendData(trendPeriods.sort(), trendLocations, trendDriver)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {trendLocations.includes("Rourkela Works") && <Line type="monotone" dataKey="Rourkela" stroke="hsl(168 70% 50%)" strokeWidth={2} dot={{ r: 3 }} />}
                  {trendLocations.includes("Burnpur Works") && <Line type="monotone" dataKey="Burnpur" stroke="hsl(45 95% 58%)" strokeWidth={2} dot={{ r: 3 }} />}
                  {trendLocations.includes("Durgapur Steel") && <Line type="monotone" dataKey="Durgapur" stroke="hsl(270 60% 60%)" strokeWidth={2} dot={{ r: 3 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Period summary cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { loc: "Rourkela", change: -4.2, best: "FY25 Q1" },
                { loc: "Burnpur", change: -6.8, best: "FY25 Q2" },
                { loc: "Durgapur", change: -1.5, best: "FY24 Q4" },
              ].filter((s) => trendLocations.some((l) => l.startsWith(s.loc))).map((s) => (
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
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-start">
              {/* Site selector */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Sites</p>
                <div className="flex gap-1 flex-wrap">
                  {locations.map((loc) => (
                    <Badge
                      key={loc}
                      variant={driverTabLocations.includes(loc) ? "default" : "secondary"}
                      className="cursor-pointer text-[10px]"
                      onClick={() =>
                        setDriverTabLocations((prev) =>
                          prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
                        )
                      }
                    >
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Driver selector with add/remove */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Drivers</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {driverTabDrivers.map((d) => (
                    <Badge key={d} variant="outline" className="text-[10px] flex items-center gap-1 pr-1">
                      {d}
                      <button
                        onClick={() => setDriverTabDrivers((prev) => prev.filter((x) => x !== d))}
                        className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                      >
                        <X className="w-2.5 h-2.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Badge>
                  ))}
                  {driverAvailableToAdd.length > 0 && (
                    <Popover open={driverAddMenuOpen} onOpenChange={setDriverAddMenuOpen}>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-1 px-2 py-1 text-[10px] text-primary border border-dashed border-primary/40 rounded-md hover:bg-primary/10 transition-colors">
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1" align="start">
                        <div className="max-h-48 overflow-y-auto">
                          {driverAvailableToAdd.map((d) => (
                            <button
                              key={d}
                              onClick={() => { setDriverTabDrivers((prev) => [...prev, d]); setDriverAddMenuOpen(false); }}
                              className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-secondary rounded transition-colors"
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            {/* Individual driver cards with bar chart + details */}
            <div className="space-y-3">
              {filteredDriverData.map((row) => {
                const driverMeta: Record<string, { scope: string; deltaActivity: string; deltaCO2: number }> = {
                  "Coke Rate": { scope: "Scope 1", deltaActivity: "+12 t coke", deltaCO2: 185 },
                  "PCI Rate": { scope: "Scope 1", deltaActivity: "+6 t PCI coal", deltaCO2: 125 },
                  "Scrap Ratio": { scope: "Scope 1 & 3", deltaActivity: "-8 t scrap", deltaCO2: -45 },
                  "Power Mix": { scope: "Scope 2", deltaActivity: "+8,200 kWh grid", deltaCO2: 142 },
                  "BFG Recovery": { scope: "Scope 1", deltaActivity: "+3,500 m³ recovered", deltaCO2: -78 },
                  "Sinter Ratio": { scope: "Scope 1", deltaActivity: "+5% sinter share", deltaCO2: -62 },
                  "Slag Rate": { scope: "Scope 1", deltaActivity: "+15 kg/tHM", deltaCO2: 48 },
                  "Pellet Ratio": { scope: "Scope 1 & 3", deltaActivity: "+3% pellet share", deltaCO2: -35 },
                  "COG Recovery": { scope: "Scope 1", deltaActivity: "+1,200 m³ recovered", deltaCO2: -52 },
                  "Limestone": { scope: "Scope 3", deltaActivity: "+15 t limestone", deltaCO2: 62 },
                };
                const meta = driverMeta[row.driver] || { scope: "Scope 1", deltaActivity: "—", deltaCO2: 0 };
                const chartData = [
                  ...(driverTabLocations.includes("Rourkela Works") ? [{ name: "Rourkela", value: row.Rourkela, fill: "hsl(168 70% 50%)" }] : []),
                  ...(driverTabLocations.includes("Burnpur Works") ? [{ name: "Burnpur", value: row.Burnpur, fill: "hsl(45 95% 58%)" }] : []),
                  ...(driverTabLocations.includes("Durgapur Steel") ? [{ name: "Durgapur", value: row.Durgapur, fill: "hsl(270 60% 60%)" }] : []),
                ];
                return (
                  <div key={row.driver} className="border border-border rounded-lg p-3 hover:border-primary/30 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Left: chart */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold mb-1">{row.driver}</p>
                        <ResponsiveContainer width="100%" height={chartData.length * 28 + 12}>
                          <BarChart data={chartData} layout="vertical" barGap={2}>
                            <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                            <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={14}>
                              {chartData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Right: details */}
                      <div className="shrink-0 w-44 space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px]">{meta.scope}</Badge>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Δ Activity</p>
                          <p className="text-xs font-medium">{meta.deltaActivity}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Δ tCO₂e</p>
                          <p className={`text-xs font-bold ${meta.deltaCO2 > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {meta.deltaCO2 > 0 ? "+" : ""}{meta.deltaCO2} tCO₂e/day
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* sentra.AI Recommendations */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="p-3 bg-secondary/30 border-b border-border flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs font-semibold">sentra.AI Recommendations</p>
                <Badge variant="secondary" className="text-[9px] ml-auto">
                  {driverTabDrivers.length} drivers analyzed
                </Badge>
              </div>
              <div className="divide-y divide-border/50">
                {(() => {
                  const driverRecs: { driver: string; status: "critical" | "warning" | "on-track"; recommendation: string; impact: string; current: string; target: string }[] = [
                    { driver: "Coke Rate", status: "critical", recommendation: "Reduce coke rate by optimizing burden distribution and increasing PCI to 160 kg/tHM", impact: "-520 tCO₂e/day", current: "385 kg/tHM", target: "365 kg/tHM" },
                    { driver: "PCI Rate", status: "on-track", recommendation: "Maintain PCI injection above 155 kg/tHM — consider grinding fineness upgrade for +5% combustibility", impact: "-125 tCO₂e/day", current: "142 kg/tHM", target: "160 kg/tHM" },
                    { driver: "Scrap Ratio", status: "warning", recommendation: "Increase BOF scrap ratio to 24% with pre-heating using waste gas", impact: "-280 tCO₂e/day", current: "18%", target: "24%" },
                    { driver: "Power Mix", status: "critical", recommendation: "Sign 50 MW solar PPA to raise RE share to 30%, dropping blended grid factor by 30%", impact: "-420 tCO₂e/day", current: "12%", target: "30%" },
                    { driver: "BFG Recovery", status: "warning", recommendation: "Upgrade gas holder pressure controls — 6 flaring events lost ~15,000 m³ BFG last month", impact: "-340 tCO₂e/day", current: "88%", target: "94%" },
                    { driver: "Sinter Ratio", status: "on-track", recommendation: "Sinter ratio within target range — monitor strand #3 for consistency", impact: "-60 tCO₂e/day", current: "78%", target: "82%" },
                    { driver: "Slag Rate", status: "warning", recommendation: "Reduce slag rate by improving burden chemistry — target lower alumina in iron ore", impact: "-95 tCO₂e/day", current: "320 kg/tHM", target: "298 kg/tHM" },
                    { driver: "Pellet Ratio", status: "on-track", recommendation: "Pellet ratio trending well — maintain current sourcing strategy", impact: "-40 tCO₂e/day", current: "25%", target: "30%" },
                    { driver: "COG Recovery", status: "warning", recommendation: "Route surplus COG to DRI or power gen instead of flaring during low-demand periods", impact: "-210 tCO₂e/day", current: "82%", target: "95%" },
                    { driver: "Limestone", status: "on-track", recommendation: "Limestone consumption stable — optimize sinter basicity to further reduce by 8%", impact: "-45 tCO₂e/day", current: "85 kg/tHM", target: "78 kg/tHM" },
                  ];
                  const statusCfg = {
                    critical: { label: "Critical", color: "text-red-400", bg: "bg-red-400/10", icon: <AlertTriangle className="w-3 h-3" /> },
                    warning: { label: "Attention", color: "text-amber-400", bg: "bg-amber-400/10", icon: <AlertTriangle className="w-3 h-3" /> },
                    "on-track": { label: "On Track", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle className="w-3 h-3" /> },
                  };
                  return driverRecs
                    .filter((r) => driverTabDrivers.includes(r.driver))
                    .map((rec) => {
                      const cfg = statusCfg[rec.status];
                      return (
                        <div key={rec.driver} className="p-3 flex items-center gap-3">
                          <div className={`p-1.5 rounded ${cfg.bg} ${cfg.color} shrink-0`}>{cfg.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{rec.driver}</span>
                              <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>
                                {cfg.label}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{rec.recommendation}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-mono">
                              <span className="text-muted-foreground">{rec.current}</span>
                              <span className="mx-1.5 text-muted-foreground">→</span>
                              <span className="text-emerald-400 font-semibold">{rec.target}</span>
                            </p>
                            <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5">
                              <TrendingDown className="w-3 h-3" />
                              {rec.impact}
                            </p>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RunAnalyticsModal;
