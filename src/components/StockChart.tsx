import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";

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
  const [interval, setInterval] = useState<string>("1min");

  // Format data based on selected interval using bucketing
  const getChartData = () => {
    const sorted = [...data].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const getBucketStart = (d: Date) => {
      switch (interval) {
        case "1min": {
          const m = new Date(d);
          m.setSeconds(0, 0);
          return m.getTime();
        }
        case "1day":
          return startOfDay(d).getTime();
        case "1week":
          return startOfWeek(d, { weekStartsOn: 1 }).getTime();
        case "1month":
          return startOfMonth(d).getTime();
        case "1year":
          return startOfYear(d).getTime();
        default:
          return d.getTime();
      }
    };

    const buckets = new Map<
      number,
      { timestamp: number; price: number; high: number; low: number; volume: number }
    >();

    for (const c of sorted) {
      const d = new Date(c.time);
      const key = getBucketStart(d);
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
        prev.price = c.close; // last close in bucket
        prev.volume += c.volume;
      }
    }

    const arr = Array.from(buckets.values());
    if (interval === "1min") {
      return arr.slice(-60); // last 60 minutes
    }
    return arr;
  };

  const chartData = getChartData();

  const getChartTitle = () => {
    switch (interval) {
      case "1min":
        return "1-Minute Chart";
      case "1day":
        return "1-Day Chart";
      case "1week":
        return "1-Week Chart";
      case "1month":
        return "1-Month Chart";
      case "1year":
        return "1-Year Chart";
      default:
        return "Chart";
    }
  };

  const formatTickLabel = (value: number) => {
    const d = new Date(value);
    switch (interval) {
      case "1min":
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "1day":
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1week":
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1month":
        return d.toLocaleDateString([], { month: "short", year: "numeric" });
      case "1year":
        return d.toLocaleDateString([], { year: "numeric" });
      default:
        return d.toLocaleString();
    }
  };

  return (
    <Card className="p-6 border-primary/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{getChartTitle()}</h3>
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1min">1 Minute</SelectItem>
            <SelectItem value="1day">1 Day</SelectItem>
            <SelectItem value="1week">1 Week</SelectItem>
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
          </SelectContent>
        </Select>
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
