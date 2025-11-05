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
    let formatOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    switch (interval) {
      case "1min":
        dataPoints = 60;
        break;
      case "1day":
        dataPoints = 30;
        formatOptions = { month: "short", day: "numeric" };
        break;
      case "1week":
        dataPoints = 52;
        formatOptions = { month: "short", day: "numeric" };
        break;
      case "1month":
        dataPoints = 12;
        formatOptions = { month: "short", year: "numeric" };
        break;
      case "1year":
        dataPoints = 10;
        formatOptions = { year: "numeric" };
        break;
    }

    return data.slice(-dataPoints).map((candle) => ({
      time: new Date(candle.time).toLocaleDateString([], formatOptions),
      price: candle.close,
      high: candle.high,
      low: candle.low,
    }));
  };

  const chartData = getChartData();

  const getChartTitle = () => {
    switch (interval) {
      case "1min":
        return "1-Minute Chart (Last Hour)";
      case "1day":
        return "Daily Chart (Last 30 Days)";
      case "1week":
        return "Weekly Chart (Last Year)";
      case "1month":
        return "Monthly Chart (Last Year)";
      case "1year":
        return "Yearly Chart";
      default:
        return "Chart";
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
