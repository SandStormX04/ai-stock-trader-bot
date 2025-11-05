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

  // Format data based on selected interval
  const getChartData = () => {
    let dataPoints = 60;

    switch (interval) {
      case "1min":
        dataPoints = 60;
        break;
      case "1day":
        dataPoints = 24 * 60; // attempt last 24h (minute data if available)
        break;
      case "1week":
        dataPoints = 7 * 24 * 60; // attempt last 7 days
        break;
      case "1month":
        dataPoints = 30 * 24 * 60; // attempt last 30 days
        break;
      case "1year":
        dataPoints = data.length; // show all available
        break;
      default:
        dataPoints = 60;
    }

    return data.slice(-dataPoints).map((candle) => ({
      timestamp: new Date(candle.time).getTime(),
      price: candle.close,
      high: candle.high,
      low: candle.low,
    }));
  };

  const chartData = getChartData();
  const rangeMs = chartData.length ? chartData[chartData.length - 1].timestamp - chartData[0].timestamp : 0;

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
    const DAY = 24 * 60 * 60 * 1000;
    switch (interval) {
      case "1min":
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "1day":
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      case "1week":
        return rangeMs < DAY
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
      case "1month":
        return rangeMs < DAY
          ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : d.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1year":
        if (rangeMs < 30 * DAY) {
          return d.toLocaleDateString([], { month: "short", day: "numeric" });
        }
        return d.toLocaleDateString([], { month: "short", year: "numeric" });
      default:
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
