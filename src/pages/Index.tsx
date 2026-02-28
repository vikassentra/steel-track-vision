import { useState } from "react";
import FilterBar from "@/components/dashboard/FilterBar";
import KPICardsRow from "@/components/dashboard/KPICardsRow";
import TrendChart from "@/components/dashboard/TrendChart";
import BreakdownPanels from "@/components/dashboard/BreakdownPanels";
import DeviationDrawer from "@/components/dashboard/DeviationDrawer";
import PeerBenchmark from "@/components/dashboard/PeerBenchmark";
import DriverDetailModal from "@/components/dashboard/DriverDetailModal";
import ShopDetailModal from "@/components/dashboard/ShopDetailModal";
import RunAnalyticsModal from "@/components/dashboard/RunAnalyticsModal";
import SentraAIModal from "@/components/dashboard/SentraAIModal";
import AllMetricsModal from "@/components/dashboard/AllMetricsModal";
import MetricDetailModal from "@/components/dashboard/MetricDetailModal";
import { plants } from "@/data/mockData";

export type UnitMode = "emissions" | "energy";

const Index = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [activeScope, setActiveScope] = useState("All");
  const [activeFrequency, setActiveFrequency] = useState<"Monthly" | "Daily">("Monthly");
  const [fromMonth, setFromMonth] = useState("2023-01");
  const [toMonth, setToMonth] = useState("2025-03");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [unitMode, setUnitMode] = useState<UnitMode>("emissions");
  const [activeShop, setActiveShop] = useState("BF");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [sentraAIOpen, setSentraAIOpen] = useState(false);
  const [allMetricsOpen, setAllMetricsOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<{ title: string; value: string; unit: string; delta: number } | null>(null);

  const handlePointClick = (date: string) => {
    setSelectedDate(date);
    setDrawerOpen(true);
  };

  const handleShopClick = (shop: string) => {
    setSelectedShop(shop);
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
        onOpenAnalytics={() => setAnalyticsOpen(true)}
        onOpenSentraAI={() => setSentraAIOpen(true)}
        frequency={activeFrequency}
        onFrequencyChange={setActiveFrequency}
        fromMonth={fromMonth}
        toMonth={toMonth}
        onFromMonthChange={setFromMonth}
        onToMonthChange={setToMonth}
      />


      <div className="p-6 space-y-4 max-w-[1600px] mx-auto">
        {/* Plant + Unit toggles */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-secondary rounded-md p-0.5">
            {["COP", "SP", "BF", "BOF", "RM"].map((s) =>
            <button
              key={s}
              onClick={() => setActiveShop(s)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeShop === s ?
              "bg-primary text-primary-foreground" :
              "text-muted-foreground hover:text-foreground"}`
              }>
                {s}
              </button>
            )}
          </div>
          <div className="flex bg-secondary rounded-md p-0.5">
            {(["emissions", "energy"] as const).map((mode) =>
            <button
              key={mode}
              onClick={() => setUnitMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              unitMode === mode ?
              "bg-accent text-accent-foreground" :
              "text-muted-foreground hover:text-foreground"}`
              }>
                {mode === "emissions" ? "Emissions" : "Energy"}
              </button>
            )}
          </div>
        </div>

        {/* Page Title */}
        <div>
          
          
        </div>

      {/* KPI Cards */}
        <KPICardsRow
          onKPIClick={() => setDrawerOpen(true)}
          unitMode={unitMode}
          frequency={activeFrequency}
          onMetricClick={(m) => setSelectedMetric(m)}
          onSeeAllMetrics={() => setAllMetricsOpen(true)}
        />

        {/* Breakdown Panels */}
        <BreakdownPanels
          onShopClick={handleShopClick}
          onScopeClick={handleScopeClick}
          onDriverClick={(driver) => setSelectedDriver(driver)}
          activeScope={activeScope}
          unitMode={unitMode} />

        {/* Peer Benchmark */}
        <PeerBenchmark unitMode={unitMode} />
      </div>

      {/* Trend Chart - full width edge to edge, after Peer Benchmark */}
      <TrendChart onPointClick={handlePointClick} unitMode={unitMode} frequency={activeFrequency} />

      <div className="p-6 max-w-[1600px] mx-auto">
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
        unitMode={unitMode} />

      {/* Driver Detail Modal */}
      <DriverDetailModal
        driver={selectedDriver}
        shop={activeShop}
        onClose={() => setSelectedDriver(null)} />

      {/* Shop Detail Modal */}
      <ShopDetailModal
        shop={selectedShop}
        onClose={() => setSelectedShop(null)} />

      {/* Run Analytics Modal */}
      <RunAnalyticsModal open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />

      {/* sentra.AI Modal */}
      <SentraAIModal open={sentraAIOpen} onClose={() => setSentraAIOpen(false)} />

      {/* All Metrics Modal */}
      <AllMetricsModal
        open={allMetricsOpen}
        onClose={() => setAllMetricsOpen(false)}
        onMetricClick={(m) => { setAllMetricsOpen(false); setSelectedMetric(m); }}
      />

      {/* Metric Detail Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

    </div>
  );
};

export default Index;