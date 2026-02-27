import { useState } from "react";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICardsRow from "@/components/dashboard/KPICardsRow";
import TrendChart from "@/components/dashboard/TrendChart";
import BreakdownPanels from "@/components/dashboard/BreakdownPanels";
import DeviationDrawer from "@/components/dashboard/DeviationDrawer";
import PeerBenchmark from "@/components/dashboard/PeerBenchmark";

export type UnitMode = "emissions" | "energy";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [activeScope, setActiveScope] = useState("All");
  const [activeFrequency, setActiveFrequency] = useState("Daily");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [unitMode, setUnitMode] = useState<UnitMode>("emissions");

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
        onFrequencyChange={setActiveFrequency}
        onScopeChange={handleScopeClick}
        activeScope={activeScope}
        activeFrequency={activeFrequency}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        unitMode={unitMode}
        onUnitModeChange={setUnitMode}
      />
      <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Emissions Overview</h2>
            <p className="text-xs text-muted-foreground">Carbon footprint monitoring · Steel Co. · All Plants</p>
          </div>
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
