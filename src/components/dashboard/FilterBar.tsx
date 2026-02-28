import { useState } from "react";
import { Calendar, X, ArrowRightLeft, Sparkles, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterBarProps {
  activeFilters: string[];
  onRemoveFilter: (f: string) => void;
  onOpenAnalytics: () => void;
  onOpenSentraAI: () => void;
  frequency: "Monthly" | "Daily";
  onFrequencyChange: (f: "Monthly" | "Daily") => void;
  fromMonth: string;
  toMonth: string;
  onFromMonthChange: (m: string) => void;
  onToMonthChange: (m: string) => void;
}

const regions = ["North 42", "West 32", "Central 32", "East 32"];

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const years = ["2023", "2024", "2025"];

const buildMonthOptions = () => {
  const options: { label: string; value: string }[] = [];
  for (const y of years) {
    for (let m = 0; m < 12; m++) {
      options.push({ label: `${months[m]} '${y.slice(2)}`, value: `${y}-${String(m + 1).padStart(2, "0")}` });
    }
  }
  return options;
};

const monthOptions = buildMonthOptions();

const formatMonthLabel = (val: string) => {
  const opt = monthOptions.find((o) => o.value === val);
  return opt?.label ?? val;
};

const MonthSelector = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-md text-secondary-foreground hover:bg-muted transition-colors">
        <span className="text-muted-foreground text-[10px]">{label}</span>
        <span className="font-medium">{formatMonthLabel(value)}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-2 max-h-60 overflow-y-auto" align="end">
      <div className="space-y-0.5">
        {monthOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
              value === o.value
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

const FilterBar = ({
  activeFilters, onRemoveFilter, onOpenAnalytics, onOpenSentraAI,
  frequency, onFrequencyChange, fromMonth, toMonth, onFromMonthChange, onToMonthChange,
}: FilterBarProps) => {
  const [activeRegion, setActiveRegion] = useState(regions[0]);
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Region toggle */}
        <div className="flex bg-secondary rounded-md p-0.5">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeRegion === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        {/* Right: Analytics, AI, Frequency & Date */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors font-medium"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Run Analytics
          </button>
          <button
            onClick={onOpenSentraAI}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            sentra.AI
          </button>

          {/* Frequency toggle */}
          <div className="flex bg-secondary rounded-md p-0.5">
            {(["Monthly", "Daily"] as const).map((f) => (
              <button
                key={f}
                onClick={() => onFrequencyChange(f)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  frequency === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* From / To month selectors */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <MonthSelector value={fromMonth} onChange={onFromMonthChange} label="From" />
            <span className="text-muted-foreground text-xs">–</span>
            <MonthSelector value={toMonth} onChange={onToMonthChange} label="To" />
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="px-6 pb-2 flex gap-1.5 flex-wrap">
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="text-xs gap-1 cursor-pointer hover:bg-muted">
              {f}
              <X className="w-3 h-3" onClick={() => onRemoveFilter(f)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
