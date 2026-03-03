import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ImportData = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast({ title: "Select a file first" }); return; }

    setLoading(true);
    setStatus("Reading Excel...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );

      setStatus("Uploading to backend...");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-orgdata`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ base64, sheet: "WSA_OrgData" }),
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
