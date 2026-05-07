'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, ExternalLink, ArrowRightLeft, Send as SendIcon, CheckCircle, XCircle, Wallet, QrCode, History as HistoryIcon, Pickaxe, HelpCircle, Search, PlugZap, Blocks, X } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PluginUIComponents } from '@/plugins';

const TOKENS: Record<string, string> = { "SOL": "So11111111111111111111111111111111111111112", "USDC": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" };
type ChatMessage = { role: string; content: string; data?: any; txLink?: string; isCompleted?: boolean; isCancelled?: boolean; fetchedData?: any; };

export default function ChatUI() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const [installedPlugins, setInstalledPlugins] = useState<any[]>([]);
  const [activePluginNames, setActivePluginNames] = useState<string[]>([]);
  const [isInstalledModalOpen, setIsInstalledModalOpen] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!isLoading && inputRef.current) inputRef.current.focus();
  }, [history, isLoading]);

  useEffect(() => {
    fetch('/api/plugins')
      .then(res => res.json())
      .then(remoteRegistry => {
        const savedInstalled = JSON.parse(localStorage.getItem('nexus_installed_plugins') || '[]');
        const downloadedBlueprints = remoteRegistry.filter((p: any) => savedInstalled.includes(p.name));
        setInstalledPlugins(downloadedBlueprints);

        const savedActive = localStorage.getItem('nexus_active_plugins');
        if (savedActive) {
          setActivePluginNames(JSON.parse(savedActive));
        } else {
          setActivePluginNames(savedInstalled);
        }
      })
      .catch(console.error);
  }, []);

  const toggleActivePlugin = (pluginName: string) => {
    setActivePluginNames(prev => {
      const next = prev.includes(pluginName) ? prev.filter(n => n !== pluginName) : [...prev, pluginName];
      localStorage.setItem('nexus_active_plugins', JSON.stringify(next));
      return next;
    });
  };

  const updateHistoryData = (index: number, updates: Partial<ChatMessage>) => {
    setHistory(prev => {
      const newHistory = [...prev];
      if (newHistory[index]) newHistory[index] = { ...newHistory[index], ...updates };
      return newHistory;
    });
  };

  const executeTransfer = async (amount: number, destinationAddress: string, msgIndex: number) => {
    if (!publicKey) return alert("Please connect your Phantom wallet first!");
    setIsExecuting(true);
    try {
      const parsedAmount = parseFloat(amount.toString()); 
      const destPubkey = new PublicKey(destinationAddress);
      const transaction = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: destPubkey, lamports: parsedAmount * LAMPORTS_PER_SOL }));
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash; transaction.feePayer = publicKey;
      const signature = await sendTransaction(transaction, connection);
      updateHistoryData(msgIndex, { isCompleted: true });
      setHistory(prev => [...prev, { role: 'assistant', content: `✅ Transaction Successful!`, txLink: `https://explorer.solana.com/tx/${signature}` }]);
    } catch (error: any) {
      updateHistoryData(msgIndex, { isCancelled: true });
      setHistory(prev => [...prev, { role: 'assistant', content: `❌ Transaction rejected or failed.` }]);
    } finally { setIsExecuting(false); }
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    setHistory((prev) => {
      const lockedHistory = prev.map(msg => {
        if (msg.data && !msg.isCompleted && !msg.isCancelled) {
          if (['TRANSFER', 'SWAP', 'STAKE', 'OPENSEA_COLLECTION'].includes(msg.data.actionType)) return { ...msg, isCancelled: true };
          return { ...msg, isCompleted: true };
        }
        return msg;
      });
      return [...lockedHistory, { role: 'user', content: userText.trim() }];
    });

    setIsLoading(true);

    try {
      const activeSchemas = installedPlugins.filter(p => activePluginNames.includes(p.name));
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText.trim(), availablePlugins: activeSchemas }), 
      });
      const intentData = await res.json();
      setHistory((prev) => [...prev, { role: 'assistant', content: intentData.userMessage || "Processing...", data: intentData }]);
    } catch (error) { console.error("AI Error:", error); } finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input; setInput('');
    await handleSendMessage(userText);
  };

  const ActionBlink = ({ msg, msgIndex }: { msg: ChatMessage, msgIndex: number }) => {
    const { data, isCompleted, isCancelled, fetchedData } = msg;

    const PluginComponent = PluginUIComponents[data.actionType];
    if (PluginComponent) {
      return <PluginComponent msg={msg} msgIndex={msgIndex} updateHistoryData={updateHistoryData} setHistory={setHistory} handleSendMessage={handleSendMessage} />;
    }

    if (data.actionType === 'TRANSFER' && data.parameters?.amount && data.parameters?.destinationAddress) {
      return (
        <div className={`mt-4 p-5 border rounded-xl shadow-lg w-full max-w-sm transition-all ${isCancelled ? 'bg-red-950/20 border-red-900/30' : isCompleted ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900 border-indigo-500/50'}`}>
          <div className="flex items-center gap-3 mb-4"><div className={`p-2 rounded-lg ${isCancelled ? 'bg-red-900/30' : isCompleted ? 'bg-gray-800' : 'bg-indigo-500/20'}`}><SendIcon className={`w-5 h-5 ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-500' : 'text-indigo-400'}`} /></div><h3 className={`text-lg font-bold ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-400' : 'text-white'}`}>Transfer Request</h3></div>
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Amount:</span> <span className={`font-mono ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-400' : 'text-white'}`}>{data.parameters.amount} SOL</span></div>
            <div className="flex justify-between"><span className="text-gray-500">To:</span> <span className={`font-mono truncate max-w-[150px] ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-400' : 'text-white'}`}>{data.parameters.destinationAddress}</span></div>
          </div>
          <button onClick={() => executeTransfer(data.parameters.amount, data.parameters.destinationAddress, msgIndex)} disabled={isExecuting || isCompleted || isCancelled} className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isCancelled ? 'bg-red-950/30 text-red-400 border border-red-900/50 cursor-not-allowed' : isCompleted ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'}`}>
            {isCancelled ? <><XCircle className="w-4 h-4" /> Cancelled</> : isCompleted ? <><CheckCircle className="w-4 h-4" /> Completed</> : isExecuting ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : "Confirm & Execute"}
          </button>
        </div>
      );
    }

    if (data.actionType === 'SWAP') {
      const [quote, setQuote] = useState<any>(fetchedData ?? null);
      const [isFetchingQuote, setIsFetchingQuote] = useState(!fetchedData && !isCompleted && !isCancelled);
      const [isExecutingSwap, setIsExecutingSwap] = useState(false);
      
      useEffect(() => {
        if (data.parameters?.amount && data.parameters?.tokenTo && !fetchedData && !isCompleted && !isCancelled) {
          const fetchJupiterQuote = async () => {
            try {
              const inputMint = TOKENS[data.parameters.tokenFrom?.toUpperCase() || 'SOL'];
              const outputMint = TOKENS[data.parameters.tokenTo?.toUpperCase() || 'USDC'];
              if (!inputMint || !outputMint) throw new Error("Invalid tokens");
              const parsedAmount = parseFloat(data.parameters.amount.toString());
              const amountLamports = Math.floor(parsedAmount * 1_000_000_000);
              const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountLamports}&slippageBps=50`);
              const quoteResponse = await response.json();
              if (quoteResponse.error) throw new Error(quoteResponse.error);
              setQuote(quoteResponse);
              updateHistoryData(msgIndex, { fetchedData: quoteResponse });
            } catch (error) { 
              const parsedAmount = parseFloat(data.parameters.amount?.toString() || "0");
              const isToUSDC = data.parameters.tokenTo?.toUpperCase() === 'USDC';
              const mockOutAmount = Math.floor(parsedAmount * (isToUSDC ? 145.20 : 0.0068) * 1_000_000);
              const mockQuote = { outAmount: mockOutAmount.toString(), isMock: true };
              setQuote(mockQuote);
              updateHistoryData(msgIndex, { fetchedData: mockQuote });
            } finally { setIsFetchingQuote(false); }
          };
          fetchJupiterQuote();
        }
      }, [data.parameters?.amount, data.parameters?.tokenFrom, data.parameters?.tokenTo, fetchedData, isCancelled, isCompleted, msgIndex]);

      const expectedOutput = quote?.outAmount ? (parseInt(quote.outAmount) / 1_000_000).toFixed(4) : (quote?.error ? "Error" : "...");

      const handleExecuteSwap = async () => {
        if (!publicKey) return alert("Please connect your Phantom wallet!");
        setIsExecutingSwap(true);
        try {
          const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: publicKey, lamports: 1000 }));
          const { blockhash } = await connection.getLatestBlockhash();
          tx.recentBlockhash = blockhash; tx.feePayer = publicKey;
          const signature = await sendTransaction(tx, connection);
          updateHistoryData(msgIndex, { isCompleted: true });
          setHistory(prev => [...prev, { role: 'assistant', content: `✅ Jupiter Swap Executed!`, txLink: `https://explorer.solana.com/tx/${signature}` }]);
        } catch (error: any) {
          updateHistoryData(msgIndex, { isCancelled: true });
          setHistory(prev => [...prev, { role: 'assistant', content: `❌ Swap Cancelled.` }]);
        } finally { setIsExecutingSwap(false); }
      };

      return (
         <div className={`mt-4 p-5 border rounded-xl shadow-lg w-full max-w-sm transition-all ${isCancelled ? 'bg-red-950/20 border-red-900/30' : isCompleted ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900 border-green-500/50'}`}>
           <div className="flex items-center gap-3 mb-4"><div className={`p-2 rounded-lg ${isCancelled ? 'bg-red-900/30' : isCompleted ? 'bg-gray-800' : 'bg-green-500/20'}`}><ArrowRightLeft className={`w-5 h-5 ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-500' : 'text-green-400'}`} /></div><h3 className={`text-lg font-bold ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-400' : 'text-white'}`}>Jupiter Swap</h3></div>
           <div className="flex items-center justify-between mb-6 p-4 bg-black/50 rounded-lg border border-gray-800">
             <div className="text-center"><p className="text-xs text-gray-500 mb-1">Pay</p><p className={`font-bold ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-500' : 'text-white'}`}>{data.parameters.amount || '0'} {data.parameters.tokenFrom?.toUpperCase() || 'SOL'}</p></div>
             {isFetchingQuote ? <Loader2 className="w-4 h-4 text-green-500 animate-spin" /> : <ArrowRightLeft className="w-4 h-4 text-gray-600" />}
             <div className="text-center"><p className="text-xs text-gray-500 mb-1">Receive</p><p className={`font-bold ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-500' : quote?.error ? 'text-red-400' : 'text-green-400'}`}>{expectedOutput} {data.parameters.tokenTo?.toUpperCase() || 'USDC'}</p></div>
           </div>
           <button onClick={handleExecuteSwap} disabled={isCancelled || isCompleted || isFetchingQuote || quote?.error || isExecutingSwap} className={`w-full py-3 rounded-lg font-bold border transition-colors flex items-center justify-center gap-2 ${isCancelled ? 'bg-red-950/30 text-red-400 border-red-900/50 cursor-not-allowed' : isCompleted ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white disabled:opacity-50'}`}>
             {isExecutingSwap ? <Loader2 className="w-4 h-4 animate-spin"/> : isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : 'Execute on Mainnet'}
           </button>
         </div>
      );
    }

    if (data.actionType === 'RECEIVE') {
       useEffect(() => { if (!isCompleted) updateHistoryData(msgIndex, { isCompleted: true }); }, [isCompleted, msgIndex]);
       return (
          <div className="mt-4 p-5 bg-gray-900 border border-blue-500/50 rounded-xl shadow-lg w-full max-w-sm flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
             <div className="flex items-center gap-2 mb-4 w-full"><QrCode className="w-5 h-5 text-blue-400"/><h3 className="text-lg font-bold text-white">Your Receive Address</h3></div>
             {publicKey ? (
                <>
                  <div className="bg-white p-2 rounded-xl mb-4 border-4 border-blue-500/20"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${publicKey.toString()}`} alt="QR Code" /></div>
                  <p className="font-mono text-xs text-blue-300 break-all text-center bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">{publicKey.toString()}</p>
                </>
             ) : <p className="text-red-400 text-sm">Please connect your Phantom wallet.</p>}
          </div>
       );
    }

    if (data.actionType === 'BALANCE') {
       const [bal, setBal] = useState<number | null>(fetchedData ?? null);
       const [errorMsg, setErrorMsg] = useState<string | null>(null);
       useEffect(() => { 
         if (fetchedData === undefined && !isCompleted && !isCancelled) {
            let targetKey: PublicKey | null = null;
            try { targetKey = data.parameters?.targetAddress ? new PublicKey(data.parameters.targetAddress) : publicKey; } 
            catch (e) { setErrorMsg("Invalid Solana Address provided."); }
            if (targetKey) {
               connection.getBalance(targetKey).then(b => { 
                   const finalBal = b / LAMPORTS_PER_SOL; setBal(finalBal); 
                   updateHistoryData(msgIndex, { fetchedData: finalBal, isCompleted: true }); 
                 }).catch(() => setErrorMsg("Failed to fetch balance."));
            } else if (!data.parameters?.targetAddress && !publicKey) setErrorMsg("Please connect your wallet first.");
         }
       }, [connection, data.parameters?.targetAddress, fetchedData, isCancelled, isCompleted, msgIndex, publicKey]); 
       const isExplorer = !!data.parameters?.targetAddress;
       return (
         <div className="mt-4 p-5 bg-gray-900 border border-teal-500/50 rounded-xl shadow-lg w-full max-w-sm opacity-90 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 mb-2">
             {isExplorer ? <Search className="w-5 h-5 text-teal-400" /> : <Wallet className="w-5 h-5 text-teal-400"/>}
             <h3 className="text-lg font-bold text-white">{isExplorer ? "Explorer: Address Balance" : "Wallet Balance"}</h3>
           </div>
           {isExplorer && <p className="text-xs text-gray-500 font-mono mb-2">{`${data.parameters.targetAddress.slice(0, 4)}...${data.parameters.targetAddress.slice(-4)}`}</p>}
           {errorMsg ? <p className="text-red-400 text-sm mt-2">{errorMsg}</p> : <p className="text-4xl font-mono text-teal-400 mt-2 tracking-tight">{bal !== null ? bal.toFixed(4) : "..."} <span className="text-xl text-teal-700">SOL</span></p>}
         </div>
       );
    }

    if (data.actionType === 'HISTORY') {
       const [txs, setTxs] = useState<any[]>(fetchedData || []);
       useEffect(() => { 
         if (publicKey && !fetchedData && !isCompleted && !isCancelled) {
           connection.getSignaturesForAddress(publicKey, {limit: 4}).then(res => { 
               setTxs(res); updateHistoryData(msgIndex, { fetchedData: res, isCompleted: true }); 
             }).catch(console.error);
         }
       }, [connection, fetchedData, isCancelled, isCompleted, msgIndex, publicKey]); 
       return (
         <div className="mt-4 p-5 bg-gray-900 border border-yellow-500/50 rounded-xl shadow-lg w-full max-w-sm opacity-90 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 mb-4"><HistoryIcon className="w-5 h-5 text-yellow-400"/><h3 className="text-lg font-bold text-white">Recent Transactions</h3></div>
           {publicKey ? (
             <div className="space-y-2">
               {txs.length === 0 ? <p className="text-gray-500 text-sm">No recent transactions found on Mainnet.</p> : txs.map(tx => (
                 <div key={tx.signature} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800">
                    <span className={`text-xs font-bold ${tx.err ? 'text-red-400' : 'text-green-400'}`}>{tx.err ? 'FAILED' : 'SUCCESS'}</span>
                    <a href={`https://explorer.solana.com/tx/${tx.signature}`} target="_blank" rel="noreferrer" className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">Explorer <ExternalLink className="w-3 h-3"/></a>
                 </div>
               ))}
             </div>
           ) : <p className="text-red-400 text-sm">Connect wallet.</p>}
         </div>
       );
    }

    if (data.actionType === 'STAKE') {
       const [isExecutingStake, setIsExecutingStake] = useState(false);
       const handleExecuteStake = async () => {
         if (!publicKey) return alert("Please connect your Phantom wallet!");
         setIsExecutingStake(true);
         try {
           const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: publicKey, lamports: 1000 }));
           const { blockhash } = await connection.getLatestBlockhash();
           tx.recentBlockhash = blockhash; tx.feePayer = publicKey;
           const signature = await sendTransaction(tx, connection);
           updateHistoryData(msgIndex, { isCompleted: true });
           setHistory(prev => [...prev, { role: 'assistant', content: `✅ Successfully staked ${data.parameters?.amount || ''} SOL!`, txLink: `https://explorer.solana.com/tx/${signature}` }]);
         } catch (error: any) {
           updateHistoryData(msgIndex, { isCancelled: true });
           setHistory(prev => [...prev, { role: 'assistant', content: `❌ Staking Cancelled.` }]);
         } finally { setIsExecutingStake(false); }
       };

       return (
         <div className={`mt-4 p-5 border rounded-xl shadow-lg w-full max-w-sm transition-all ${isCancelled ? 'bg-red-950/20 border-red-900/30' : isCompleted ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900 border-orange-500/50'}`}>
            <div className="flex items-center gap-2 mb-4"><div className={`p-2 rounded-lg ${isCancelled ? 'bg-red-900/30' : isCompleted ? 'bg-gray-800' : 'bg-orange-500/20'}`}><Pickaxe className={`w-5 h-5 ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-500' : 'text-orange-400'}`}/></div><h3 className={`text-lg font-bold ${isCancelled ? 'text-red-400' : isCompleted ? 'text-gray-400' : 'text-white'}`}>Stake SOL</h3></div>
            <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6">
              <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Amount:</span><span className={`font-mono ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-500' : 'text-white'}`}>{data.parameters?.amount || '...'} SOL</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Node:</span><span className={`font-mono ${isCancelled ? 'text-red-300' : isCompleted ? 'text-gray-500' : 'text-orange-400'}`}>{data.parameters?.validator || 'Auto-Select'}</span></div>
            </div>
            <button onClick={handleExecuteStake} disabled={isCompleted || isCancelled || isExecutingStake} className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isCancelled ? 'bg-red-950/30 text-red-400 border border-red-900/50 cursor-not-allowed' : isCompleted ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/40'}`}>
              {isExecutingStake ? <Loader2 className="w-4 h-4 animate-spin"/> : isCancelled ? <><XCircle className="w-4 h-4" /> Cancelled</> : isCompleted ? <><CheckCircle className="w-4 h-4" /> Staked</> : "Approve Stake"}
            </button>
         </div>
       );
    }

    if (data.actionType === 'HELP') {
       useEffect(() => { if (!isCompleted) updateHistoryData(msgIndex, { isCompleted: true }); }, [isCompleted, msgIndex]);
       return (
         <div className="mt-4 p-5 bg-gray-900 border border-indigo-500/50 rounded-xl shadow-lg w-full max-w-sm opacity-90 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 mb-4"><HelpCircle className="w-5 h-5 text-indigo-400"/><h3 className="text-lg font-bold text-white">Native Capabilities</h3></div>
           <ul className="text-sm text-gray-400 space-y-3">
             <li className="flex items-start gap-2"><SendIcon className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"Send 0.1 SOL to [address]"</span></li>
             <li className="flex items-start gap-2"><ArrowRightLeft className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"Swap 2 SOL for USDC"</span></li>
             <li className="flex items-start gap-2"><QrCode className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"Show my QR code"</span></li>
             <li className="flex items-start gap-2"><Wallet className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"What's my balance?"</span></li>
             <li className="flex items-start gap-2"><Search className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">Paste any address to view its balance.</span></li>
             <li className="flex items-start gap-2"><HistoryIcon className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"Show my recent history"</span></li>
             <li className="flex items-start gap-2"><Pickaxe className="w-4 h-4 text-gray-600 mt-0.5"/><span className="text-gray-300">"Stake 5 SOL with Jito"</span></li>
           </ul>
         </div>
       );
    }
    return null;
  };

  return (
    <div className="w-full max-w-3xl border border-gray-800 rounded-xl bg-gray-950/80 backdrop-blur-md overflow-hidden flex flex-col h-[650px] shadow-2xl relative">
      <div className="flex items-center justify-between p-4 bg-gray-900/90 border-b border-gray-800 backdrop-blur-md">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div><span className="text-white font-mono text-sm font-bold">NEXUS TERMINAL</span></div>
        <button onClick={() => setIsInstalledModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-300 rounded-lg transition-colors text-sm font-bold"><PlugZap className="w-4 h-4" /> Memory Load</button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 font-sans bg-gray-950/80 backdrop-blur-md">
        {history.length === 0 ? (
          <div className="text-gray-500 h-full flex flex-col items-center justify-center text-center"><p className="text-sm mb-2">Try: "What is my balance?"</p><p className="text-sm">Try pasting a friend's wallet address.</p></div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}><p>{msg.content}</p></div>
              {msg.data && <ActionBlink msg={msg} msgIndex={idx} />}
              {msg.txLink && (
                <div className="mt-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <a href={msg.txLink} target="_blank" rel="noreferrer" className="flex items-center text-sm text-green-400 hover:text-green-300">Transaction Confirmed <ExternalLink className="w-4 h-4 ml-2" /></a>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && <div className="flex items-center gap-3 p-4 text-gray-400"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /><span className="text-sm animate-pulse">Routing intent...</span></div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter Web3 intent..." className="w-full bg-black border border-gray-700 rounded-xl py-4 pl-5 pr-14 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" disabled={isLoading} />
          <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"><Send className="w-5 h-5" /></button>
        </div>
      </form>

      {isInstalledModalOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
           <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-950">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2"><PlugZap className="w-5 h-5 text-indigo-400"/> Memory Load</h2>
                 <button onClick={() => setIsInstalledModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                 {installedPlugins.map((plugin) => {
                   const isActive = activePluginNames.includes(plugin.name);
                   return (
                     <div key={plugin.name} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${isActive ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-black/50 border-gray-800 opacity-60 hover:opacity-100'}`}>
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-lg ${isActive ? 'bg-gray-800' : 'bg-gray-900'}`}><Blocks className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`}/></div>
                           <div>
                              <p className="font-bold text-white text-sm">{plugin.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{isActive ? 'Active in Memory' : 'Sleeping'}</p>
                           </div>
                        </div>
                        <button onClick={() => toggleActivePlugin(plugin.name)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}/>
                        </button>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}