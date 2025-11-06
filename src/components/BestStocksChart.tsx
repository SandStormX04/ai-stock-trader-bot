import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StockPerformance {
  symbol: string;
  potentialProfit: number;
  confidence: number;
}

const BestStocksChart = () => {
  // Sample data - in a real app, this would come from an API analyzing multiple stocks
  // Mix of large-cap, mid-cap, and high-growth stocks with strong profit potential
  const topStocks: StockPerformance[] = [
    { symbol: "PLTR", potentialProfit: 12.3, confidence: 82 },
    { symbol: "SMCI", potentialProfit: 10.8, confidence: 76 },
    { symbol: "COIN", potentialProfit: 9.5, confidence: 73 },
    { symbol: "ARM", potentialProfit: 8.7, confidence: 79 },
    { symbol: "AVGO", potentialProfit: 8.2, confidence: 85 },
    { symbol: "NVDA", potentialProfit: 7.9, confidence: 88 },
    { symbol: "CRWD", potentialProfit: 7.4, confidence: 74 },
    { symbol: "NET", potentialProfit: 6.8, confidence: 71 },
  ];

  return (
    <Card className="p-6 border-primary/20">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-5 w-5 text-success" />
          Top NYSE Profit Opportunities
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          High-growth stocks ranked by AI-predicted profit potential
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topStocks} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="symbol"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              label={{ 
                value: 'Potential Profit %', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              formatter={(value: number, name: string) => {
                if (name === "potentialProfit") return [`${value.toFixed(1)}%`, "Potential Profit"];
                if (name === "confidence") return [`${value}%`, "AI Confidence"];
                return [value, name];
              }}
            />
            <Bar
              dataKey="potentialProfit"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {topStocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between text-sm">
              <span className="font-medium">{stock.symbol}</span>
              <div className="flex items-center gap-3">
                <span className="text-success font-semibold">+{stock.potentialProfit}%</span>
                <span className="text-muted-foreground text-xs">
                  {stock.confidence}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BestStocksChart;
