'use client';

import { useState, useEffect } from 'react';
import { Loader2, Globe, ExternalLink } from 'lucide-react';

export default function NewsCard({ msg, msgIndex, updateHistoryData }: any) {
  const { isCompleted, isCancelled, fetchedData } = msg;
  const [news, setNews] = useState<any[]>(fetchedData || []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(!fetchedData);

  useEffect(() => {
    if (fetchedData || isCompleted || isCancelled) return;

    fetch('/api/plugins/news', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API Route Error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (json.success) {
          setNews(json.news);
          updateHistoryData(msgIndex, { fetchedData: json.news, isCompleted: true });
        } else {
          setErrorMsg(json.error || "Failed to load news.");
          updateHistoryData(msgIndex, { isCancelled: true });
        }
        setIsFetching(false);
      })
      .catch((err) => {
        setErrorMsg("Network error connecting to news feed.");
        setIsFetching(false);
        updateHistoryData(msgIndex, { isCancelled: true });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`mt-4 p-5 bg-gray-900 border rounded-xl shadow-lg w-full max-w-sm transition-opacity ${errorMsg ? 'border-red-500/50' : 'border-sky-500/50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${errorMsg ? 'bg-red-500/20' : 'bg-sky-500/20'}`}>
            <Globe className={`w-5 h-5 ${errorMsg ? 'text-red-400' : 'text-sky-400'}`} />
          </div>
          {/* UPDATED PLUGIN NAME */}
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">CryptoCompare News</h3>
        </div>
        {isFetching && <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />}
      </div>
      
      {errorMsg ? (
        <p className="text-sm text-red-400 py-2 font-bold">{errorMsg}</p>
      ) : (
        <div className="space-y-3 mb-4">
          {!isFetching && news.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No recent articles found.</p>}
          {news.map((article: any) => (
            <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="flex gap-3 p-3 bg-black/60 rounded-lg border border-gray-800 hover:border-sky-500/50 transition-colors group">
               <div className="flex-1 min-w-0 flex flex-col justify-between">
                <p className="text-xs font-bold text-gray-200 group-hover:text-sky-400 transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {article.source} • {article.time}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-sky-400" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}