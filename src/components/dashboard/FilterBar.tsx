import { useState } from "react";
import { Calendar, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { plants } from "@/data/mockData";
import type { UnitMode } from "@/pages/Index";

interface FilterBarProps {
  onFrequencyChange: (f: string) => void;
  onScopeChange: (s: string) => void;
  activeScope: string;
  activeFrequency: string;
  activeFilters: string[];
  onRemoveFilter: (f: string) => void;
  unitMode: UnitMode;
  onUnitModeChange: (mode: UnitMode) => void;
}

const FilterBar = ({ onFrequencyChange, onScopeChange, activeScope, activeFrequency, activeFilters, onRemoveFilter, unitMode, onUnitModeChange }: FilterBarProps) => {
  const [plant, setPlant] = useState("All Plants");

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Logo & Plant */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-primary tracking-tight">sentra.world</h1>
            <Badge variant="outline" className="text-xs border-primary text-primary mt-0.5">
              {plant}
            </Badge>
          </div>
        </div>

        {/* Center: Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
            className="px-3 py-1.5 text-xs bg-secondary rounded-md text-secondary-foreground border-none outline-none cursor-pointer max-w-[160px]"
          >
            {plants.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Unit toggle */}
          <div className="flex bg-secondary rounded-md p-0.5">
            {(["emissions", "energy"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onUnitModeChange(mode)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  unitMode === mode
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "emissions" ? "Emissions" : "Energy"}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Date & Export */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary rounded-md text-secondary-foreground hover:bg-surface-overlay transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            <span>Jan '23 – Mar '25</span>
          </button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
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
