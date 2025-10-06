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
  // Format data for the chart - show last 60 minutes
  const chartData = data.slice(-60).map((candle) => ({
    time: new Date(candle.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: candle.close,
    high: candle.high,
    low: candle.low,
  }));

  return (
    <Card className="p-6 border-primary/20">
      <h3 className="text-xl font-semibold mb-4">1-Minute Chart (Last Hour)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
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
