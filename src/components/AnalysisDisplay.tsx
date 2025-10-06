import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Analysis {
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  indicators: string[];
  reasoning: string;
}

interface AnalysisDisplayProps {
  analysis: Analysis;
}

const AnalysisDisplay = ({ analysis }: AnalysisDisplayProps) => {
  const getRecommendationColor = () => {
    switch (analysis.recommendation) {
      case "BUY":
        return "bg-success text-success-foreground";
      case "SELL":
        return "bg-danger text-danger-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRecommendationIcon = () => {
    switch (analysis.recommendation) {
      case "BUY":
        return <TrendingUp className="h-5 w-5" />;
      case "SELL":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  return (
    <Card className="p-6 border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">AI Recommendation</h3>
        <Badge className={`${getRecommendationColor()} flex items-center gap-1 px-4 py-2`}>
          {getRecommendationIcon()}
          {analysis.recommendation}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-semibold text-lg">{analysis.confidence}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${analysis.confidence}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Key Indicators</h4>
        <div className="flex flex-wrap gap-2">
          {analysis.indicators.map((indicator, index) => (
            <Badge key={index} variant="outline" className="border-primary/30">
              {indicator}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Analysis</h4>
        <p className="text-muted-foreground leading-relaxed">{analysis.reasoning}</p>
      </div>
    </Card>
  );
};

export default AnalysisDisplay;
