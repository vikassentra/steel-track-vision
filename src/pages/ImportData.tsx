import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ImportData = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cleanNumber = (val: any): number => {
    if (val === null || val === undefined || val === "") return 0;
    if (typeof val === "number") return val;
    const s = String(val).replace(/,/g, "");
    const n = Number(s);
    return isNaN(n) ? 0 : n;
  };

  const parseTimestamp = (raw: any): string => {
    if (!raw) return "2023-01-01";
    const s = String(raw).trim();
    const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const [, yyyy, mm, dd] = isoMatch;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    const parts = s.split(" ")[0].split("/");
    if (parts.length === 3) {
      const [mm, dd, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    }
    return s.substring(0, 10);
  };

  const getVal = (row: any, ...names: string[]): any => {
    const rowKeys = Object.keys(row);
    for (const n of names) {
      if (row[n] !== undefined && row[n] !== null) return row[n];
      const found = rowKeys.find(k => k.trim().toLowerCase() === n.trim().toLowerCase());
      if (found && row[found] !== undefined && row[found] !== null) return row[found];
    }
    return null;
  };

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast({ title: "Select a file first" }); return; }

    setLoading(true);
    setStatus("Parsing Excel locally...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = "WSA_OrgData";
      const ws = wb.Sheets[sheetName];
      if (!ws) throw new Error(`Sheet "${sheetName}" not found. Available: ${wb.SheetNames.join(", ")}`);

      const rawRows: any[] = XLSX.utils.sheet_to_json(ws);
      setStatus(`Parsed ${rawRows.length} rows, mapping columns...`);

      const rows = rawRows.map((r: any) => ({
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

      setStatus(`Uploading ${rows.length} rows to backend...`);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-orgdata`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rows }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed");

      setStatus(`✅ Successfully imported ${result.inserted} rows!`);
      toast({ title: "Import complete", description: `${result.inserted} rows imported` });
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full space-y-4">
        <h1 className="text-xl font-bold text-foreground">Import OrgData</h1>
        <p className="text-sm text-muted-foreground">
          Upload the Excel file with WSA_OrgData tab to replace all emissions data.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer"
        />
        <Button onClick={handleImport} disabled={loading} className="w-full">
          {loading ? "Importing..." : "Import Data"}
        </Button>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </div>
    </div>
  );
};

export default ImportData;
