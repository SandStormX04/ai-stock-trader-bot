import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, TrendingUp } from "lucide-react";

const ModeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
          Choose Your Trading Mode
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Select how you want to trade with AI
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 border-primary/20 hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate("/auto-trade")}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Auto Trade</h2>
              <p className="text-muted-foreground">
                Let AI automatically buy and sell stocks for you through Tradeovate. 
                Set your parameters and let the AI handle everything.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90">
                Start Auto Trading
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-primary/20 hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate("/trade-helper")}>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Trade Helper</h2>
              <p className="text-muted-foreground">
                Get AI-powered analysis and recommendations. 
                You make the final decision on when to buy and sell.
              </p>
              <Button className="w-full bg-success hover:bg-success/90">
                Get Trade Insights
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
