import { NextResponse } from 'next/server';

export async function handleOpenSeaRequest(req: Request) {
  try {
    const body = await req.json();
    const rawSlug = body?.collectionSlug;
    
    if (!rawSlug) {
      return NextResponse.json({ success: false, error: "No collection provided." }, { status: 400 });
    }

    let slug = rawSlug.toLowerCase().trim();
    const urlMatch = slug.match(/opensea\.io\/collection\/([^/?#]+)/);
    
    if (urlMatch) {
      slug = urlMatch[1];
    } else {
      slug = slug.replace(/\s+nft$/i, '').replace(/\-nft$/i, '').replace(/\s+collection$/i, '').replace(/\-collection$/i, '');
      slug = slug.replace(/['"]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    let apiKey = process.env.OPENSEA_API_KEY || '';
    apiKey = apiKey.replace(/^["']|["']$/g, ''); 
    
    const headers: Record<string, string> = { 
      'accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    let infoRes = await fetch(`https://api.opensea.io/api/v2/collections/${slug}`, { 
      headers, 
      cache: 'no-store' 
    });
    
    if (!infoRes.ok && infoRes.status === 404 && slug.includes('-')) {
        const fallbackSlug = slug.replace(/-/g, '');
        const fallbackRes = await fetch(`https://api.opensea.io/api/v2/collections/${fallbackSlug}`, { 
            headers, 
            cache: 'no-store' 
        });
        if (fallbackRes.ok) {
            slug = fallbackSlug;
            infoRes = fallbackRes;
        }
    }

    if (!infoRes.ok) {
        if (infoRes.status === 401 || infoRes.status === 403) return NextResponse.json({ success: false, error: "OpenSea API Key is invalid or blocked." });
        if (infoRes.status === 404) return NextResponse.json({ success: false, error: `Collection '${slug}' not found on OpenSea.` });
        if (infoRes.status === 429) return NextResponse.json({ success: false, error: "OpenSea rate limit exceeded." });
        return NextResponse.json({ success: false, error: `OpenSea API Error: ${infoRes.status}` });
    }
    
    const info = await infoRes.json();

    let floorPrice = 0;
    let volume = 0;
    let owners = 0;
    let symbol = "ETH";

    try {
      const statsRes = await fetch(`https://api.opensea.io/api/v2/collections/${slug}/stats`, { 
        headers, 
        cache: 'no-store' 
      });
      if (statsRes.ok) {
         const statsData = await statsRes.json();
         const total = statsData.total || {};
         floorPrice = total.floor_price || 0;
         volume = total.volume || 0;
         owners = total.num_owners || 0;
         symbol = total.floor_price_symbol || "ETH";
      }
    } catch (e) {
        console.error("Failed to fetch stats:", e);
    }

    const collectionData = {
      name: info.name || slug,
      slug: info.collection || slug,
      image: info.image_url || "",
      floorPrice: floorPrice,
      volume: volume,
      owners: owners,
      symbol: symbol.toUpperCase(),
      openseaUrl: info.opensea_url || `https://opensea.io/collection/${slug}`
    };

    return NextResponse.json({ success: true, data: collectionData });

  } catch (error: any) {
    console.error("OpenSea API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to connect to OpenSea API." });
  }
}