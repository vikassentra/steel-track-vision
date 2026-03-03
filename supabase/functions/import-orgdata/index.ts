import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseTimestamp(raw: string): string {
  // Handle DD/MM/YYYY HH:mm:ss format
  if (!raw) return "2023-01-01";
  const parts = raw.split(" ")[0].split("/");
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return raw.substring(0, 10);
}

function cleanNumber(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  // Handle comma-formatted numbers like "209,109"
  const s = String(val).replace(/,/g, "");
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();

    let rows: any[];

    if (body.base64) {
      // Parse Excel from base64
      const binary = Uint8Array.from(atob(body.base64), c => c.charCodeAt(0));
      const wb = XLSX.read(binary, { type: "array" });
      const sheetName = body.sheet || "WSA_OrgData";
      const ws = wb.Sheets[sheetName];
      if (!ws) {
        return new Response(JSON.stringify({ error: `Sheet "${sheetName}" not found. Available: ${wb.SheetNames.join(", ")}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws);
      console.log(`Parsed ${rawRows.length} rows from sheet "${sheetName}"`);
      if (rawRows.length > 0) {
        const keys = Object.keys(rawRows[0]);
        console.log("Column names:", JSON.stringify(keys));
        console.log("First row values:", JSON.stringify(rawRows[0]));
      }

      // Helper to find a column value by trying multiple name variants (handles spaces in Excel headers)
      const getVal = (row: any, ...names: string[]): any => {
        const rowKeys = Object.keys(row);
        for (const n of names) {
          // Exact match
          if (row[n] !== undefined && row[n] !== null) return row[n];
          // Try trimmed + case-insensitive match
          const found = rowKeys.find(k => k.trim().toLowerCase() === n.trim().toLowerCase());
          if (found && row[found] !== undefined && row[found] !== null) return row[found];
        }
        return null;
      };

      // Map Excel columns to DB columns
      rows = rawRows.map((r: any) => ({
        driver_name: getVal(r, "ScopeDriverName", "Scope Driver Name", "DriverName") || "Unknown",
        scope_category_name: getVal(r, "ScopeCategoryName", "Scope Category Name") || "",
        scope_name: getVal(r, "ScopeName", "Scope Name") || "",
        plant_name: getVal(r, "LevelGOrgPlantName", "Level G Org Plant Name", "PlantName") || "",
        facility_name: getVal(r, "LevelFOrgFacilityName", "Level F Org Facility Name", "FacilityName") || "",
        activity_data_value: cleanNumber(getVal(r, "ActivityDataValue", "Activity Data Value")),
        timestamp: parseTimestamp(getVal(r, "Timestamp", "timestamp") || ""),
        co2e_value: cleanNumber(getVal(r, "CO2e_Value", "CO2eValue", "CO2e Value", "CO2e_value")),
        is_product: cleanNumber(getVal(r, "IsProduct", "Is Product")),
        is_to_be_subtracted: cleanNumber(getVal(r, "IsToBeSubstracted", "IsToBeSubtracted", "Is To Be Subtracted")),
        is_accepted: cleanNumber(getVal(r, "IsAccepted", "Is Accepted")),
        emission_factor: cleanNumber(getVal(r, "EmissionFactor", "Emission Factor")),
        ef_unit: getVal(r, "EF_Unit", "EF Unit", "EFUnit") || null,
        ef_source: getVal(r, "EF_Source", "EF Source", "EFSource") || null,
        user_type: getVal(r, "UserType", "User Type") || null,
        source: getVal(r, "Source", "source") || null,
      }));

      // Log a sample mapped row
      if (rows.length > 0) {
        console.log("First mapped row:", JSON.stringify(rows[0]));
      }
    } else if (body.rows && Array.isArray(body.rows)) {
      rows = body.rows;
    } else {
      return new Response(JSON.stringify({ error: "Provide 'base64' (Excel) or 'rows' array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Importing ${rows.length} rows...`);

    // Delete existing data
    const { error: delError } = await supabase
      .from("emissions_data")
      .delete()
      .gte("id", 0);
    if (delError) throw delError;
    console.log("Deleted existing data");

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from("emissions_data").insert(batch);
      if (error) {
        console.error(`Batch ${i} error:`, error);
        throw error;
      }
      inserted += batch.length;
    }

    console.log(`Successfully inserted ${inserted} rows`);

    return new Response(
      JSON.stringify({ success: true, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Import error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
