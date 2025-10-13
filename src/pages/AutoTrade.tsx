import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const AutoTrade = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [symbol, setSymbol] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [targetProfit, setTargetProfit] = useState("");
  const [percentLoss, setPercentLoss] = useState("");
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUsername(data.username);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleStartAutoTrade = async () => {
    if (!symbol.trim() || !investmentAmount || !targetProfit || !percentLoss) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsActive(true);
    toast({
      title: "Auto Trade Started",
      description: `AI will now automatically trade ${symbol} with your parameters`,
    });

    // TODO: Implement Tradeovate API integration
    console.log("Auto trade started with:", {
      symbol,
      investmentAmount,
      targetProfit,
      percentLoss,
    });
  };

  const handleStopAutoTrade = () => {
    setIsActive(false);
    toast({
      title: "Auto Trade Stopped",
      description: "AI has stopped automatic trading",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Auto Trade
              </h1>
              <p className="text-sm text-muted-foreground">
                Automated AI Trading via Tradeovate
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {username || "Trader"}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 border-primary/20">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Stock Symbol</label>
              <Input
                type="text"
                placeholder="AAPL, GOOGL, TSLA..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                disabled={isActive}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Investment Amount ($)
              </label>
              <Input
                type="number"
                placeholder="1000"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                disabled={isActive}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Target Profit ($)
              </label>
              <Input
                type="number"
                placeholder="100"
                value={targetProfit}
                onChange={(e) => setTargetProfit(e.target.value)}
                disabled={isActive}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Maximum Loss (%)
              </label>
              <Input
                type="number"
                placeholder="5"
                value={percentLoss}
                onChange={(e) => setPercentLoss(e.target.value)}
                disabled={isActive}
                className="bg-secondary border-border"
              />
            </div>

            {!isActive ? (
              <Button
                onClick={handleStartAutoTrade}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Auto Trading
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-primary font-medium">
                    🤖 Auto Trading Active
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI is monitoring and trading {symbol} automatically
                  </p>
                </div>
                <Button
                  onClick={handleStopAutoTrade}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Auto Trading
                </Button>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note:</strong> Auto trading uses your Tradeovate credentials to
                execute trades automatically based on AI analysis. The AI will buy and
                sell within your specified parameters.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AutoTrade;
