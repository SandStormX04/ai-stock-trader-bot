import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: CandlestickData[];
}

const StockChart = ({ data }: StockChartProps) => {
  // Format data for 1-minute intervals
  const getChartData = () => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const buckets = new Map<
      number,
      { timestamp: number; price: number; high: number; low: number; volume: number }
    >();

    for (const c of sorted) {
      const d = new Date(c.time);
      const m = new Date(d);
      m.setSeconds(0, 0);
      const key = m.getTime();
      
      const prev = buckets.get(key);
      if (!prev) {
        buckets.set(key, {
          timestamp: key,
          price: c.close,
          high: c.high,
          low: c.low,
          volume: c.volume,
        });
      } else {
        prev.high = Math.max(prev.high, c.high);
        prev.low = Math.min(prev.low, c.low);
        prev.price = c.close;
        prev.volume += c.volume;
      }
    }

    const arr = Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp);
    return arr.slice(-60); // last 60 minutes
  };

  const chartData = getChartData();

  const formatTickLabel = (value: number) => {
    const d = new Date(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="p-6 border-primary/20">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">1-Minute Chart (Last Hour)</h3>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["auto", "auto"]}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => formatTickLabel(value as number)}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            labelFormatter={(value) => formatTickLabel(value as number)}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            name="Close Price"
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke="hsl(var(--success))"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="High"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="hsl(var(--danger))"
            strokeWidth={1}
            strokeDasharray="3 3"
            dot={false}
            name="Low"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StockChart;
