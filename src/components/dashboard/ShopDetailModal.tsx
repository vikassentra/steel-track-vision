import { useState, useMemo } from "react";
import { X, AlertTriangle, Sparkles, TrendingDown, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { driverDetails } from "@/data/mockData";
import DriverDetailModal from "./DriverDetailModal";

interface ShopDetailModalProps {
  shop: string | null;
  onClose: () => void;
}

// Map bar chart shop labels to driver shop names
const shopLabelToDriverShop: Record<string, string[]> = {
  "Blast Furnace": ["Blast Furnace", "BF"],
  "Coke Oven": ["Coke Oven", "COP"],
  "Sinter Plant": ["Sinter Plant", "SP"],
  "BOF / SMS": ["BOF / SMS", "BOF"],
  "Rolling Mill": ["Rolling Mill", "RM"],
  "Power / CPP": ["Power / CPP"],
};

// Generate expanded driver data for a shop (mix real + synthetic for 10 items)
const getShopDrivers = (shop: string) => {
  const matchNames = shopLabelToDriverShop[shop] || [shop];
  const real = driverDetails.filter((d) => matchNames.includes(d.shop) || d.shop === "All");

  const syntheticDrivers = [
    { driver: "Coal (PCI)", scope: "Scope 1", valueChange: "+6 t", emissionsChange: 125, anomaly: "Supplier change" },
    { driver: "Coke", scope: "Scope 1", valueChange: "+12 t", emissionsChange: 185, anomaly: "High consumption" },
    { driver: "Natural Gas", scope: "Scope 1", valueChange: "+2,100 m³", emissionsChange: 98 },
    { driver: "Electricity (Grid)", scope: "Scope 2", valueChange: "+8,200 kWh", emissionsChange: 142 },
    { driver: "BFG Recovery", scope: "Scope 1", valueChange: "+3,500 m³", emissionsChange: -78 },
    { driver: "Limestone", scope: "Scope 3", valueChange: "+15 t", emissionsChange: 62 },
    { driver: "Iron Ore", scope: "Scope 3", valueChange: "+22 t", emissionsChange: 88 },
    { driver: "Steam", scope: "Scope 2", valueChange: "+4.2 GJ", emissionsChange: 45 },
    { driver: "Diesel", scope: "Scope 1", valueChange: "+320 L", emissionsChange: 34 },
    { driver: "Scrap", scope: "Scope 3", valueChange: "-8 t", emissionsChange: -45 },
    { driver: "O₂ Enrichment", scope: "Scope 2", valueChange: "+1,200 Nm³", emissionsChange: 28 },
    { driver: "Dolomite", scope: "Scope 3", valueChange: "+5 t", emissionsChange: 22 },
  ].map((d) => ({ ...d, shop }));

  // Merge real drivers first, then fill with synthetic to get 10
  const existing = new Set(real.map((r) => r.driver));
  const extras = syntheticDrivers.filter((s) => !existing.has(s.driver));
  const combined = [...real, ...extras].slice(0, 10);

  return combined.sort((a, b) => Math.abs(b.emissionsChange) - Math.abs(a.emissionsChange));
};

// Build stacked bar chart data from drivers
const buildDriverChartData = (drivers: ReturnType<typeof getShopDrivers>) => {
  return drivers.map((d) => {
    const abs = Math.abs(d.emissionsChange);
    const isS1 = d.scope === "Scope 1";
    const isS2 = d.scope === "Scope 2";
    const isS3 = d.scope === "Scope 3";
    return {
      driver: d.driver,
      scope1: isS1 ? abs : d.scope === "—" ? abs * 0.6 : 0,
      scope2: isS2 ? abs : d.scope === "—" ? abs * 0.2 : 0,
      scope3: isS3 ? abs : d.scope === "—" ? abs * 0.2 : 0,
      total: abs,
      direction: d.emissionsChange >= 0 ? "increase" : "decrease",
      anomaly: d.anomaly,
    };
  });
};

const getAIRecommendation = (driver: string): string => {
  const recs: Record<string, string> = {
    "Coal (PCI)": "Ensure consistent coal grind size (<75μm) for better combustion. Increase injection lance pressure for 5-8% improvement in carbon efficiency.",
    "Coke": "Increase PCI injection by 10-15 kg/tHM to displace coke. Optimize burden distribution to improve gas utilization. Target: reduce coke rate by 20 kg/tHM.",
    "Natural Gas": "Implement waste heat recovery from flue gases. Preheat combustion air to reduce NG consumption by 10-15%.",
    "Electricity (Grid)": "Shift 15% of load to off-peak renewable hours. Install VFDs on major motors for 8-12% energy savings.",
    "BFG Recovery": "Install top gas recovery turbine (TRT). Optimize gas cleaning to improve calorific value recovery by 8-12%.",
    "Limestone": "Optimize sinter basicity (1.8-2.0) to reduce limestone usage. Investigate alternative flux materials for lower EF.",
    "Iron Ore": "Switch to high-grade pellets (Fe>65%) to reduce slag volume and specific consumption. Improve blending consistency.",
    "Steam": "Recover low-grade waste heat for steam generation. Insulate steam distribution lines to reduce losses by 5-8%.",
    "Diesel": "Replace diesel-powered vehicles with electric alternatives. Optimize logistics routes to reduce fuel consumption by 10%.",
    "Scrap": "Increase scrap ratio by 2-3% using pre-heated scrap. Each 1% increase reduces CO₂ by ~15 kg/t-steel.",
    "Production": "Optimize production scheduling to minimize start-stop cycles. Each unplanned shutdown adds ~200 tCO₂e in restart emissions.",
  };
  return recs[driver] || `Optimize ${driver} through real-time monitoring and process parameter tuning. Benchmark against best-in-class for 5-10% improvement potential.`;
};

const DriverTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.driver}</p>
      <p><span style={{ color: "hsl(168 70% 50%)" }}>Scope 1:</span> {Math.round(d.scope1).toLocaleString()} tCO₂e</p>
      <p><span style={{ color: "hsl(45 95% 58%)" }}>Scope 2:</span> {Math.round(d.scope2).toLocaleString()} tCO₂e</p>
      <p><span style={{ color: "hsl(270 60% 60%)" }}>Scope 3:</span> {Math.round(d.scope3).toLocaleString()} tCO₂e</p>
      <p className="font-medium mt-1">Total: {d.total.toLocaleString()} tCO₂e</p>
    </div>
  );
};

const ShopDetailModal = ({ shop, onClose }: ShopDetailModalProps) => {
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const drivers = useMemo(() => (shop ? getShopDrivers(shop) : []), [shop]);
  const chartData = useMemo(() => buildDriverChartData(drivers), [drivers]);

  if (!shop) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-background/70" onClick={onClose} />
        <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">{shop} — Top Drivers</h3>
              <p className="text-xs text-muted-foreground">Top 10 emission drivers by plant · click a row for details</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Single bar chart with all drivers + details columns */}
          <div className="flex gap-4 mb-6">
            {/* Left: stacked bar chart */}
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={drivers.length * 32 + 40}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  barCategoryGap="16%"
                  onClick={(e: any) => e?.activeLabel && setSelectedDriver(e.activeLabel)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="driver" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={100} />
                  <Tooltip content={<DriverTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} formatter={(value: string) => {
                    const labels: Record<string, string> = { scope1: "Scope 1", scope2: "Scope 2", scope3: "Scope 3" };
                    return labels[value] || value;
                  }} />
                  <Bar dataKey="scope1" stackId="a" fill="hsl(168 70% 50%)" name="scope1" />
                  <Bar dataKey="scope2" stackId="a" fill="hsl(45 95% 58%)" name="scope2" />
                  <Bar dataKey="scope3" stackId="a" fill="hsl(270 60% 60%)" name="scope3" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Right: Δ Activity and Δ tCO₂e columns */}
            <div className="shrink-0 w-52">
              <div className="grid grid-cols-2 gap-x-3 mb-2 pt-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Δ Activity</p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">Δ tCO₂e</p>
              </div>
              <div className="space-y-0">
                {drivers.map((row) => (
                  <div
                    key={row.driver}
                    onClick={() => setSelectedDriver(row.driver)}
                    className="grid grid-cols-2 gap-x-3 cursor-pointer hover:bg-secondary/30 rounded px-1 transition-colors items-center"
                    style={{ height: "32px" }}
                  >
                    <p className="text-[11px] font-mono text-foreground text-right">{row.valueChange}</p>
                    <p className={`text-[11px] font-mono font-semibold text-right ${row.emissionsChange > 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {row.emissionsChange > 0 ? "+" : ""}{row.emissionsChange}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* sentra.AI Recommendations */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="p-3 bg-secondary/30 border-b border-border flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold">sentra.AI Recommendations</p>
              <Badge variant="secondary" className="text-[9px] ml-auto">
                {drivers.length} drivers analyzed
              </Badge>
            </div>
            <div className="divide-y divide-border/50">
              {drivers.map((row) => {
                const rec = getAIRecommendation(row.driver);
                const status: "critical" | "warning" | "on-track" = 
                  row.emissionsChange > 100 ? "critical" : 
                  row.emissionsChange > 0 ? "warning" : "on-track";
                const statusCfg = {
                  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-400/10", icon: <AlertTriangle className="w-3 h-3" /> },
                  warning: { label: "Attention", color: "text-amber-400", bg: "bg-amber-400/10", icon: <AlertTriangle className="w-3 h-3" /> },
                  "on-track": { label: "On Track", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle className="w-3 h-3" /> },
                };
                const cfg = statusCfg[status];
                return (
                  <div
                    key={row.driver}
                    className="p-3 flex items-center gap-3 hover:bg-secondary/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedDriver(row.driver)}
                  >
                    <div className={`p-1.5 rounded ${cfg.bg} ${cfg.color} shrink-0`}>{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{row.driver}</span>
                        <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">{row.scope}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{rec}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-mono font-bold ${row.emissionsChange > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {row.emissionsChange > 0 ? "+" : ""}{row.emissionsChange} tCO₂e
                      </p>
                      {row.emissionsChange < 0 && (
                        <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-0.5 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          saving
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Detail Modal */}
      <DriverDetailModal
        driver={selectedDriver}
        shop={shop}
        onClose={() => setSelectedDriver(null)}
      />
    </>
  );
};

export default ShopDetailModal;
