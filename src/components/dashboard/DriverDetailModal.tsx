import { X, AlertCircle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DriverDetailModalProps {
  driver: string | null;
  onClose: () => void;
}

// Generate mock daily trend for a driver
const generateDriverTrend = () =>
  Array.from({ length: 14 }, (_, i) => ({
    date: `Feb ${i + 15}`,
    value: 200 + Math.random() * 100,
  }));

const DriverDetailModal = ({ driver, onClose }: DriverDetailModalProps) => {
  if (!driver) return null;

  const trend = generateDriverTrend();

  const metrics = [
    { label: "Consumption Rate", value: "0.42 t/t-steel", status: "normal" },
    { label: "Energy (kWh/t)", value: "18.3", status: "normal" },
    { label: "EF (kgCO2/unit)", value: "2.86", status: "normal" },
  ];

  const flags = [
    { type: "ok", text: "Data received on time" },
    { type: "warning", text: "Manual override detected for Feb 26" },
    { type: "ok", text: "EF source: IPCC 2019" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Driver Detail: {driver}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Trend */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Daily trend (last 14 days)</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(215 15% 55%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(220 18% 15%)",
                  border: "1px solid hsl(220 15% 22%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(168 70% 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-secondary rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-semibold text-foreground font-mono">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Data Quality Flags */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Data Quality</p>
          <div className="space-y-1.5">
            {flags.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {f.type === "ok" ? (
                  <CheckCircle className="w-3.5 h-3.5 text-chart-positive" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-accent" />
                )}
                <span className="text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDetailModal;
