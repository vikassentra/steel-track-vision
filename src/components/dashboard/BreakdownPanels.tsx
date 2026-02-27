import { shopBreakdowns, scopeCategories } from "@/data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import type { UnitMode } from "@/pages/Index";

interface BreakdownPanelsProps {
  onShopClick: (shop: string) => void;
  onScopeClick: (scope: string) => void;
  activeScope: string;
  unitMode: UnitMode;
}

const absUnit = (mode: UnitMode) => mode === "energy" ? "TJ" : "tCO2e";

const SCOPE_COLORS = {
  "Scope 1": "hsl(168 70% 50%)",
  "Scope 2": "hsl(45 95% 58%)",
  "Scope 3": "hsl(270 60% 60%)",
};

const ShopTooltip = ({ active, payload, unitMode }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const u = absUnit(unitMode);
  return (
    <div className="bg-popover border border-border rounded-lg p-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{d.shop}</p>
      <p><span className="text-scope1">S1:</span> {d.scope1.toLocaleString()}</p>
      <p><span className="text-scope2">S2:</span> {d.scope2.toLocaleString()}</p>
      <p><span className="text-scope3">S3:</span> {d.scope3.toLocaleString()}</p>
      <p className="font-medium mt-1">Total: {d.total.toLocaleString()} {u}</p>
    </div>
  );
};

const BreakdownPanels = ({ onShopClick, onScopeClick, activeScope, unitMode }: BreakdownPanelsProps) => {
  const u = absUnit(unitMode);

  const scopeTotals = [
    { name: "Scope 1", value: 10910, color: SCOPE_COLORS["Scope 1"] },
    { name: "Scope 2", value: 1970, color: SCOPE_COLORS["Scope 2"] },
    { name: "Scope 3", value: 1500, color: SCOPE_COLORS["Scope 3"] },
  ];

  const filteredCategories = activeScope === "All"
    ? scopeCategories
    : scopeCategories.filter((c) => c.scope === activeScope);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* By Steel Shops */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Emissions by Shop</h3>
        <p className="text-xs text-muted-foreground mb-3">{u} — click to filter</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={shopBreakdowns} onClick={(e: any) => e?.activeLabel && onShopClick(e.activeLabel)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="shop" tick={{ fontSize: 9, fill: "hsl(215 15% 55%)" }} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
            <Tooltip content={<ShopTooltip unitMode={unitMode} />} />
            <Bar dataKey="scope1" stackId="a" fill="hsl(168 70% 50%)" />
            <Bar dataKey="scope2" stackId="a" fill="hsl(45 95% 58%)" />
            <Bar dataKey="scope3" stackId="a" fill="hsl(270 60% 60%)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* By Scope (Donut) */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Emissions by Scope</h3>
        <p className="text-xs text-muted-foreground mb-3">{u} — click to filter categories</p>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={scopeTotals}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              onClick={(_, idx) => onScopeClick(scopeTotals[idx].name)}
              className="cursor-pointer"
            >
              {scopeTotals.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} ${u}`]}
              contentStyle={{
                background: "hsl(220 18% 15%)",
                border: "1px solid hsl(220 15% 22%)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 text-xs mt-2">
          {scopeTotals.map((s) => (
            <button
              key={s.name}
              onClick={() => onScopeClick(s.name)}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* By Category */}
      <div className="bg-card rounded-lg border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Top Contributors</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {activeScope === "All" ? "All scopes" : activeScope} — % contribution
        </p>
        <div className="space-y-2.5">
          {filteredCategories.slice(0, 5).map((cat) => (
            <div key={cat.category} className="group cursor-pointer">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground group-hover:text-primary transition-colors">{cat.category}</span>
                <span className="text-muted-foreground font-mono">{cat.value.toLocaleString()} {u}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: SCOPE_COLORS[cat.scope],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakdownPanels;
