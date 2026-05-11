export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const TOKEN_DICTIONARY: Record<string, { address: string, decimals: number }> = {
  SOL: { address: "So11111111111111111111111111111111111111112", decimals: 9 },
  USDC: { address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  USDT: { address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  BONK: { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  WIF: { address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6 },
  JUP: { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 }
};

async function getLiveJupiterQuote(inputTicker: string, outputTicker: string, amount: number) {
  const cleanIn = inputTicker.toUpperCase().replace(/[^A-Z]/g, '');
  const cleanOut = outputTicker.toUpperCase().replace(/[^A-Z]/g, '');

  const inputToken = TOKEN_DICTIONARY[cleanIn];
  const outputToken = TOKEN_DICTIONARY[cleanOut];

  if (!inputToken || !outputToken) {
    console.error(`Missing token in dictionary: ${cleanIn} or ${cleanOut}`);
    return null;
  }

  const amountInSmallestUnit = Math.floor(amount * Math.pow(10, inputToken.decimals)); 

  try {
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.address}&outputMint=${outputToken.address}&amount=${amountInSmallestUnit}&slippageBps=50`;
    console.log("Fetching exact Jupiter route:", url);

    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error("Jupiter API returned status:", response.status);
      return null;
    }
    
    const data = await response.json();
    if (!data || !data.outAmount) return null;

    const outAmount = Number(data.outAmount) / Math.pow(10, outputToken.decimals); 
    return outAmount;
  } catch (error) {
    console.error("Jupiter Fetch Failed:", error);
    return null;
  }
}

const NATIVE_ACTIONS = [
  { actionType: "TRANSFER", description: "Send SOL or tokens to an address." },
  { actionType: "SWAP", description: "Trade one token for another via Jupiter." },
  { actionType: "RECEIVE", description: "Show the user's wallet address and QR code." },
  { actionType: "BALANCE", description: "Check a wallet balance." },
  { actionType: "HISTORY", description: "Show the user's recent blockchain transactions." },
  { actionType: "STAKE", description: "Stake SOL into a validator node." },
  { actionType: "HELP", description: "List all native capabilities." },
  { actionType: "GENERAL_CHAT", description: "General knowledge." }
];

export async function POST(req: Request) {
  try {
    const { prompt, availablePlugins = [] } = await req.json();

    const allActions = [...NATIVE_ACTIONS, ...availablePlugins];
    const validActions = allActions.map((p: any) => `"${p.actionType}"`).join(", ");
    const actionDescriptions = allActions.map((p: any) => `- ${p.actionType}: ${p.description}`).join('\n');

    const dynamicSystemPrompt = `You are Nexus, an advanced Web3 Super-Wallet Agent.
Map the user's natural language request to exactly ONE of these actionTypes: [${validActions}, "UNKNOWN"].

Capabilities:
${actionDescriptions}

--- OUTPUT FORMAT ---
You MUST output ONLY a valid JSON object matching this exact schema. Do not add markdown or extra text.
{
  "actionType": "THE_MATCHED_ACTION_TYPE",
  "parameters": {
    "amount": "The numerical amount (e.g. '1', '0.5')",
    "tokenFrom": "The ticker being sold (e.g. 'SOL')",
    "tokenTo": "The ticker being bought (e.g. 'USDC', 'BONK')",
    "destinationAddress": "Target address for transfers",
    "targetAddress": "Target address for balances",
    "validator": "Validator node name"
  },
  "userMessage": "A brief conversational response"
}`;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: dynamicSystemPrompt,
      prompt: prompt,
    });

    const sanitizedText = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    let intentObject = JSON.parse(sanitizedText);

    const extractedAction = intentObject.actionType || "UNKNOWN";
    const isValid = allActions.some((p: any) => p.actionType === extractedAction);
    
    if (!isValid) {
        intentObject.actionType = "GENERAL_CHAT";
    }

    if (intentObject.actionType === "SWAP" && intentObject.parameters) {
      const tokenFrom = intentObject.parameters.tokenFrom || "SOL";
      const tokenTo = intentObject.parameters.tokenTo || "USDC";
      
      const rawVal = intentObject.parameters.amount || "0";
      const rawAmount = String(rawVal).replace(/[^0-9.]/g, '');
      const parsedAmount = Number(rawAmount);
      
      if (tokenFrom && tokenTo && parsedAmount > 0) {
        const liveReceiveAmount = await getLiveJupiterQuote(tokenFrom, tokenTo, parsedAmount);
        
        intentObject.parameters = {
          ...intentObject.parameters,
          tokenFrom: tokenFrom.trim().toUpperCase(),
          tokenTo: tokenTo.trim().toUpperCase(),
          amount: parsedAmount.toString(),
          receiveAmount: liveReceiveAmount ? parseFloat(liveReceiveAmount.toFixed(4)).toString() : "0"
        };
      } else {
        intentObject.parameters.receiveAmount = "0";
      }
    }

    return NextResponse.json(intentObject);

  } catch (error) {
    console.error("🚨 API ROUTE CRASH:", error);
    return NextResponse.json({ actionType: "GENERAL_CHAT", userMessage: "I had trouble processing that request. Can you rephrase it?" });
  }
}