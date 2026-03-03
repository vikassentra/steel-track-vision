import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!body.rows || !Array.isArray(body.rows) || body.rows.length === 0) {
      return new Response(JSON.stringify({ error: "Provide a 'rows' array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rows = body.rows;
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
