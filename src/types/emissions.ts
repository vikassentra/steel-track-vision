export interface DailyEmission {
  date: string;
  totalEmissions: number;
  intensity: number;
  production: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export interface ShopBreakdown {
  shop: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface ScopeCategory {
  category: string;
  scope: "Scope 1" | "Scope 2" | "Scope 3";
  value: number;
  percentage: number;
}

export interface WaterfallItem {
  name: string;
  value: number;
  type: "increase" | "decrease" | "total";
}

export interface DriverRow {
  driver: string;
  scope: string;
  shop: string;
  valueChange: string;
  emissionsChange: number;
  anomaly?: string;
}

export interface PeerBenchmark {
  name: string;
  intensity: number;
  type: "you" | "peer";
}

export interface FilterState {
  frequency: "Daily" | "Monthly" | "Yearly";
  dateRange: string;
  plant: string;
  shops: string[];
  scope: string;
  product: string;
  unit: "tCO2e" | "kgCO2e/t";
}
