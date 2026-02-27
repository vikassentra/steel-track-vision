import { useState } from "react";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICardsRow from "@/components/dashboard/KPICardsRow";
import TrendChart from "@/components/dashboard/TrendChart";
import BreakdownPanels from "@/components/dashboard/BreakdownPanels";
import DeviationDrawer from "@/components/dashboard/DeviationDrawer";
import PeerBenchmark from "@/components/dashboard/PeerBenchmark";
import { plants } from "@/data/mockData";

export type UnitMode = "emissions" | "energy";

const plantsWithoutAll = plants.filter((p) => p !== "All Plants");

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [activeScope, setActiveScope] = useState("All");
  const [activeFrequency, setActiveFrequency] = useState("Daily");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [unitMode, setUnitMode] = useState<UnitMode>("emissions");
  const [activePlant, setActivePlant] = useState(plantsWithoutAll[0]);

  const handlePointClick = (date: string) => {
    setSelectedDate(date);
    setDrawerOpen(true);
  };

  const handleShopClick = (shop: string) => {
    if (!activeFilters.includes(shop)) {
      setActiveFilters((prev) => [...prev, shop]);
    }
  };

  const handleScopeClick = (scope: string) => {
    setActiveScope(scope);
    if (scope !== "All" && !activeFilters.includes(scope)) {
      setActiveFilters((prev) => [...prev, scope]);
    }
  };

  const handleRemoveFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));
    if (["Scope 1", "Scope 2", "Scope 3"].includes(filter)) {
      setActiveScope("All");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FilterBar
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
      />

      <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
        {/* Plant toggles + Unit toggle */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-secondary rounded-md p-0.5">
            {plantsWithoutAll.map((p) => (
              <button
                key={p}
                onClick={() => setActivePlant(p)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  activePlant === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex bg-secondary rounded-md p-0.5">
            {(["emissions", "energy"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setUnitMode(mode)}
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

        {/* Page Title */}
        <div>
          <h2 className="text-lg font-bold text-foreground">Emissions Overview</h2>
          <p className="text-xs text-muted-foreground">Carbon footprint monitoring · Steel Co. · {activePlant}</p>
        </div>

        {/* KPI Cards */}
        <KPICardsRow onKPIClick={() => setDrawerOpen(true)} unitMode={unitMode} />

        {/* Trend Chart */}
        <TrendChart onPointClick={handlePointClick} unitMode={unitMode} />

        {/* Breakdown Panels */}
        <BreakdownPanels
          onShopClick={handleShopClick}
          onScopeClick={handleScopeClick}
          activeScope={activeScope}
          unitMode={unitMode}
        />

        {/* Peer Benchmark */}
        <PeerBenchmark unitMode={unitMode} />

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[10px] text-muted-foreground">© sentra.world 2026 · Data refreshed daily · All values in tCO2e unless noted</p>
        </div>
      </div>

      {/* Deviation Drawer */}
      <DeviationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedDate={selectedDate}
        unitMode={unitMode}
      />
    </div>
  );
};

export default Index;
