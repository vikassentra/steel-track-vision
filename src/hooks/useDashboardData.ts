import { useQuery } from "@tanstack/react-query";

const fetchDashboard = async (action: string) => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-api?action=${action}`;
  const res = await fetch(url, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export interface KPIData {
  total_emissions: { value: number; unit: string };
  production: { value: number; unit: string };
  intensity: { value: number; unit: string };
  intensity_s1: { value: number; unit: string };
  intensity_s2: { value: number; unit: string };
  intensity_s3: { value: number; unit: string };
  intensity_s3_mining: { value: number; unit: string };
  coke_rate: { value: number; unit: string };
  renewables: { value: number; unit: string };
  scrap_rate: { value: number; unit: string };
  bfg_recovery: { value: number; unit: string };
}

export interface TrendPoint {
  date: string;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  production: number;
  intensity: number;
}

export interface ShopBreakdownItem {
  shop: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface DriverItem {
  driver: string;
  scope: string;
  shop: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  emissionsChange: number;
}

export interface BenchmarkItem {
  id: number;
  type: string;
  company: string;
  site: string | null;
  year: string;
  intensity_value: number;
}

export const useKPIs = () =>
  useQuery<KPIData>({ queryKey: ["dashboard", "kpis"], queryFn: () => fetchDashboard("kpis"), staleTime: 5 * 60 * 1000 });

export const useTrend = () =>
  useQuery<TrendPoint[]>({ queryKey: ["dashboard", "trend"], queryFn: () => fetchDashboard("trend"), staleTime: 5 * 60 * 1000 });

export const useShopBreakdown = () =>
  useQuery<ShopBreakdownItem[]>({ queryKey: ["dashboard", "shop-breakdown"], queryFn: () => fetchDashboard("shop-breakdown"), staleTime: 5 * 60 * 1000 });

export const useDrivers = () =>
  useQuery<DriverItem[]>({ queryKey: ["dashboard", "drivers"], queryFn: () => fetchDashboard("drivers"), staleTime: 5 * 60 * 1000 });

export const useBenchmarks = () =>
  useQuery<BenchmarkItem[]>({ queryKey: ["dashboard", "benchmarks"], queryFn: () => fetchDashboard("benchmarks"), staleTime: 5 * 60 * 1000 });
