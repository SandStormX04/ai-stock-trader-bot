import { useState } from "react";
import * as React from "react";
import { Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StockChart from "@/components/StockChart";
import AnalysisDisplay from "@/components/AnalysisDisplay";

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Analysis {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  indicators: string[];
  reasoning: string;
}

interface StockData {
  symbol: string;
  currentPrice: number;
  priceChange: number;
  candlestickData: CandlestickData[];
  analysis: Analysis;
  timestamp: string;
}

const Index = () => {
  const [symbol, setSymbol] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true); // Always on
  const [countdown, setCountdown] = useState(20); // 20 seconds
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [targetProfit, setTargetProfit] = useState("");
  const [percentLoss, setPercentLoss] = useState("");
  const [boughtMode, setBoughtMode] = useState(false);
  const [initialPrice, setInitialPrice] = useState(0);
  const { toast } = useToast();

  const analyzeStock = async () => {
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCountdown(20);
    console.log("Analyzing stock:", symbol.toUpperCase());

    try {
      const { data, error } = await supabase.functions.invoke("stock-analysis", {
        body: { 
          symbol: symbol.toUpperCase(),
          investmentAmount: investmentAmount ? parseFloat(investmentAmount) : undefined,
          targetProfit: targetProfit ? parseFloat(targetProfit) : undefined,
          boughtMode: boughtMode,
          initialPrice: boughtMode ? initialPrice : undefined,
        },
      });

      if (error) throw error;

      console.log("Analysis complete:", data);
      setStockData(data);

      toast({
        title: "Analysis Complete",
        description: `${data.symbol} analyzed successfully`,
      });
    } catch (error: any) {
      console.error("Error analyzing stock:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBought = async () => {
    if (!stockData || !investmentAmount || !targetProfit || !percentLoss) {
      toast({
        title: "Error",
        description: "Please enter investment amount, target profit, and percent loss",
        variant: "destructive",
      });
      return;
    }
    
    // Record the buy in database
    const { data: tradeData, error: tradeError } = await supabase
      .from('trades')
      .insert({
        symbol: stockData.symbol,
        action: 'BUY',
        buy_price: stockData.currentPrice,
        investment_amount: parseFloat(investmentAmount),
        target_profit: parseFloat(targetProfit),
        percent_loss: parseFloat(percentLoss),
        ai_recommendation: stockData.analysis.recommendation,
        ai_confidence: stockData.analysis.confidence,
        bought_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (tradeError) {
      console.error("Error recording trade:", tradeError);
    } else {
      setCurrentTradeId(tradeData.id);
    }

    setBoughtMode(true);
    setInitialPrice(stockData.currentPrice);
    setCountdown(20);
  };

  const handleSold = async () => {
    if (currentTradeId && stockData) {
      const invested = parseFloat(investmentAmount);
      const sharesOwned = Math.floor(invested / initialPrice);
      const currentValue = sharesOwned * stockData.currentPrice;
      const actualProfit = currentValue - invested;

      // Update the trade record
      await supabase
        .from('trades')
        .update({
          action: 'SELL',
          sell_price: stockData.currentPrice,
          actual_profit: actualProfit,
          sold_at: new Date().toISOString(),
        })
        .eq('id', currentTradeId);
    }

    setBoughtMode(false);
    setInitialPrice(0);
    setCurrentTradeId(null);
    toast({
      title: "Position Closed",
      description: "Stock sold successfully",
    });
  };

  // Auto-refresh effect - always on, 20 second intervals
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let countdownId: NodeJS.Timeout;

    if (symbol && stockData) {
      intervalId = setInterval(() => {
        analyzeStock();
      }, 20000); // 20 seconds

      countdownId = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 20));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (countdownId) clearInterval(countdownId);
    };
  }, [symbol, stockData, boughtMode]);

  // Calculate if target profit is reached or loss limit hit
  const calculateAction = () => {
    if (!stockData || !boughtMode || !investmentAmount || !targetProfit || !percentLoss) return "HOLD";
    
    const invested = parseFloat(investmentAmount);
    const target = parseFloat(targetProfit);
    const lossPercent = parseFloat(percentLoss);
    const sharesOwned = Math.floor(invested / initialPrice);
    const currentValue = sharesOwned * stockData.currentPrice;
    const currentProfit = currentValue - invested;
    const currentLossPercent = ((initialPrice - stockData.currentPrice) / initialPrice) * 100;
    
    // Target profit reached
    if (currentProfit >= target) {
      return "SELL_PROFIT";
    }
    
    // Loss limit reached
    if (currentLossPercent >= lossPercent) {
      return "SELL_LOSS";
    }
    
    return "HOLD";
  };

  const action = calculateAction();

  // Bought Mode View
  if (boughtMode && stockData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold">
              {action === "SELL_PROFIT" ? (
                <span className="text-success">SELL, PROFIT</span>
              ) : action === "SELL_LOSS" ? (
                <span className="text-danger">SELL, LOSS</span>
              ) : (
                <span className="text-primary">HOLD</span>
              )}
            </h1>
            <div className="text-xl text-muted-foreground">
              {stockData.symbol} • ${stockData.currentPrice.toFixed(2)}
            </div>
            <div className="text-lg">
              Confidence: <span className="font-bold text-primary">{stockData.analysis.confidence}%</span>
            </div>
          </div>
          
          <div className="space-y-4 max-w-md mx-auto">
            <Card className="p-4 bg-secondary/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Initial Price</div>
                  <div className="font-bold">${initialPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-bold">${stockData.currentPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Investment</div>
                  <div className="font-bold">${investmentAmount}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Target Profit</div>
                  <div className="font-bold">${targetProfit}</div>
                </div>
              </div>
            </Card>
            
            <div className="text-sm text-muted-foreground">
              Next update in {countdown}s
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleSold}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Sold
            </Button>
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              {stockData.analysis.reasoning}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal Mode View
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            AI Stock Trader
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time candlestick analysis powered by AI
          </p>
        </div>

        {/* Search */}
        <Card className="p-6 border-primary/20">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter stock symbol (e.g., AAPL, TSLA, MSFT)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && analyzeStock()}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
              <Button
                onClick={analyzeStock}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
            
            {stockData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Investment Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Profit ($)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 100"
                      value={targetProfit}
                      onChange={(e) => setTargetProfit(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Percent Loss (%)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 5"
                      value={percentLoss}
                      onChange={(e) => setPercentLoss(e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      <span>Auto-updating every 20s • Next in {countdown}s</span>
                    </div>
                  </div>
                  {(investmentAmount || targetProfit || percentLoss) && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={analyzeStock}
                        disabled={loading}
                      >
                        Update Analysis
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleBought}
                        disabled={loading || !investmentAmount || !targetProfit || !percentLoss}
                        className="bg-white text-black hover:bg-white/90 border-2 border-primary font-semibold"
                      >
                        Bought
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {stockData && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Price Info */}
            <Card className="p-6 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{stockData.symbol}</h2>
                  <div
                    className={`flex items-center gap-1 ${
                      stockData.priceChange >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {stockData.priceChange >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span className="font-semibold">
                      {stockData.priceChange >= 0 ? "+" : ""}
                      {stockData.priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-4xl font-bold">
                  ${stockData.currentPrice.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(stockData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Card>

            {/* AI Analysis */}
            <AnalysisDisplay analysis={stockData.analysis} />
          </div>
        )}

        {/* Chart */}
        {stockData && <StockChart data={stockData.candlestickData} />}
      </div>
    </div>
  );
};

export default Index;
