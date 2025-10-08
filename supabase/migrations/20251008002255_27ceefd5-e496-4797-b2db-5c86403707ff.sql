-- Create trades table to store buy/sell decisions
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  buy_price DECIMAL,
  sell_price DECIMAL,
  investment_amount DECIMAL,
  target_profit DECIMAL,
  percent_loss DECIMAL,
  actual_profit DECIMAL,
  ai_recommendation TEXT,
  ai_confidence INTEGER,
  bought_at TIMESTAMP WITH TIME ZONE,
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups by symbol
CREATE INDEX idx_trades_symbol ON public.trades(symbol);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);

-- Enable Row Level Security (RLS) - make it public for this demo
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo purposes
CREATE POLICY "Allow public read access" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.trades FOR UPDATE USING (true);