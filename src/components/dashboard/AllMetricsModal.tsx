import { useState } from "react";
import { X, ArrowUp, ArrowDown, Minus, ChevronRight } from "lucide-react";

interface MetricItem {
  title: string;
  value: string;
  unit: string;
  delta: number;
  category: string;
  shop: string;
}

interface AllMetricsModalProps {
  open: boolean;
  onClose: () => void;
  onMetricClick: (metric: { title: string; value: string; unit: string; delta: number }) => void;
}

const shops = ["All", "Coke Oven", "Sinter Plant", "Blast Furnace", "BOF / SMS", "Rolling Mill", "Power / CPP"];

const allMetrics: MetricItem[] = [
  // Coke Oven
  { title: "Coke Rate", value: "385", unit: "kg/t", delta: 2.4, category: "Fuel & Reductants", shop: "Coke Oven" },
  { title: "COG Recovery", value: "97.5", unit: "%", delta: -0.2, category: "Gas Recovery", shop: "Coke Oven" },
  { title: "Coke Moisture", value: "3.2", unit: "%", delta: 0.5, category: "Quality", shop: "Coke Oven" },
  { title: "Push Frequency", value: "6.8", unit: "pushes/hr", delta: -1.1, category: "Operations", shop: "Coke Oven" },

  // Sinter Plant
  { title: "Sinter Ratio", value: "78.4", unit: "%", delta: -0.8, category: "Fuel & Reductants", shop: "Sinter Plant" },
  { title: "Sinter Return Fines", value: "18.2", unit: "%", delta: 1.3, category: "By-products", shop: "Sinter Plant" },
  { title: "Solid Fuel Rate", value: "52", unit: "kg/t", delta: 0.9, category: "Fuel & Reductants", shop: "Sinter Plant" },
  { title: "Sinter Productivity", value: "1.42", unit: "t/m²/hr", delta: -0.6, category: "Operations", shop: "Sinter Plant" },

  // Blast Furnace
  { title: "Coal Injection Rate", value: "142", unit: "kg/t", delta: 1.2, category: "Fuel & Reductants", shop: "Blast Furnace" },
  { title: "Pellet Ratio", value: "21.6", unit: "%", delta: 0.8, category: "Fuel & Reductants", shop: "Blast Furnace" },
  { title: "BFG Recovery", value: "94.2", unit: "%", delta: -0.3, category: "Gas Recovery", shop: "Blast Furnace" },
  { title: "Slag Rate", value: "310", unit: "kg/t", delta: 0.9, category: "By-products", shop: "Blast Furnace" },
  { title: "Hot Metal Temp", value: "1502", unit: "°C", delta: 0.2, category: "Operations", shop: "Blast Furnace" },
  { title: "Oxygen Consumption", value: "52", unit: "Nm³/t", delta: 1.3, category: "Utilities", shop: "Blast Furnace" },

  // BOF / SMS
  { title: "Scrap Rate", value: "12.3", unit: "%", delta: -1.5, category: "Fuel & Reductants", shop: "BOF / SMS" },
  { title: "BOF Gas Recovery", value: "89.1", unit: "%", delta: 1.1, category: "Gas Recovery", shop: "BOF / SMS" },
  { title: "Tap-to-Tap Time", value: "42", unit: "min", delta: -2.3, category: "Operations", shop: "BOF / SMS" },
  { title: "Lime Consumption", value: "48", unit: "kg/t", delta: 0.7, category: "Utilities", shop: "BOF / SMS" },

  // Rolling Mill
  { title: "Specific Power Consumption", value: "485", unit: "kWh/t", delta: 1.7, category: "Energy", shop: "Rolling Mill" },
  { title: "Renewable Elec.", value: "18.5", unit: "%", delta: -3.1, category: "Energy", shop: "Rolling Mill" },
  { title: "Yield", value: "96.8", unit: "%", delta: -0.4, category: "Operations", shop: "Rolling Mill" },
  { title: "Reheating Furnace Efficiency", value: "72.5", unit: "%", delta: -1.0, category: "Energy", shop: "Rolling Mill" },

  // Power / CPP
  { title: "Steam Consumption", value: "0.82", unit: "GJ/t", delta: -2.1, category: "Energy", shop: "Power / CPP" },
  { title: "Waste Heat Recovery", value: "34.2", unit: "%", delta: -1.4, category: "Energy", shop: "Power / CPP" },
  { title: "Dust Emission Rate", value: "0.42", unit: "kg/t", delta: -5.2, category: "By-products", shop: "Power / CPP" },
  { title: "Water Consumption", value: "3.8", unit: "m³/t", delta: 0.5, category: "Utilities", shop: "Power / CPP" },
];

const AllMetricsModal = ({ open, onClose, onMetricClick }: AllMetricsModalProps) => {
  const [activeShop, setActiveShop] = useState("All");

  if (!open) return null;

  const filtered = activeShop === "All" ? allMetrics : allMetrics.filter(m => m.shop === activeShop);
  const categories = [...new Set(filtered.map(m => m.category))];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">All Metrics</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Shop toggles */}
        <div className="flex flex-wrap gap-1 mb-5">
          {shops.map((shop) => (
            <button
              key={shop}
              onClick={() => setActiveShop(shop)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                activeShop === shop
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {shop}
            </button>
          ))}
        </div>

        {categories.map((cat) => (
          <div key={cat} className="mb-5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
            <div className="space-y-1">
              {filtered.filter(m => m.category === cat).map((m) => {
                const isPositive = m.delta > 0;
                const isNeutral = m.delta === 0;
                return (
                  <button
                    key={m.title}
                    onClick={() => onMetricClick({ title: m.title, value: m.value, unit: m.unit, delta: m.delta })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border hover:border-primary/30 transition-all group"
                  >
                    <span className="text-xs font-medium text-foreground flex-1 text-left">{m.title}</span>
                    {activeShop === "All" && (
                      <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded">{m.shop}</span>
                    )}
                    <span className="text-sm font-bold text-foreground font-mono">{m.value}</span>
                    <span className="text-[10px] text-muted-foreground w-12">{m.unit}</span>
                    <div className="flex items-center gap-1 w-20 justify-end">
                      {isNeutral ? (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      ) : isPositive ? (
                        <ArrowUp className="w-3 h-3 text-chart-negative" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-chart-positive" />
                      )}
                      <span className={`text-xs font-mono ${isNeutral ? "text-muted-foreground" : isPositive ? "text-chart-negative" : "text-chart-positive"}`}>
                        {isPositive ? "+" : ""}{m.delta}%
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMetricsModal;
