import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  unit: string;
  delta: number;
  deltaLabel: string;
  scopeColor?: string;
  onClick?: () => void;
}

const KPICard = ({ title, value, unit, delta, deltaLabel, scopeColor, onClick }: KPICardProps) => {
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        {scopeColor && (
          <div className={`w-2 h-2 rounded-full ${scopeColor}`} />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors font-mono">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {isNeutral ? (
          <Minus className="w-3 h-3 text-muted-foreground" />
        ) : isPositive ? (
          <ArrowUp className="w-3 h-3 text-chart-negative" />
        ) : (
          <ArrowDown className="w-3 h-3 text-chart-positive" />
        )}
        <span
          className={`text-xs font-medium ${
            isNeutral
              ? "text-muted-foreground"
              : isPositive
              ? "text-chart-negative"
              : "text-chart-positive"
          }`}
        >
          {isPositive ? "+" : ""}{delta}%
        </span>
        <span className="text-xs text-muted-foreground">{deltaLabel}</span>
      </div>
    </div>
  );
};

interface KPICardsRowProps {
  onKPIClick: () => void;
}

const KPICardsRow = ({ onKPIClick }: KPICardsRowProps) => {
  const cards = [
    { title: "Total Emissions", value: "13,650", unit: "tCO2e", delta: 3.4, deltaLabel: "vs prev day" },
    { title: "Intensity", value: "2.85", unit: "kgCO2e/t", delta: 1.8, deltaLabel: "vs prev day" },
    { title: "Production", value: "4,789", unit: "tonnes", delta: 2.1, deltaLabel: "vs prev day" },
    { title: "Scope 1", value: "8,466", unit: "tCO2e", delta: 4.2, deltaLabel: "vs prev day", scopeColor: "bg-scope1" },
    { title: "Scope 2", value: "3,003", unit: "tCO2e", delta: -1.2, deltaLabel: "vs prev day", scopeColor: "bg-scope2" },
    { title: "Scope 3", value: "2,181", unit: "tCO2e", delta: 2.8, deltaLabel: "vs prev day", scopeColor: "bg-scope3" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} onClick={onKPIClick} />
      ))}
    </div>
  );
};

export default KPICardsRow;
