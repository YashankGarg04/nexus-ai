import { NextResponse } from 'next/server';

export async function handleMarketRequest(req: Request) {
  try {
    const { tokenSymbol } = await req.json();
    
    if (!tokenSymbol) {
      return NextResponse.json({ success: false, error: "No token symbol provided." }, { status: 400 });
    }

    const symbol = tokenSymbol.toUpperCase();

    // Standard, reliable fetch to CryptoCompare
    const res = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${symbol}&tsyms=USD`, { 
      headers: { 'Accept': 'application/json' },
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error(`API returned status: ${res.status}`);
    }

    const data = await res.json();

    // If the token doesn't exist in their database, RAW will be undefined
    if (!data.RAW || !data.RAW[symbol] || !data.RAW[symbol].USD) {
      return NextResponse.json({ success: false, error: `Could not find live data for ${symbol}.` });
    }
    
    const tokenData = data.RAW[symbol].USD;
    
    const formattedData = {
      symbol: symbol,
      price: tokenData.PRICE,
      change24h: tokenData.CHANGEPCT24HOUR,
      marketCap: tokenData.MKTCAP,
      volume24h: tokenData.TOTALVOLUME24HTO
    };

    return NextResponse.json({ success: true, data: formattedData });

  } catch (error: any) {
    console.error("Market API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to connect to market data provider." });
  }
}