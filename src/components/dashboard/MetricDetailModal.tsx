import { useState, useMemo } from "react";
import { X, AlertCircle, CheckCircle, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

interface MetricDetailModalProps {
  metric: { title: string; value: string; unit: string; delta: number } | null;
  onClose: () => void;
}

const LOWER_LIMIT = 4;
const UPPER_LIMIT = 8;

const generateTrend = () =>
  Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 1, i + 1);
    const day = date.toLocaleDateString("en", { month: "short", day: "numeric" });
    return { date: day, share: +(Math.random() * 8 + 2).toFixed(1) };
  });

const MetricDetailModal = ({ metric, onClose }: MetricDetailModalProps) => {
  const [trendMode, setTrendMode] = useState<"cons" | "spCons">("cons");
  const [commentingDay, setCommentingDay] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const trend = useMemo(() => generateTrend(), []);

  if (!metric) return null;

  const breachedDays = trend.filter(d => d.share < LOWER_LIMIT || d.share > UPPER_LIMIT);

  const historicalData = [
    { period: "FY 24", cons: "16.8 t", spCons: "0.39 t/t" },
    { period: "FY 25", cons: "17.5 t", spCons: "0.41 t/t" },
    { period: "FY 26 A", cons: "18.0 t", spCons: "0.42 t/t" },
    { period: "FY 26 B", cons: "17.2 t", spCons: "0.40 t/t" },
    { period: "Prev Mo", cons: "18.6 t", spCons: "0.43 t/t" },
    { period: "Best in Class", cons: "14.2 t", spCons: "0.34 t/t" },
  ];

  const flags = [
    { type: "ok", text: "Data received on time" },
    { type: "warning", text: "Manual override detected for Feb 26" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/70" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Metric Detail: {metric.title}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
            <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Current Value */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Current Value</p>
            <p className="text-sm font-semibold text-foreground font-mono">{metric.value} {metric.unit}</p>
            <p className={`text-[10px] font-mono mt-0.5 ${metric.delta > 0 ? "text-chart-negative" : "text-chart-positive"}`}>
              {metric.delta > 0 ? "+" : ""}{metric.delta}% vs prev day
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Specific Consumption</p>
            <p className="text-sm font-semibold text-foreground font-mono">0.42 t/t-steel</p>
            <p className="text-[10px] font-mono mt-0.5 text-chart-negative">+2.1% vs prev day</p>
          </div>
          <div className="bg-secondary rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">EF (kgCO2/unit)</p>
            <p className="text-sm font-semibold text-foreground font-mono">2.86</p>
            <p className="text-[9px] text-muted-foreground mt-1">Source: IPCC 2019</p>
          </div>
        </div>

        {/* Trend + Breach */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Last 30 days trend</p>
              <div className="flex items-center bg-secondary rounded-md p-0.5">
                <button onClick={() => setTrendMode("cons")} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${trendMode === "cons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Cons./Prod.</button>
                <button onClick={() => setTrendMode("spCons")} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${trendMode === "spCons" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Sp. Cons</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: "hsl(215 15% 55%)" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} unit="%" />
                <Tooltip contentStyle={{ background: "hsl(220 18% 15%)", border: "1px solid hsl(220 15% 22%)", borderRadius: 8, fontSize: 12 }} formatter={(value: number) => { const breached = value < LOWER_LIMIT || value > UPPER_LIMIT; return [`${value}%${breached ? " ⚠ Outside limits" : ""}`, "Share"]; }} />
                <ReferenceLine y={UPPER_LIMIT} stroke="hsl(0 70% 55%)" strokeDasharray="6 3" label={{ value: "Upper", position: "right", fontSize: 9, fill: "hsl(0 70% 55%)" }} />
                <ReferenceLine y={LOWER_LIMIT} stroke="hsl(35 90% 55%)" strokeDasharray="6 3" label={{ value: "Lower", position: "right", fontSize: 9, fill: "hsl(35 90% 55%)" }} />
                <Bar dataKey="share" radius={[2, 2, 0, 0]}>
                  {trend.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.share < LOWER_LIMIT || entry.share > UPPER_LIMIT ? "hsl(0 70% 55%)" : "hsl(168 70% 50%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {breachedDays.length > 0 && (
            <div className="w-[240px] shrink-0 flex flex-col">
              <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mb-2">
                <AlertCircle className="w-3 h-3" />
                {breachedDays.length} day(s) outside limits
              </p>
              <div className="space-y-1.5 overflow-y-auto max-h-[200px] pr-1">
                {breachedDays.map((d) => (
                  <div key={d.date} className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-md px-2 py-1.5">
                    <span className="text-[10px] font-mono text-destructive font-medium min-w-[50px]">{d.date}</span>
                    <span className="text-[10px] font-mono text-destructive">{d.share}%</span>
                    {comments[d.date] ? (
                      <span className="text-[10px] text-muted-foreground flex-1 truncate ml-1">💬 {comments[d.date]}</span>
                    ) : commentingDay === d.date ? (
                      <div className="flex items-center gap-1 flex-1 ml-1">
                        <input autoFocus value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && commentDraft.trim()) { setComments(prev => ({ ...prev, [d.date]: commentDraft.trim() })); setCommentDraft(""); setCommentingDay(null); } if (e.key === "Escape") { setCommentingDay(null); setCommentDraft(""); } }} placeholder="Reason..." className="flex-1 bg-background border border-border rounded px-1.5 py-0.5 text-[10px] text-foreground outline-none focus:ring-1 focus:ring-primary" />
                        <button onClick={() => { if (commentDraft.trim()) { setComments(prev => ({ ...prev, [d.date]: commentDraft.trim() })); setCommentDraft(""); setCommentingDay(null); } }} className="text-[9px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded font-medium">Save</button>
                      </div>
                    ) : (
                      <button onClick={() => { setCommentingDay(d.date); setCommentDraft(comments[d.date] || ""); }} className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                        <MessageSquare className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Historical Comparison */}
        <div className="bg-secondary rounded-lg p-3 mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Your Value & Peer Benchmark</p>
          <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-x-3 gap-y-1 items-center text-center">
            <div />
            {historicalData.map((h) => <p key={h.period} className="text-[9px] text-muted-foreground font-medium">{h.period}</p>)}
            <p className="text-[9px] text-muted-foreground text-left">Cons.</p>
            {historicalData.map((h) => <p key={h.period + "-c"} className="text-[10px] font-semibold text-foreground font-mono">{h.cons}</p>)}
            <p className="text-[9px] text-muted-foreground text-left">Sp. Cons</p>
            {historicalData.map((h) => <p key={h.period + "-s"} className="text-[10px] font-semibold text-foreground font-mono">{h.spCons}</p>)}
          </div>
        </div>

        {/* Data Quality */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Data Quality</p>
          <div className="space-y-1.5">
            {flags.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {f.type === "ok" ? <CheckCircle className="w-3.5 h-3.5 text-chart-positive" /> : <AlertCircle className="w-3.5 h-3.5 text-accent" />}
                <span className="text-muted-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricDetailModal;
