import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (action) {
      case "kpis": {
        const { data, error } = await supabase
          .from("kpi_values")
          .select("*");
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
        // Monthly emissions aggregated by scope
        const { data, error } = await supabase
          .from("emissions_data")
          .select("timestamp, scope_name, co2e_value, is_to_be_subtracted")
          .eq("is_accepted", 1)
          .order("timestamp");
        if (error) throw error;

        // Aggregate by month
        const monthlyMap = new Map<string, { scope1: number; scope2: number; scope3: number }>();
        data.forEach((row: any) => {
          const month = row.timestamp.substring(0, 7); // YYYY-MM
          if (!monthlyMap.has(month)) {
            monthlyMap.set(month, { scope1: 0, scope2: 0, scope3: 0 });
          }
          const entry = monthlyMap.get(month)!;
          const val = Number(row.co2e_value) * (row.is_to_be_subtracted === 1 ? -1 : 1);
          if (row.scope_name === "Scope 1") entry.scope1 += val;
          else if (row.scope_name === "Scope 2") entry.scope2 += val;
          else if (row.scope_name === "Scope 3" || row.scope_name === "Scope 3 + mining") entry.scope3 += val;
        });

        // Get production from KPI (5M/12 per month)
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
        // Use pre-calculated plant KPIs from the Formula tab
        const { data: plantData, error: plantError } = await supabase
          .from("plant_kpis")
          .select("*")
          .order("total_emissions", { ascending: false });
        if (plantError) throw plantError;

        const shops = (plantData ?? []).map((row: any) => {
          const prod = Number(row.production);
          return {
            shop: row.plant_name,
            scope1: Math.round(Number(row.s1_intensity) * prod),
            scope2: Math.round(Number(row.s2_intensity) * prod),
            scope3: Math.round((Number(row.s3_intensity) + Number(row.s3_mining_intensity)) * prod),
            total: Math.round(Number(row.total_emissions)),
            intensity: +Number(row.intensity).toFixed(4),
          };
        });

        return new Response(JSON.stringify(shops), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "drivers": {
        // Top drivers by emissions
        const { data, error } = await supabase
          .from("emissions_data")
          .select("driver_name, scope_name, plant_name, co2e_value, activity_data_value, is_to_be_subtracted")
          .eq("is_accepted", 1);
        if (error) throw error;

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
