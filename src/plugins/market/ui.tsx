'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, BarChart2, ExternalLink } from 'lucide-react';

export default function MarketCard({ msg, msgIndex, updateHistoryData }: any) {
  const { data, isCompleted, isCancelled, fetchedData } = msg;
  const [tokenData, setTokenData] = useState<any>(fetchedData ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(!fetchedData);

  useEffect(() => {
    if (fetchedData || isCompleted || isCancelled) return;

    if (data.parameters?.tokenSymbol) {
      // UPDATED: Pointing exactly to your /token folder route
      fetch('/api/plugins/market/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenSymbol: data.parameters.tokenSymbol }),
        cache: 'no-store'
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            console.error("Server HTML Response:", text);
            throw new Error(`API Route missing or failed (Status ${res.status})`);
          }
          return res.json();
        })
        .then(json => {
          if (json.success) {
            setTokenData(json.data);
            updateHistoryData(msgIndex, { fetchedData: json.data, isCompleted: true });
          } else {
            setErrorMsg(json.error || "Token not found.");
            updateHistoryData(msgIndex, { isCancelled: true });
          }
          setIsFetching(false);
        })
        .catch((err) => {
          console.error("Market UI Error:", err);
          setErrorMsg("Failed to connect to the backend API.");
          setIsFetching(false);
          updateHistoryData(msgIndex, { isCancelled: true });
        });
    } else {
      setErrorMsg("Missing token symbol.");
      setIsFetching(false);
      updateHistoryData(msgIndex, { isCancelled: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`mt-4 p-5 bg-gray-900 border rounded-xl shadow-lg w-full max-w-sm transition-opacity opacity-95 hover:opacity-100 ${errorMsg ? 'border-red-500/50' : 'border-emerald-500/50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${errorMsg ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
            <BarChart2 className={`w-5 h-5 ${errorMsg ? 'text-red-400' : 'text-emerald-400'}`} />
          </div>
          <h3 className="text-lg font-bold text-white tracking-widest">
            {data.parameters?.tokenSymbol?.toUpperCase() || 'TOKEN'} MARKET
          </h3>
        </div>
        {isFetching && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
      </div>

      {errorMsg ? (
        <p className="text-sm text-red-400 py-2 font-bold">{errorMsg}</p>
      ) : tokenData ? (
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-mono text-white tracking-tight">
              ${tokenData.price >= 1 ? tokenData.price.toFixed(2) : tokenData.price.toFixed(6)}
            </p>
            <div className={`flex items-center gap-1 mt-1 text-sm font-bold ${tokenData.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {tokenData.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(tokenData.change24h).toFixed(2)}% (24h)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 p-3 bg-black/50 rounded-lg border border-gray-800">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Market Cap</p>
              <p className="text-sm font-mono text-gray-300">
                ${(tokenData.marketCap / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">24h Vol</p>
              <p className="text-sm font-mono text-gray-300">
                ${(tokenData.volume24h / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <a 
              href={`https://jup.ag/swap/USDC-${tokenData.symbol}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center gap-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold transition-colors w-full"
            >
              Trade <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href={`https://coinmarketcap.com/currencies/${tokenData.symbol.toLowerCase()}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center gap-1 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm font-bold transition-colors w-full"
            >
              View Chart <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="py-8 animate-pulse bg-black/40 rounded-lg"></div>
      )}
    </div>
  );
}