import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
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

const ShortTermStocksChart = () => {
  // Day trading opportunities - mix of volatile stocks with intraday profit potential
  const topStocks: StockPerformance[] = [
    { symbol: "TSLA", potentialProfit: 4.2, confidence: 79 },
    { symbol: "AMD", potentialProfit: 3.8, confidence: 74 },
    { symbol: "RIVN", potentialProfit: 3.5, confidence: 68 },
    { symbol: "MARA", potentialProfit: 3.2, confidence: 71 },
    { symbol: "SNAP", potentialProfit: 2.9, confidence: 66 },
    { symbol: "DKNG", potentialProfit: 2.7, confidence: 73 },
    { symbol: "HOOD", potentialProfit: 2.5, confidence: 69 },
    { symbol: "SOFI", potentialProfit: 2.3, confidence: 67 },
  ];

  return (
    <Card className="p-6 border-primary/20">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-warning" />
          Short Term Profit (Day Trading)
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          High-volatility stocks for intraday trading opportunities
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
              fill="hsl(var(--warning))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {topStocks.map((stock) => (
            <div key={stock.symbol} className="flex items-center justify-between text-sm">
              <span className="font-medium">{stock.symbol}</span>
              <div className="flex items-center gap-3">
                <span className="text-warning font-semibold">+{stock.potentialProfit}%</span>
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

export default ShortTermStocksChart;
