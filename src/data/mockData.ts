import { DailyEmission, ShopBreakdown, ScopeCategory, WaterfallItem, DriverRow, PeerBenchmark } from "@/types/emissions";

export const dailyEmissions: DailyEmission[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2025, 1, i + 1);
  const base = 12000 + Math.random() * 3000;
  const prod = 4200 + Math.random() * 800;
  const s1 = base * 0.62;
  const s2 = base * 0.22;
  const s3 = base * 0.16;
  return {
    date: date.toISOString().split("T")[0],
    totalEmissions: Math.round(base),
    intensity: +(base / prod).toFixed(2),
    production: Math.round(prod),
    scope1: Math.round(s1),
    scope2: Math.round(s2),
    scope3: Math.round(s3),
  };
});

export const shopBreakdowns: ShopBreakdown[] = [
  { shop: "Blast Furnace", scope1: 4200, scope2: 380, scope3: 520, total: 5100 },
  { shop: "Coke Oven", scope1: 2800, scope2: 120, scope3: 180, total: 3100 },
  { shop: "Sinter Plant", scope1: 1600, scope2: 280, scope3: 340, total: 2220 },
  { shop: "BOF / SMS", scope1: 1100, scope2: 450, scope3: 220, total: 1770 },
  { shop: "Rolling Mill", scope1: 320, scope2: 680, scope3: 150, total: 1150 },
  { shop: "Power / CPP", scope1: 890, scope2: 60, scope3: 90, total: 1040 },
];

export const scopeCategories: ScopeCategory[] = [
  { category: "S1.1 Fuels (Coke/Coal/Gas)", scope: "Scope 1", value: 5800, percentage: 76 },
  { category: "S1.2 Process Emissions", scope: "Scope 1", value: 1400, percentage: 18 },
  { category: "S1.3 On-site Vehicles", scope: "Scope 1", value: 420, percentage: 6 },
  { category: "S2.1 Purchased Electricity", scope: "Scope 2", value: 1650, percentage: 84 },
  { category: "S2.2 Purchased Steam", scope: "Scope 2", value: 320, percentage: 16 },
  { category: "S3.1 Raw Materials", scope: "Scope 3", value: 680, percentage: 45 },
  { category: "S3.2 Inbound Logistics", scope: "Scope 3", value: 380, percentage: 25 },
  { category: "S3.3 Scrap Processing", scope: "Scope 3", value: 260, percentage: 17 },
  { category: "S3.4 Downstream Transport", scope: "Scope 3", value: 200, percentage: 13 },
];

export const waterfallData: WaterfallItem[] = [
  { name: "Previous Day", value: 13200, type: "total" },
  { name: "Production ↑", value: 420, type: "increase" },
  { name: "Coke Rate ↑", value: 310, type: "increase" },
  { name: "Grid Factor ↑", value: 180, type: "increase" },
  { name: "BF Efficiency ↓", value: -150, type: "decrease" },
  { name: "Gas Recovery ↓", value: -220, type: "decrease" },
  { name: "Scrap Ratio ↓", value: -90, type: "decrease" },
  { name: "Current Day", value: 13650, type: "total" },
];

export const driverDetails: DriverRow[] = [
  { driver: "Coke", scope: "Scope 1", shop: "Coke Oven", valueChange: "+12 t", emissionsChange: 185, anomaly: "High consumption" },
  { driver: "Electricity (Grid)", scope: "Scope 2", shop: "Rolling Mill", valueChange: "+8,200 kWh", emissionsChange: 142 },
  { driver: "Coal (PCI)", scope: "Scope 1", shop: "Blast Furnace", valueChange: "+6 t", emissionsChange: 125, anomaly: "Supplier change" },
  { driver: "Natural Gas", scope: "Scope 1", shop: "BOF / SMS", valueChange: "+2,100 m³", emissionsChange: 98 },
  { driver: "Limestone", scope: "Scope 3", shop: "Sinter Plant", valueChange: "+15 t", emissionsChange: 62 },
  { driver: "Scrap", scope: "Scope 3", shop: "BOF / SMS", valueChange: "-8 t", emissionsChange: -45 },
  { driver: "BFG Recovery", scope: "Scope 1", shop: "Power / CPP", valueChange: "+3,500 m³", emissionsChange: -78 },
  { driver: "COG Recovery", scope: "Scope 1", shop: "Coke Oven", valueChange: "+1,200 m³", emissionsChange: -52 },
];

export const peerBenchmarks: PeerBenchmark[] = [
  { name: "Best-in-class", intensity: 1.82, type: "peer" },
  { name: "AMNS '23", intensity: 2.28, type: "peer" },
  { name: "JSW Steel", intensity: 2.44, type: "peer" },
  { name: "JSPL '23", intensity: 2.58, type: "peer" },
  { name: "Your Plant", intensity: 2.85, type: "you" },
  { name: "Hyundai (+S3) '23", intensity: 2.9, type: "peer" },
  { name: "Tata Steel", intensity: 3.1, type: "peer" },
  { name: "Industry Median", intensity: 3.04, type: "peer" },
  { name: "Baseline", intensity: 3.13, type: "peer" },
];

export const plants = ["All Plants", "Rourkela Works", "Burnpur Works", "Durgapur Steel"];
export const steelShops = ["Coke Oven", "Sinter Plant", "Blast Furnace", "BOF / SMS", "Rolling Mill", "Power / CPP"];
export const products = ["All Products", "Rebar", "Billets", "Wire Rod", "HR Coil"];
export const peerGroups = ["India BF-BOF Integrated", "India EAF Mills", "Similar Capacity (3-5 MTPA)", "Global BF-BOF"];
