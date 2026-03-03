import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Fetch all rows from a query, paginating in batches of 1000
async function fetchAll(queryBuilder: any): Promise<any[]> {
  const PAGE_SIZE = 1000;
  let allData: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await queryBuilder.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return allData;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const fromDate = url.searchParams.get("from");
  const toDate = url.searchParams.get("to");

  const endOfMonth = (ym: string) => {
    const [y, m] = ym.split("-").map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return `${ym}-${String(lastDay).padStart(2, "0")}`;
  };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Helper to build a filtered emissions query (returns builder before .range)
  const emissionsQuery = (selectCols: string) => {
    let q = supabase
      .from("emissions_data")
      .select(selectCols)
      .eq("is_accepted", 1);
    if (fromDate) q = q.gte("timestamp", `${fromDate}-01`);
    if (toDate) q = q.lte("timestamp", endOfMonth(toDate));
    return q;
  };

  // Paginated fetch for emissions data
  const fetchEmissions = async (selectCols: string, extraFilters?: (q: any) => any) => {
    const PAGE_SIZE = 1000;
    let allData: any[] = [];
    let from = 0;
    while (true) {
      let q = supabase
        .from("emissions_data")
        .select(selectCols)
        .eq("is_accepted", 1);
      if (fromDate) q = q.gte("timestamp", `${fromDate}-01`);
      if (toDate) q = q.lte("timestamp", endOfMonth(toDate));
      if (extraFilters) q = extraFilters(q);
      q = q.range(from, from + PAGE_SIZE - 1);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) break;
      allData = allData.concat(data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return allData;
  };

  try {
    switch (action) {
      case "kpis": {
        if (fromDate || toDate) {
          const emData = await fetchEmissions(
            "scope_name, co2e_value, is_to_be_subtracted, activity_data_value, is_product"
          );

          let s1 = 0, s2 = 0, s3 = 0, s3m = 0, prod = 0;
          emData.forEach((row: any) => {
            const val = Number(row.co2e_value) * (row.is_to_be_subtracted === 1 ? -1 : 1);
            if (row.scope_name === "Scope 1") s1 += val;
            else if (row.scope_name === "Scope 2") s2 += val;
            else if (row.scope_name === "Scope 3 + mining") s3m += val;
            else if (row.scope_name === "Scope 3") s3 += val;
            if (row.is_product === 1) prod += Number(row.activity_data_value);
          });

          const total = s1 + s2 + s3 + s3m;
          const production = prod > 0 ? prod : 5000000;
          const intensity = production > 0 ? total / production : 0;

          const kpiMap: Record<string, { value: number; unit: string }> = {
            total_emissions: { value: Math.round(total), unit: "tCO2e" },
            production: { value: Math.round(production), unit: "tonnes" },
            intensity: { value: +intensity.toFixed(3), unit: "tCO2e/t" },
            intensity_s1: { value: +(s1 / production).toFixed(3), unit: "tCO2e/t" },
            intensity_s2: { value: +(s2 / production).toFixed(3), unit: "tCO2e/t" },
            intensity_s3: { value: +(s3 / production).toFixed(3), unit: "tCO2e/t" },
            intensity_s3_mining: { value: +(s3m / production).toFixed(3), unit: "tCO2e/t" },
            coke_rate: { value: 554, unit: "kg/thm" },
            renewables: { value: 8.0, unit: "%" },
            scrap_rate: { value: 16.9, unit: "%" },
            bfg_recovery: { value: 0.838, unit: "kNm3/thm" },
          };

          return new Response(JSON.stringify(kpiMap), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data, error } = await supabase.from("kpi_values").select("*");
        if (error) throw error;
        const kpiMap: Record<string, { value: number; unit: string }> = {};
        data.forEach((row: any) => {
          kpiMap[row.metric_name] = { value: row.value, unit: row.unit };
        });
        return new Response(JSON.stringify(kpiMap), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "trend": {
        const data = await fetchEmissions(
          "timestamp, scope_name, co2e_value, is_to_be_subtracted"
        );

        const monthlyMap = new Map<string, { scope1: number; scope2: number; scope3: number }>();
        data.forEach((row: any) => {
          const month = row.timestamp.substring(0, 7);
          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, { scope1: 0, scope2: 0, scope3: 0 });
          }
          const entry = monthlyMap.get(month)!;
          const val = Number(row.co2e_value) * (row.is_to_be_subtracted === 1 ? -1 : 1);
          if (row.scope_name === "Scope 1") entry.scope1 += val;
          else if (row.scope_name === "Scope 2") entry.scope2 += val;
          else if (row.scope_name === "Scope 3" || row.scope_name === "Scope 3 + mining") entry.scope3 += val;
        });

        const monthlyProduction = 5000000 / 12;

        const trend = Array.from(monthlyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, scopes]) => {
            const total = scopes.scope1 + scopes.scope2 + scopes.scope3;
            return {
              date,
              totalEmissions: Math.round(total),
              scope1: Math.round(scopes.scope1),
              scope2: Math.round(scopes.scope2),
              scope3: Math.round(scopes.scope3),
              production: Math.round(monthlyProduction),
              intensity: +(total / monthlyProduction).toFixed(2),
            };
          });

        return new Response(JSON.stringify(trend), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "shop-breakdown": {
        if (fromDate || toDate) {
          const emData = await fetchEmissions(
            "plant_name, scope_name, co2e_value, is_to_be_subtracted, activity_data_value, is_product"
          );

          const plantMap = new Map<string, { s1: number; s2: number; s3: number; s3m: number; prod: number }>();
          emData.forEach((row: any) => {
            if (!plantMap.has(row.plant_name)) {
              plantMap.set(row.plant_name, { s1: 0, s2: 0, s3: 0, s3m: 0, prod: 0 });
            }
            const e = plantMap.get(row.plant_name)!;
            const val = Number(row.co2e_value) * (row.is_to_be_subtracted === 1 ? -1 : 1);
            if (row.scope_name === "Scope 1") e.s1 += val;
            else if (row.scope_name === "Scope 2") e.s2 += val;
            else if (row.scope_name === "Scope 3 + mining") e.s3m += val;
            else if (row.scope_name === "Scope 3") e.s3 += val;
            if (row.is_product === 1) e.prod += Number(row.activity_data_value);
          });

          const production = 5000000;
          const shops = Array.from(plantMap.entries())
            .map(([name, d]) => {
              const total = d.s1 + d.s2 + d.s3 + d.s3m;
              const prod = d.prod > 0 ? d.prod : production / plantMap.size;
              return {
                shop: name,
                scope1: Math.round(d.s1),
                scope2: Math.round(d.s2),
                scope3: Math.round(d.s3),
                scope3Mining: Math.round(d.s3m),
                total: Math.round(total),
                intensity: +(total / prod).toFixed(4),
                production: Math.round(prod),
                s1Intensity: +(d.s1 / prod).toFixed(3),
                s2Intensity: +(d.s2 / prod).toFixed(3),
                s3Intensity: +(d.s3 / prod).toFixed(3),
                s3MiningIntensity: +(d.s3m / prod).toFixed(3),
              };
            })
            .sort((a, b) => b.total - a.total);

          return new Response(JSON.stringify(shops), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: plantData, error: plantError } = await supabase
          .from("plant_kpis")
          .select("*")
          .order("total_emissions", { ascending: false });
        if (plantError) throw plantError;

        const shops = (plantData ?? []).map((row: any) => ({
          shop: row.plant_name,
          scope1: Math.round(Number(row.s1_emissions)),
          scope2: Math.round(Number(row.s2_emissions)),
          scope3: Math.round(Number(row.s3_emissions)),
          scope3Mining: Math.round(Number(row.s3_mining_emissions)),
          total: Math.round(Number(row.total_emissions)),
          intensity: +Number(row.intensity).toFixed(4),
          production: Math.round(Number(row.production)),
          s1Intensity: +Number(row.s1_intensity).toFixed(3),
          s2Intensity: +Number(row.s2_intensity).toFixed(3),
          s3Intensity: +Number(row.s3_intensity).toFixed(3),
          s3MiningIntensity: +Number(row.s3_mining_intensity).toFixed(3),
        }));

        return new Response(JSON.stringify(shops), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "drivers": {
        const plant = url.searchParams.get("plant");
        const extraFilters = plant && plant !== "All"
          ? (q: any) => q.eq("plant_name", plant)
          : undefined;

        const data = await fetchEmissions(
          "driver_name, scope_name, plant_name, co2e_value, activity_data_value, is_to_be_subtracted",
          extraFilters
        );

        const driverMap = new Map<string, {
          driver: string; scope: string; shop: string;
          scope1: number; scope2: number; scope3: number;
          totalActivity: number; emissionsChange: number;
        }>();

        data.forEach((row: any) => {
          if (!driverMap.has(row.driver_name)) {
            driverMap.set(row.driver_name, {
              driver: row.driver_name,
              scope: row.scope_name,
              shop: row.plant_name,
              scope1: 0, scope2: 0, scope3: 0,
              totalActivity: 0,
              emissionsChange: 0,
            });
          }
          const entry = driverMap.get(row.driver_name)!;
          const val = Number(row.co2e_value);
          if (row.scope_name === "Scope 1") entry.scope1 += val;
          else if (row.scope_name === "Scope 2") entry.scope2 += val;
          else entry.scope3 += val;
          entry.totalActivity += Number(row.activity_data_value);
          entry.emissionsChange += val * (row.is_to_be_subtracted === 1 ? -1 : 1);
        });

        const drivers = Array.from(driverMap.values())
          .map(d => ({
            ...d,
            scope1: Math.round(d.scope1),
            scope2: Math.round(d.scope2),
            scope3: Math.round(d.scope3),
            total: Math.round(d.scope1 + d.scope2 + d.scope3),
            emissionsChange: Math.round(d.emissionsChange),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        return new Response(JSON.stringify(drivers), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "benchmarks": {
        const { data, error } = await supabase
          .from("benchmarks")
          .select("*")
          .order("intensity_value");
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action. Use: kpis, trend, shop-breakdown, drivers, benchmarks" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Dashboard API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
