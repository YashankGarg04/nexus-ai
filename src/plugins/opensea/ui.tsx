'use client';

import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function OpenSeaCard({ msg, msgIndex, updateHistoryData }: any) {
  const { data, isCompleted, isCancelled, fetchedData } = msg;

  const [nftData, setNftData] = useState<any>(fetchedData ?? null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(!fetchedData);

  useEffect(() => {
    if (fetchedData || isCompleted || isCancelled) return;

    if (data.parameters?.collectionSlug) {
      fetch('/api/plugins/opensea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionSlug: data.parameters.collectionSlug }),
        cache: 'no-store'
      })
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setNftData(json.data);
            updateHistoryData(msgIndex, { fetchedData: json.data, isCompleted: true });
          } else {
            setErrorMsg(json.error || "Collection not found.");
            updateHistoryData(msgIndex, { isCancelled: true });
          }
          setIsFetching(false);
        })
        .catch((err) => {
          console.error("OpenSea UI Error:", err);
          setErrorMsg("Network error connecting to OpenSea.");
          setIsFetching(false);
          updateHistoryData(msgIndex, { isCancelled: true });
        });
    } else {
      setErrorMsg("Missing collection slug.");
      setIsFetching(false);
      updateHistoryData(msgIndex, { isCancelled: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openseaUrl = nftData?.openseaUrl || (nftData?.slug ? `https://opensea.io/collection/${nftData.slug}` : 'https://opensea.io');

  return (
    <div className={`mt-4 p-5 bg-gray-900 border rounded-xl shadow-lg w-full max-w-sm transition-opacity opacity-95 hover:opacity-100 ${errorMsg ? 'border-red-500/50' : 'border-[#2081E2]/50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${errorMsg ? 'bg-red-500/20' : 'bg-[#2081E2]/20'}`}>
            <ImageIcon className={`w-5 h-5 ${errorMsg ? 'text-red-400' : 'text-[#2081E2]'}`} />
          </div>
          <h3 className="text-lg font-bold tracking-widest text-white">OpenSea Explorer</h3>
        </div>
        {isFetching && <Loader2 className="w-4 h-4 text-[#2081E2] animate-spin" />}
      </div>

      {errorMsg ? (
        <p className="text-sm text-red-400 py-2 font-bold">{errorMsg}</p>
      ) : nftData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-gray-800">
            {nftData.image && <img src={nftData.image} alt={nftData.name} className="w-16 h-16 rounded-lg object-cover border border-gray-700" />}
            <div>
              <h4 className="text-md font-bold text-white">{nftData.name}</h4>
              <p className="text-xs text-gray-500">{(nftData.owners || 0).toLocaleString()} unique owners</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-black/50 rounded-lg border border-gray-800">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Floor Price</p>
              <p className="text-lg font-mono flex items-center gap-1 text-white">
                {nftData.floorPrice > 0 ? nftData.floorPrice.toFixed(2) : '--'} <span className="text-sm text-gray-600">{nftData.symbol}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Volume</p>
              <p className="text-lg font-mono flex items-center gap-1 text-white">
                {nftData.volume > 0 ? nftData.volume.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '--'} <span className="text-sm text-gray-600">{nftData.symbol}</span>
              </p>
            </div>
          </div>

          <div className="mt-4">
            <a href={openseaUrl} target="_blank" rel="noreferrer" className="w-full py-3 bg-[#2081E2] hover:bg-[#1868b7] text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
              View Collection on OpenSea <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="py-8 animate-pulse bg-black/40 rounded-lg"></div>
      )}
    </div>
  );
}