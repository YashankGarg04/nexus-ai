export const marketRegistry = {
  name: "Market Analyzer",
  actionType: "ANALYZE_TOKEN",
  desc: "Live price charts and market data for SPL tokens.",
  description: "Use this when a user asks for the price, chart, or market cap of a specific token (like BONK, WIF, or JUP).",
  instructions: "Extract 'tokenSymbol' (e.g., 'BONK', 'WIF').",
  example: `{"actionType": "ANALYZE_TOKEN", "parameters": {"tokenSymbol": "BONK"}, "userMessage": "Fetching live market data for BONK."}`
};