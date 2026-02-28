import { Calendar, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  activeFilters: string[];
  onRemoveFilter: (f: string) => void;
  activeShop: string;
  onShopChange: (shop: string) => void;
}

const shops = ["COP", "SP", "BF", "BOF", "RM"];

const FilterBar = ({ activeFilters, onRemoveFilter, activeShop, onShopChange }: FilterBarProps) => {
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Shop toggle */}
        <div className="flex bg-secondary rounded-md p-0.5">
          {shops.map((s) => (
            <button
              key={s}
              onClick={() => onShopChange(s)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                activeShop === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
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
