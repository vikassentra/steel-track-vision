import { useState, useMemo } from "react";
import { X, AlertCircle, CheckCircle, MessageSquare, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

interface ShopDetailModalProps {
  shop: string | null;
  onClose: () => void;
}

const LOWER_LIMIT = 4;
const UPPER_LIMIT = 8;

// Mock KPI data per shop
const generateShopKPIs = (shop: string) => {
  const kpiTemplates: Record<string, { name: string; unit: string; ef: string; efSource: string }[]> = {
    BF: [
      { name: "Coke Rate", unit: "kg/tHM", ef: "3.12", efSource: "IPCC 2019" },
      { name: "PCI Rate", unit: "kg/tHM", ef: "2.86", efSource: "IPCC 2019" },
      { name: "Sinter Consumption", unit: "t/tHM", ef: "0.42", efSource: "IPCC 2019" },
      { name: "Pellet Ratio", unit: "%", ef: "0.15", efSource: "IPCC 2021" },
      { name: "BF Gas Recovery", unit: "Nm³/tHM", ef: "1.24", efSource: "GHG Protocol" },
      { name: "Hot Blast Temp", unit: "°C", ef: "0.08", efSource: "Internal" },
      { name: "Slag Rate", unit: "kg/tHM", ef: "0.32", efSource: "IPCC 2019" },
      { name: "O2 Enrichment", unit: "%", ef: "0.11", efSource: "Internal" },
      { name: "Productivity", unit: "t/m³/day", ef: "0.05", efSource: "GHG Protocol" },
      { name: "Fuel Oil Rate", unit: "kg/tHM", ef: "2.94", efSource: "IPCC 2019" },
    ],
    BOF: [
      { name: "Scrap Rate", unit: "%", ef: "0.42", efSource: "IPCC 2019" },
      { name: "O2 Consumption", unit: "Nm³/t", ef: "0.38", efSource: "GHG Protocol" },
      { name: "Lime Consumption", unit: "kg/t", ef: "0.78", efSource: "IPCC 2019" },
      { name: "Hot Metal Ratio", unit: "%", ef: "2.10", efSource: "IPCC 2019" },
      { name: "Blow Duration", unit: "min", ef: "0.06", efSource: "Internal" },
      { name: "Gas Recovery", unit: "Nm³/t", ef: "1.05", efSource: "GHG Protocol" },
      { name: "Ferro Alloy", unit: "kg/t", ef: "1.82", efSource: "IPCC 2021" },
      { name: "Dolomite Rate", unit: "kg/t", ef: "0.44", efSource: "IPCC 2019" },
      { name: "Tap Temperature", unit: "°C", ef: "0.03", efSource: "Internal" },
      { name: "Yield", unit: "%", ef: "0.02", efSource: "GHG Protocol" },
    ],
    default: [
      { name: "Electricity", unit: "kWh/t", ef: "0.82", efSource: "Grid EF 2025" },
      { name: "Natural Gas", unit: "Nm³/t", ef: "2.02", efSource: "IPCC 2019" },
      { name: "Steam Usage", unit: "GJ/t", ef: "0.56", efSource: "GHG Protocol" },
      { name: "Process Water", unit: "m³/t", ef: "0.04", efSource: "Internal" },
      { name: "Raw Material A", unit: "t/t", ef: "1.24", efSource: "IPCC 2019" },
      { name: "Raw Material B", unit: "t/t", ef: "0.88", efSource: "IPCC 2021" },
      { name: "Fuel Oil", unit: "kg/t", ef: "2.94", efSource: "IPCC 2019" },
      { name: "Compressed Air", unit: "Nm³/t", ef: "0.12", efSource: "Internal" },
      { name: "Diesel Usage", unit: "L/t", ef: "2.68", efSource: "IPCC 2019" },
      { name: "Waste Heat", unit: "GJ/t", ef: "0.35", efSource: "GHG Protocol" },
    ],
  };

  const kpis = kpiTemplates[shop] || kpiTemplates["default"];

  return kpis.map((kpi) => {
    const spCons = +(Math.random() * 0.5 + 0.1).toFixed(2);
    const todayCons = +(Math.random() * 20 + 5).toFixed(1);
    const change = +(Math.random() * 6 - 3).toFixed(1);

    const trend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2026, 1, i + 1);
      const day = date.toLocaleDateString("en", { month: "short", day: "numeric" });
      return { date: day, share: +(Math.random() * 8 + 2).toFixed(1) };
    });

    return {
      ...kpi,
      spCons: `${spCons} t/t-steel`,
      todayCons: `${todayCons} t`,
      change: `${change > 0 ? "+" : ""}${change}%`,
      trend,
      breachedDays: trend.filter((d) => d.share < LOWER_LIMIT || d.share > UPPER_LIMIT),
      historicalData: [
        { period: "FY 24", cons: `${(todayCons * 0.92).toFixed(1)} t`, spCons: `${(spCons * 0.93).toFixed(2)} t/t` },
        { period: "FY 25", cons: `${(todayCons * 0.96).toFixed(1)} t`, spCons: `${(spCons * 0.97).toFixed(2)} t/t` },
        { period: "FY 26 A", cons: `${todayCons} t`, spCons: `${spCons} t/t` },
        { period: "FY 26 B", cons: `${(todayCons * 0.94).toFixed(1)} t`, spCons: `${(spCons * 0.95).toFixed(2)} t/t` },
        { period: "Prev Mo", cons: `${(todayCons * 1.02).toFixed(1)} t`, spCons: `${(spCons * 1.02).toFixed(2)} t/t` },
        { period: "Best in Class", cons: `${(todayCons * 0.78).toFixed(1)} t`, spCons: `${(spCons * 0.8).toFixed(2)} t/t` },
      ],
    };
  });
};

// AI recommendations per KPI
const getAIRecommendation = (kpiName: string): string => {
  const recommendations: Record<string, string> = {
    "Coke Rate": "Increase PCI injection by 10-15 kg/tHM to displace coke. Optimize burden distribution to improve gas utilization. Target: reduce coke rate by 20 kg/tHM within 3 months.",
    "PCI Rate": "Ensure consistent coal grind size (<75μm) for better combustion. Increase injection lance pressure. Potential 5-8% improvement in carbon efficiency.",
    "Sinter Consumption": "Optimize sinter basicity to 1.8-2.0 to improve reducibility. Reduce return fines by improving strand speed control.",
    "Pellet Ratio": "Increase pellet share to 25-30% to reduce slag volume and improve productivity. Switch to high-grade pellets (Fe>65%).",
    "BF Gas Recovery": "Install top gas recovery turbine (TRT) if not present. Optimize gas cleaning to improve calorific value recovery by 8-12%.",
    "Hot Blast Temp": "Upgrade stove dome temperature to achieve HBT >1200°C. Each 100°C increase reduces coke rate by ~15 kg/tHM.",
    "Scrap Rate": "Increase scrap ratio by 2-3% using pre-heated scrap. Each 1% increase reduces CO₂ by ~15 kg/t-steel.",
    "O2 Consumption": "Optimize lance height and blowing pattern to reduce over-oxidation. Target O₂ efficiency >92%.",
    "Electricity": "Shift 15% of load to off-peak renewable hours. Install VFDs on major motors for 8-12% energy savings.",
    "Natural Gas": "Implement waste heat recovery from flue gases. Preheat combustion air to reduce NG consumption by 10-15%.",
  };
  return recommendations[kpiName] || `Optimize ${kpiName} consumption through process parameter tuning and real-time monitoring. Consider benchmarking against best-in-class values and implementing automated control systems for 5-10% improvement potential.`;
};

interface KPICardProps {
  kpi: ReturnType<typeof generateShopKPIs>[0];
  shop: string;
}

const KPICard = ({ kpi, shop }: KPICardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [trendMode, setTrendMode] = useState<"cons" | "spCons">("cons");
  const [commentingDay, setCommentingDay] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentDraft, setCommentDraft] = useState("");

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{kpi.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{kpi.spCons}</span>
          <span className={`text-xs font-mono ${kpi.change.startsWith("+") ? "text-chart-negative" : "text-chart-positive"}`}>
            {kpi.change}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {kpi.breachedDays.length > 0 && (
            <span className="text-[10px] text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {kpi.breachedDays.length} breaches
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-4 animate-fade-in">
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-secondary rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground">Specific Consumption</p>
              <p className="text-sm font-semibold text-foreground font-mono">{kpi.spCons}</p>
              <p className={`text-[10px] font-mono mt-0.5 ${kpi.change.startsWith("+") ? "text-chart-negative" : "text-chart-positive"}`}>
                {kpi.change} vs prev day
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground">Today's Consumption</p>
              <p className="text-sm font-semibold text-foreground font-mono">{kpi.todayCons}</p>
            </div>
            <div className="bg-secondary rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground">EF ({kpi.unit})</p>
              <p className="text-sm font-semibold text-foreground font-mono">{kpi.ef}</p>
              <p className="text-[9px] text-muted-foreground mt-1">Source: {kpi.efSource}</p>
            </div>
          </div>

          {/* Trend + Breach side by side */}
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Last 30 days trend</p>
                <div className="flex items-center bg-secondary rounded-md p-0.5">
                  <button
                    onClick={() => setTrendMode("cons")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      trendMode === "cons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Cons./Prod.
                  </button>
                  <button
                    onClick={() => setTrendMode("spCons")}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      trendMode === "spCons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sp. Cons
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={kpi.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: "hsl(215 15% 55%)" }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: "hsl(220 18% 15%)", border: "1px solid hsl(220 15% 22%)", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => {
                      const breached = value < LOWER_LIMIT || value > UPPER_LIMIT;
                      return [`${value}%${breached ? " ⚠ Outside limits" : ""}`, "Share"];
                    }}
                  />
                  <ReferenceLine y={UPPER_LIMIT} stroke="hsl(0 70% 55%)" strokeDasharray="6 3" label={{ value: "Upper", position: "right", fontSize: 9, fill: "hsl(0 70% 55%)" }} />
                  <ReferenceLine y={LOWER_LIMIT} stroke="hsl(35 90% 55%)" strokeDasharray="6 3" label={{ value: "Lower", position: "right", fontSize: 9, fill: "hsl(35 90% 55%)" }} />
                  <Bar dataKey="share" radius={[2, 2, 0, 0]}>
                    {kpi.trend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.share < LOWER_LIMIT || entry.share > UPPER_LIMIT ? "hsl(0 70% 55%)" : "hsl(168 70% 50%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {kpi.breachedDays.length > 0 && (
              <div className="w-[220px] shrink-0 flex flex-col">
                <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mb-2">
                  <AlertCircle className="w-3 h-3" />
                  {kpi.breachedDays.length} day(s) outside limits
                </p>
                <div className="space-y-1.5 overflow-y-auto max-h-[170px] pr-1">
                  {kpi.breachedDays.map((d) => (
                    <div key={d.date} className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-md px-2 py-1.5">
                      <span className="text-[10px] font-mono text-destructive font-medium min-w-[50px]">{d.date}</span>
                      <span className="text-[10px] font-mono text-destructive">{d.share}%</span>
                      {comments[d.date] ? (
                        <span className="text-[10px] text-muted-foreground flex-1 truncate ml-1">💬 {comments[d.date]}</span>
                      ) : commentingDay === d.date ? (
                        <div className="flex items-center gap-1 flex-1 ml-1">
                          <input
                            autoFocus
                            value={commentDraft}
                            onChange={(e) => setCommentDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && commentDraft.trim()) {
                                setComments((prev) => ({ ...prev, [d.date]: commentDraft.trim() }));
                                setCommentDraft("");
                                setCommentingDay(null);
                              }
                              if (e.key === "Escape") { setCommentingDay(null); setCommentDraft(""); }
                            }}
                            placeholder="Reason..."
                            className="flex-1 bg-background border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCommentingDay(d.date); setCommentDraft(""); }}
                          className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Historical Comparison */}
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Your Value & Peer Benchmark</p>
            <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-x-3 gap-y-1 items-center text-center">
              <div />
              {kpi.historicalData.map((h) => (
                <p key={h.period} className="text-[9px] text-muted-foreground font-medium">{h.period}</p>
              ))}
              <p className="text-[9px] text-muted-foreground text-left">Cons.</p>
              {kpi.historicalData.map((h) => (
                <p key={h.period + "-c"} className="text-[10px] font-semibold text-foreground font-mono">{h.cons}</p>
              ))}
              <p className="text-[9px] text-muted-foreground text-left">Sp. Cons</p>
              {kpi.historicalData.map((h) => (
                <p key={h.period + "-s"} className="text-[10px] font-semibold text-foreground font-mono">{h.spCons}</p>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-medium text-primary flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              sentra.AI Recommendation
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{getAIRecommendation(kpi.name)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopDetailModal = ({ shop, onClose }: ShopDetailModalProps) => {
  const kpis = useMemo(() => (shop ? generateShopKPIs(shop) : []), [shop]);

  if (!shop) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Shop Detail: {shop}</h3>
            <p className="text-xs text-muted-foreground">Top 10 KPIs affecting emissions</p>
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

        <div className="space-y-2">
          {kpis.map((kpi) => (
            <KPICard key={kpi.name} kpi={kpi} shop={shop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDetailModal;
