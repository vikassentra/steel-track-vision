import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { UnitMode } from "@/pages/Index";
import { useKPIs, useShopBreakdown } from "@/hooks/useDashboardData";
import { getPlantFullName } from "@/lib/plantMapping";

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
            {scopeColor && <div className={`w-2 h-2 rounded-full ${scopeColor}`} />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors font-mono">{value}</span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {isNeutral ? <Minus className="w-3 h-3 text-muted-foreground" /> :
            isPositive ? <ArrowUp className="w-3 h-3 text-chart-negative" /> :
            <ArrowDown className="w-3 h-3 text-chart-positive" />}
            <span className={`text-xs font-medium ${isNeutral ? "text-muted-foreground" : isPositive ? "text-chart-negative" : "text-chart-positive"}`}>
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
        </div>}
      </div>
    </div>
  );
};

interface KPICardsRowProps {
  onKPIClick: () => void;
  unitMode: UnitMode;
  frequency: "Monthly" | "Daily";
  activePlant: string;
  onMetricClick?: (metric: {title: string;value: string;unit: string;delta: number;}) => void;
  onSeeAllMetrics?: () => void;
  fromMonth?: string;
  toMonth?: string;
}

const formatNum = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

const KPICardsRow = ({ onKPIClick, unitMode, frequency, activePlant, onMetricClick, onSeeAllMetrics, fromMonth, toMonth }: KPICardsRowProps) => {
  const { data: kpis, isLoading: kpiLoading } = useKPIs();
  const { data: shopData, isLoading: shopLoading } = useShopBreakdown(fromMonth, toMonth);
  const dl = frequency === "Daily" ? "vs prev day" : "vs prev month";
  const isLoading = kpiLoading || shopLoading;

  if (isLoading || !kpis) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse h-24" />)}
        </div>
      </div>
    );
  }

  const iU = unitMode === "energy" ? "TJ/t" : "tCO2e/t";
  const absU = unitMode === "energy" ? "TJ" : "tCO2e";

  // Find plant-specific data when a plant is selected
  const plantFullName = getPlantFullName(activePlant);
  const plantData = activePlant !== "All" ? shopData?.find(s => s.shop === plantFullName) : null;

  const totalEmissions = plantData ? plantData.total : (kpis.total_emissions?.value ?? 0);
  const production = plantData ? plantData.production : (kpis.production?.value ?? 0);
  const intensity = plantData ? plantData.intensity : (kpis.intensity?.value ?? 0);

  const intensityScopeBreakdown = plantData ? [
    { label: "S1", value: plantData.s1Intensity.toFixed(3), unit: iU },
    { label: "S2", value: plantData.s2Intensity.toFixed(3), unit: iU },
    { label: "S3", value: plantData.s3Intensity.toFixed(3), unit: iU },
    { label: "S3+Mining", value: plantData.s3MiningIntensity.toFixed(3), unit: iU },
  ] : [
    { label: "S1", value: kpis.intensity_s1?.value?.toFixed(3) ?? "—", unit: iU },
    { label: "S2", value: kpis.intensity_s2?.value?.toFixed(3) ?? "—", unit: iU },
    { label: "S3", value: kpis.intensity_s3?.value?.toFixed(3) ?? "—", unit: iU },
    { label: "S3+Mining", value: kpis.intensity_s3_mining?.value?.toFixed(3) ?? "—", unit: iU },
  ];

  const mainCards: (KPICardProps & {scopeBreakdown?: {label: string;value: string;unit: string;}[];})[] = [
    { title: "Total Emissions", value: formatNum(totalEmissions), unit: absU, delta: 3.4, deltaLabel: dl },
    { title: "Production", value: formatNum(production), unit: "tonnes", delta: 2.1, deltaLabel: dl },
    { title: "Intensity", value: intensity.toFixed(3), unit: iU, delta: 1.8, deltaLabel: dl, scopeBreakdown: intensityScopeBreakdown },
  ];

  const paramCards: (KPICardProps & {scopeBreakdown?: {label: string;value: string;unit: string;}[];})[] = [
    { title: "Coke Rate", value: String(Math.round(kpis.coke_rate?.value ?? 0)), unit: "kg/thm", delta: 2.4, deltaLabel: dl },
    { title: "Renewable Elec.", value: (kpis.renewables?.value ?? 0).toFixed(1), unit: "%", delta: -3.1, deltaLabel: dl },
    { title: "Scrap Rate", value: (kpis.scrap_rate?.value ?? 0).toFixed(1), unit: "%", delta: -1.5, deltaLabel: dl },
    { title: "BFG Recovery", value: (kpis.bfg_recovery?.value ?? 0).toFixed(3), unit: "kNm3/thm", delta: -0.8, deltaLabel: dl },
  ];

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
        {mainCards.map((card) => <KPICard key={card.title} {...card} onClick={onKPIClick} />)}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">KEY METRICS</p>
        {onSeeAllMetrics &&
        <button onClick={onSeeAllMetrics} className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors">See All →</button>}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {paramCards.map((card) => <KPICard key={card.title} {...card} onClick={() => handleParamClick(card)} />)}
      </div>
    </div>
  );
};

export default KPICardsRow;
