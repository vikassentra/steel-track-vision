import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Zap, Flame, Recycle, Wind } from "lucide-react";

interface SentraAIModalProps {
  open: boolean;
  onClose: () => void;
}

interface Recommendation {
  id: string;
  parameter: string;
  current: string;
  target: string;
  status: "critical" | "warning" | "on-track";
  impact: string;
  impactValue: number;
  recommendation: string;
  details: string;
  icon: React.ReactNode;
  shop: string;
  scope: string;
}

const recommendations: Recommendation[] = [
  {
    id: "1", parameter: "Coke Rate", current: "385 kg/tHM", target: "365 kg/tHM",
    status: "critical", impact: "-520 tCO₂e/day", impactValue: 520,
    recommendation: "Reduce coke rate by optimizing burden distribution and increasing PCI injection to 160 kg/tHM",
    details: "Current coke rate is 5.5% above target. Root cause: inconsistent coke quality from Battery #3 (CSR dropped to 62%). Immediate action: switch to Battery #1/#2 blend. Medium-term: upgrade stamp charging on Battery #3.",
    icon: <Flame className="w-4 h-4" />, shop: "Blast Furnace", scope: "Scope 1"
  },
  {
    id: "2", parameter: "BFG Recovery", current: "88%", target: "94%",
    status: "warning", impact: "-340 tCO₂e/day", impactValue: 340,
    recommendation: "Improve BFG recovery by upgrading gas holder pressure controls and reducing flaring events",
    details: "6 flaring events in the last 30 days, each losing ~2,500 m³ of BFG. Install automated pressure relief valves and upgrade SCADA set-points. Expected payback: 4 months.",
    icon: <Wind className="w-4 h-4" />, shop: "Power / CPP", scope: "Scope 1"
  },
  {
    id: "3", parameter: "Scrap Ratio (BOF)", current: "18%", target: "24%",
    status: "warning", impact: "-280 tCO₂e/day", impactValue: 280,
    recommendation: "Increase scrap ratio in BOF charge to 24% by improving scrap yard logistics and pre-heating",
    details: "Current scrap pre-heat temperature: ambient. Installing a scrap pre-heater using waste gas can raise charge scrap to 24% without impacting tap-to-tap time. Capital: ₹12Cr, payback: 18 months.",
    icon: <Recycle className="w-4 h-4" />, shop: "BOF / SMS", scope: "Scope 1"
  },
  {
    id: "4", parameter: "Power Mix (Renewable)", current: "12%", target: "30%",
    status: "critical", impact: "-420 tCO₂e/day", impactValue: 420,
    recommendation: "Sign renewable PPA for 50 MW solar to reach 30% RE share in purchased electricity",
    details: "Current grid emission factor: 0.82 tCO₂e/MWh. With 30% RE (0.0 factor), blended factor drops to 0.57. Evaluate 25-year PPA with Adani Green or ReNew at ₹3.2/kWh — 15% below current grid tariff.",
    icon: <Zap className="w-4 h-4" />, shop: "Rolling Mill", scope: "Scope 2"
  },
  {
    id: "5", parameter: "Sinter Basicity", current: "1.95", target: "1.85",
    status: "on-track", impact: "-180 tCO₂e/day", impactValue: 180,
    recommendation: "Optimize sinter basicity to 1.85 to reduce limestone consumption by 8%",
    details: "Higher basicity increases CaO demand and calcination CO₂. Trials at 1.85 showed stable BF operation with improved reducibility. Roll out across all strands by Q2.",
    icon: <Flame className="w-4 h-4" />, shop: "Sinter Plant", scope: "Scope 1"
  },
  {
    id: "6", parameter: "COG Utilization", current: "82%", target: "95%",
    status: "warning", impact: "-210 tCO₂e/day", impactValue: 210,
    recommendation: "Maximize COG utilization by routing surplus to DRI or power generation instead of flaring",
    details: "13% of COG currently flared during low-demand periods. Install a 5 MW gas engine set for surplus COG. Additionally, evaluate COG injection into BF tuyeres (3-5% fuel replacement).",
    icon: <Wind className="w-4 h-4" />, shop: "Coke Oven", scope: "Scope 1"
  },
  {
    id: "7", parameter: "Specific Energy", current: "22.8 GJ/tcs", target: "20.5 GJ/tcs",
    status: "critical", impact: "-480 tCO₂e/day", impactValue: 480,
    recommendation: "Reduce specific energy consumption through waste heat recovery and process integration",
    details: "Major losses: BF stove flue gas (180°C, recoverable 15 MW), sinter cooler exhaust (12 MW), and BOF gas sensible heat (8 MW). Prioritize BF stove WHR — highest ROI at 22% IRR.",
    icon: <Zap className="w-4 h-4" />, shop: "All Shops", scope: "Scope 1 & 2"
  },
  {
    id: "8", parameter: "Coal Grind Size", current: "82% <75μm", target: "90% <75μm",
    status: "on-track", impact: "-95 tCO₂e/day", impactValue: 95,
    recommendation: "Improve PCI coal grind fineness to 90% passing 75μm for better combustibility",
    details: "Finer grind improves raceway combustion efficiency from 78% to 86%, allowing higher PCI rates. Requires classifier upgrade on Mill #2 (₹1.5Cr, 6-week shutdown).",
    icon: <Flame className="w-4 h-4" />, shop: "Blast Furnace", scope: "Scope 1"
  },
];

const statusConfig = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-400/10", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  warning: { label: "Attention", color: "text-amber-400", bg: "bg-amber-400/10", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  "on-track": { label: "On Track", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const SentraAIModal = ({ open, onClose }: SentraAIModalProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = filterStatus === "all" ? recommendations : recommendations.filter((r) => r.status === filterStatus);
  const totalImpact = recommendations.reduce((sum, r) => sum + r.impactValue, 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            sentra.AI Recommendations
          </DialogTitle>
          <p className="text-xs text-muted-foreground">AI-powered operational insights to reduce emissions across your plant</p>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Total Potential Savings</p>
            <p className="text-lg font-bold text-emerald-400">{totalImpact.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">tCO₂e/day</p>
          </div>
          <div className="bg-red-400/5 rounded-lg p-3 text-center border border-red-400/20">
            <p className="text-[10px] text-muted-foreground">Critical</p>
            <p className="text-lg font-bold text-red-400">{recommendations.filter((r) => r.status === "critical").length}</p>
            <p className="text-[10px] text-muted-foreground">parameters</p>
          </div>
          <div className="bg-amber-400/5 rounded-lg p-3 text-center border border-amber-400/20">
            <p className="text-[10px] text-muted-foreground">Attention</p>
            <p className="text-lg font-bold text-amber-400">{recommendations.filter((r) => r.status === "warning").length}</p>
            <p className="text-[10px] text-muted-foreground">parameters</p>
          </div>
          <div className="bg-emerald-400/5 rounded-lg p-3 text-center border border-emerald-400/20">
            <p className="text-[10px] text-muted-foreground">On Track</p>
            <p className="text-lg font-bold text-emerald-400">{recommendations.filter((r) => r.status === "on-track").length}</p>
            <p className="text-[10px] text-muted-foreground">parameters</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-1.5">
          {["all", "critical", "warning", "on-track"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s === "on-track" ? "On Track" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-2">
          {filtered.map((rec) => {
            const cfg = statusConfig[rec.status];
            const isExpanded = expanded === rec.id;
            return (
              <div
                key={rec.id}
                className="border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : rec.id)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  <div className={`p-1.5 rounded ${cfg.bg} ${cfg.color}`}>{rec.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{rec.parameter}</span>
                      <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>
                        {cfg.icon}
                        <span className="ml-1">{cfg.label}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-[9px]">{rec.shop}</Badge>
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
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-border/50">
                    <div className="mt-2 bg-secondary/30 rounded-lg p-3">
                      <p className="text-[10px] font-medium text-primary mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        sentra.AI Deep Analysis
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.details}</p>
                    </div>
                    <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
                      <span>Scope: <span className="text-foreground">{rec.scope}</span></span>
                      <span>Shop: <span className="text-foreground">{rec.shop}</span></span>
                      <span>Potential: <span className="text-emerald-400 font-semibold">{rec.impact}</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SentraAIModal;
