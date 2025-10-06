import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()
    console.log('Analyzing stock:', symbol)

    // Fetch 1-minute interval candlestick data for the last day
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

    const prompt = `You are a stock trading analyst. Analyze this 1-minute candlestick data for ${symbol}:

Current Price: $${currentPrice.toFixed(2)}
Price Change (last 30 min): ${priceChange.toFixed(2)}%

Recent Candles (last 30 minutes):
${recentCandles.map(c => `Time: ${c.time}, O: ${c.open?.toFixed(2)}, H: ${c.high?.toFixed(2)}, L: ${c.low?.toFixed(2)}, C: ${c.close?.toFixed(2)}, Vol: ${c.volume}`).join('\n')}

Based on this candlestick pattern analysis, provide:
1. A clear BUY, SELL, or HOLD recommendation
2. Confidence level (0-100%)
3. Key technical indicators you observe
4. Brief reasoning (2-3 sentences)

Format your response as JSON:
{
  "recommendation": "BUY" | "SELL" | "HOLD",
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
            content: 'You are an expert stock trading analyst specializing in technical analysis of candlestick patterns.' 
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
