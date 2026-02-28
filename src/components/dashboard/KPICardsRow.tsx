import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { UnitMode } from "@/pages/Index";

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  delta: number;
  deltaLabel: string;
  scopeColor?: string;
  onClick?: () => void;
}

const KPICard = ({ title, value, unit, delta, deltaLabel, scopeColor, onClick, scopeBreakdown }: KPICardProps & {scopeBreakdown?: {label: string;value: string;unit: string;}[];}) => {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-all cursor-pointer group ${scopeBreakdown ? "col-span-2" : ""}`}>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
            {scopeColor &&
            <div className={`w-2 h-2 rounded-full ${scopeColor}`} />
            }
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors font-mono">
              {value}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {isNeutral ?
            <Minus className="w-3 h-3 text-muted-foreground" /> :
            isPositive ?
            <ArrowUp className="w-3 h-3 text-chart-negative" /> :

            <ArrowDown className="w-3 h-3 text-chart-positive" />
            }
            <span
              className={`text-xs font-medium ${
              isNeutral ?
              "text-muted-foreground" :
              isPositive ?
              "text-chart-negative" :
              "text-chart-positive"}`
              }>

              {isPositive ? "+" : ""}{delta}%
            </span>
            <span className="text-xs text-muted-foreground">{deltaLabel}</span>
          </div>
        </div>
        {scopeBreakdown &&
        <div className="border-l border-border pl-4 flex flex-col justify-center gap-1">
            {scopeBreakdown.map((s) =>
          <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground w-[70px]">{s.label}:</span>
                <span className="text-xs font-bold text-foreground font-mono">{s.value}</span>
                <span className="text-[10px] text-muted-foreground">{s.unit}</span>
              </div>
          )}
          </div>
        }
      </div>
    </div>);

};

interface KPICardsRowProps {
  onKPIClick: () => void;
  unitMode: UnitMode;
  frequency: "Monthly" | "Daily";
  onMetricClick?: (metric: {title: string;value: string;unit: string;delta: number;}) => void;
  onSeeAllMetrics?: () => void;
}

const absUnit = (mode: UnitMode) => mode === "energy" ? "TJ" : "tCO2e";
const intUnit = (mode: UnitMode) => mode === "energy" ? "TJ/t" : "tCO2e/t";

const KPICardsRow = ({ onKPIClick, unitMode, frequency, onMetricClick, onSeeAllMetrics }: KPICardsRowProps) => {
  const iU = intUnit(unitMode);
  const dl = frequency === "Daily" ? "vs prev day" : "vs prev month";

  const intensityScopeBreakdown = [
  { label: "S1", value: "1.77", unit: iU },
  { label: "S2", value: "0.63", unit: iU },
  { label: "S3", value: "0.46", unit: iU },
  { label: "S3+Mining", value: "0.22", unit: iU }];


  const mainCards: (KPICardProps & {scopeBreakdown?: {label: string;value: string;unit: string;}[];})[] = [
  { title: "Total Emissions", value: "13,650", unit: absUnit(unitMode), delta: 3.4, deltaLabel: dl },
  { title: "Production", value: "4,789", unit: "tonnes", delta: 2.1, deltaLabel: dl },
  { title: "Intensity", value: "2.85", unit: iU, delta: 1.8, deltaLabel: dl, scopeBreakdown: intensityScopeBreakdown }];


  const paramCards: (KPICardProps & {scopeBreakdown?: {label: string;value: string;unit: string;}[];})[] = [
  { title: "Coke Rate", value: "385", unit: "kg/t", delta: 2.4, deltaLabel: dl },
  { title: "Renewable Elec.", value: "18.5", unit: "%", delta: -3.1, deltaLabel: dl },
  { title: "Scrap Rate", value: "12.3", unit: "%", delta: -1.5, deltaLabel: dl },
  { title: "BFG Recovery", value: "92.4", unit: "%", delta: -0.8, deltaLabel: dl }];


  const handleParamClick = (card: typeof paramCards[0]) => {
    if (onMetricClick) {
      onMetricClick({ title: card.title, value: card.value, unit: card.unit, delta: card.delta });
    } else {
      onKPIClick();
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
        {mainCards.map((card) =>
        <KPICard key={card.title} {...card} onClick={onKPIClick} />
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KEY METRICS</p>
        {onSeeAllMetrics &&
        <button onClick={onSeeAllMetrics} className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">
            See All →
          </button>
        }
      </div>

      <div className="grid grid-cols-4 gap-3">
        {paramCards.map((card) =>
        <KPICard key={card.title} {...card} onClick={() => handleParamClick(card)} />
        )}
      </div>
    </div>);

};

export default KPICardsRow;