const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol, investmentAmount, targetProfit, boughtMode, initialPrice } = await req.json()
    console.log('Analyzing stock:', symbol, 'Investment:', investmentAmount, 'Target Profit:', targetProfit, 'Bought Mode:', boughtMode)

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    // Fetch recent trades for learning (user-specific)
    console.log('Fetching recent trades for learning...')
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trades')
      .select('*')
      .eq('symbol', symbol)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (tradesError) {
      console.error('Error fetching trades:', tradesError)
    } else {
      console.log(`Found ${recentTrades?.length || 0} recent trades for ${symbol}`)
    }

    // Fetch 1-minute interval candlestick data for INTRADAY trading
    // Using 1d period with 1m intervals for day trading analysis
    const period = '1d'
    const interval = '1m'
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${period}&interval=${interval}`
    
    console.log('Fetching from Yahoo Finance:', yahooUrl)
    
    const yahooResponse = await fetch(yahooUrl)
    const yahooData = await yahooResponse.json()

    if (!yahooData.chart?.result?.[0]) {
      throw new Error('Invalid stock symbol or no data available')
    }

    const result = yahooData.chart.result[0]
    const quote = result.indicators.quote[0]
    const timestamps = result.timestamp

    // Format candlestick data
    const candlestickData = timestamps.map((timestamp: number, index: number) => ({
      time: new Date(timestamp * 1000).toISOString(),
      open: quote.open[index],
      high: quote.high[index],
      low: quote.low[index],
      close: quote.close[index],
      volume: quote.volume[index]
    })).filter((candle: any) => candle.open !== null)

    console.log(`Retrieved ${candlestickData.length} candles`)

    // Prepare AI analysis
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Create summary of recent data for AI
    const recentCandles = candlestickData.slice(-30) // Last 30 minutes
    const currentPrice = recentCandles[recentCandles.length - 1].close
    const priceChange = ((currentPrice - recentCandles[0].open) / recentCandles[0].open) * 100

    let investmentContext = ''
    if (investmentAmount && targetProfit) {
      const priceToUse = boughtMode && initialPrice ? initialPrice : currentPrice
      const sharesOwned = Math.floor(investmentAmount / priceToUse)
      const targetPricePerShare = priceToUse + (targetProfit / sharesOwned)
      const percentGainNeeded = ((targetPricePerShare - currentPrice) / currentPrice) * 100
      
      if (boughtMode && initialPrice) {
        const currentValue = sharesOwned * currentPrice
        const currentProfit = currentValue - investmentAmount
        const profitPercent = (currentProfit / investmentAmount) * 100
        
        investmentContext = `

ACTIVE POSITION (BOUGHT MODE - BE EXTREMELY CAREFUL):
- Shares Owned: ${sharesOwned}
- Entry Price: $${initialPrice.toFixed(2)}
- Current Price: $${currentPrice.toFixed(2)}
- Investment: $${investmentAmount.toFixed(2)}
- Current Value: $${currentValue.toFixed(2)}
- Current Profit/Loss: $${currentProfit.toFixed(2)} (${profitPercent.toFixed(2)}%)
- Target Profit: $${targetProfit.toFixed(2)}
- Target Price: $${targetPricePerShare.toFixed(2)}
- Gain Still Needed: ${percentGainNeeded.toFixed(2)}%

CRITICAL: User has real money invested. Analyze carefully whether to HOLD or SELL.`
      } else {
        investmentContext = `

Investment Analysis:
- Investment Amount: $${investmentAmount.toFixed(2)}
- Shares Purchasable: ${sharesOwned}
- Target Profit: $${targetProfit.toFixed(2)}
- Target Price per Share: $${targetPricePerShare.toFixed(2)}
- Gain Needed: ${percentGainNeeded.toFixed(2)}%`
      }
    }

    // Build learning context from past trades
    let learningContext = ''
    if (recentTrades && recentTrades.length > 0) {
      learningContext = `

📊 HISTORICAL LEARNING DATA FOR ${symbol}:
You have access to ${recentTrades.length} recent trades. Learn from these patterns:

`
      recentTrades.forEach((trade: any, idx: number) => {
        learningContext += `Trade ${idx + 1} (${new Date(trade.bought_at).toLocaleDateString()}):
  - Action: ${trade.action}
  - Buy Price: $${trade.buy_price || 'N/A'}
  - Sell Price: $${trade.sell_price || 'N/A'}
  - Actual Profit: $${trade.actual_profit !== null ? trade.actual_profit.toFixed(2) : 'N/A'} ${trade.actual_profit !== null ? (trade.actual_profit >= 0 ? '(WIN ✓)' : '(LOSS ✗)') : ''}
  - AI Recommendation: ${trade.ai_recommendation} (${trade.ai_confidence}% confidence)
  - Investment: $${trade.investment_amount}
  - Target Profit: $${trade.target_profit}

`
      })
      learningContext += `IMPORTANT: Use these past trades to identify what worked and what didn't. Adjust your analysis accordingly.
`
    }

    const modeContext = boughtMode 
      ? `

⚠️ BOUGHT MODE ACTIVE ⚠️
The user has ALREADY INVESTED real money in this position. Your recommendation should ONLY be HOLD or SELL.
- If target profit is reached or close, recommend SELL
- If you detect strong bearish signals that suggest the stock won't reach the target, recommend SELL to minimize losses
- Otherwise, recommend HOLD
Be VERY CAREFUL and CONSERVATIVE. Provide high confidence (80-95%) for clear signals.`
      : '';

    const prompt = `You are a DAY TRADING analyst with learning capabilities. This is INTRADAY analysis - all positions must be closed TODAY. Analyze this 1-minute candlestick data for ${symbol}:
${learningContext}

Current Price: $${currentPrice.toFixed(2)}
Price Change (last 30 min): ${priceChange.toFixed(2)}%${investmentContext}${modeContext}

Recent Candles (last 30 minutes):
${recentCandles.map((c: any) => `Time: ${c.time}, O: ${c.open?.toFixed(2)}, H: ${c.high?.toFixed(2)}, L: ${c.low?.toFixed(2)}, C: ${c.close?.toFixed(2)}, Vol: ${c.volume}`).join('\n')}

⚠️ DAY TRADING RULES:
- All positions MUST be closed before market close (4:00 PM ET)
- Focus on SHORT-TERM price movements and momentum
- Look for quick profit opportunities within the trading day
- Avoid holding positions overnight
- Consider time of day and remaining trading hours

Based on this INTRADAY candlestick pattern analysis${investmentAmount && targetProfit ? ' and the investment goals' : ''}, provide:
1. A clear ${boughtMode ? 'HOLD or SELL' : 'BUY, SELL, or HOLD'} recommendation FOR TODAY${investmentAmount && targetProfit ? ' considering whether the target profit is realistic within TODAY\'S trading session' : ''}
2. Confidence level (${boughtMode ? '80-95% - be precise and confident' : '0-100%'})
3. Key technical indicators you observe (focus on short-term momentum, volume, support/resistance)
4. Brief reasoning (2-3 sentences) including INTRADAY viability${investmentAmount && targetProfit ? ' and assessment of the target profit feasibility within today\'s session' : ''}

Format your response as JSON:
{
  "recommendation": "${boughtMode ? 'HOLD" | "SELL' : 'BUY" | "SELL" | "HOLD'}",
  "confidence": number,
  "indicators": string[],
  "reasoning": string
}`

    console.log('Calling Lovable AI for analysis...')

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert DAY TRADING analyst specializing in INTRADAY technical analysis of candlestick patterns. You focus on short-term price movements, momentum, and quick profit opportunities within a single trading day. You NEVER recommend holding positions overnight.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI analysis failed: ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const aiContent = aiData.choices[0].message.content

    console.log('AI response:', aiContent)

    // Parse AI response
    let analysis
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      // Fallback analysis
      analysis = {
        recommendation: 'HOLD',
        confidence: 50,
        indicators: ['Unable to parse AI response'],
        reasoning: 'Analysis could not be completed. Please try again.'
      }
    }

    return new Response(
      JSON.stringify({
        symbol,
        currentPrice,
        priceChange,
        candlestickData,
        analysis,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in stock-analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
