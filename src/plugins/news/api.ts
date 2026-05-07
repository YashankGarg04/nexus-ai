import { NextResponse } from 'next/server';

export async function handleNewsRequest() {
  try {
    const apiKey = process.env.NEWS_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing News API Key." }, { status: 500 });
    }

    const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?categories=SOL,Solana', {
      headers: {
        'Accept': 'application/json',
        'authorization': `Apikey ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`HTTP Status: ${res.status}`);
    }

    const data = await res.json();

    if (data.Response === "Error") {
      throw new Error(data.Message || "CryptoCompare API blocked the request.");
    }

    if (!data.Data || !Array.isArray(data.Data) || data.Data.length === 0) {
      return NextResponse.json({ success: false, error: "No recent articles found." });
    }

    const formattedNews = data.Data.slice(0, 4).map((article: any) => {
      const date = new Date(article.published_on * 1000);
      
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        id: article.id,
        title: article.title,
        source: article.source_info?.name || article.source,
        time: `${dateString}, ${timeString}`,
        tags: article.categories?.split('|')[0] || "Alpha",
        url: article.url,
        image: article.imageurl
      };
    });

    return NextResponse.json({ success: true, news: formattedNews });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: `News Error: ${error.message}` });
  }
}