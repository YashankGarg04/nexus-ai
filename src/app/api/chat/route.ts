import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const NATIVE_ACTIONS = [
  { actionType: "TRANSFER", description: "Send SOL or tokens to an address.", instructions: "Requires 'amount' and 'destinationAddress'." },
  { actionType: "SWAP", description: "Trade one token for another via Jupiter.", instructions: "Requires 'amount', 'tokenFrom', and 'tokenTo'." },
  { actionType: "RECEIVE", description: "Show the user's wallet address and QR code.", instructions: "No parameters needed." },
  { actionType: "BALANCE", description: "Check a wallet balance.", instructions: "Extract 'targetAddress' if specified." },
  { actionType: "HISTORY", description: "Show the user's recent blockchain transactions.", instructions: "No parameters needed." },
  { actionType: "STAKE", description: "Stake SOL into a validator node or pool.", instructions: "Requires 'amount'. Extract 'validator' if the user specifies a specific node (e.g., Jito, Marinade, Cogent)." },
  { actionType: "HELP", description: "List all native capabilities of the wallet.", instructions: "No parameters needed." },
  { actionType: "GENERAL_CHAT", description: "Answer general knowledge questions.", instructions: "Use this ONLY as a last resort for standard conversation. Put response in 'userMessage'." }
];

export async function POST(req: Request) {
  try {
    const { prompt, availablePlugins = [] } = await req.json();

    const allActions = [...NATIVE_ACTIONS, ...availablePlugins];
    const validActions = allActions.map((p: any) => `"${p.actionType}"`).join(", ");
    const actionDescriptions = allActions.map((p: any) => `- Action "${p.actionType}": ${p.description} Rule: ${p.instructions}`).join('\n');

    const dynamicSystemPrompt = `You are Nexus, an advanced Web3 Super-Wallet Agent.
Your job is to parse the user's natural language and output ONLY a raw JSON object. 

--- CRITICAL RULES ---
1. You MUST use ONE of the following actionTypes: [${validActions}, "UNKNOWN"].
2. PLUGIN PRIORITY: If the user asks to buy an NFT, sweep a floor, or mentions an NFT collection (like Axie, Mad Lads, etc.), you MUST route it to OPENSEA_COLLECTION (if installed) and extract the collection name as the slug.
3. Do NOT invent actionTypes. Do NOT change the JSON keys.
4. GENERAL_CHAT is a LAST RESORT. Never use it to say "I cannot buy NFTs" if the OpenSea plugin is installed.

--- INSTALLED CAPABILITIES ---
${actionDescriptions}

--- OUTPUT FORMAT ---
{
  "actionType": "EXACT_STRING_MATCH",
  "parameters": {},
  "userMessage": "Your conversational response here."
}
`;

    const result = await generateText({
      model: groq('llama-3.1-8b-instant'),
      system: dynamicSystemPrompt,
      prompt: prompt,
    });

    const sanitizedText = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
    let intentObject = JSON.parse(sanitizedText);

    // AI BULLETPROOFING: Catch missing keys or hallucinated actions
    const extractedAction = intentObject.actionType || intentObject.action || intentObject.type;
    const isValid = allActions.some((p: any) => p.actionType === extractedAction);

    if (!isValid && extractedAction !== "UNKNOWN") {
        intentObject.actionType = "GENERAL_CHAT";
    } else {
        intentObject.actionType = extractedAction;
    }

    return NextResponse.json(intentObject);

  } catch (error) {
    console.error("AI Routing Error:", error);
    // Fallback safely to text if JSON parsing fails entirely
    return NextResponse.json({ actionType: "GENERAL_CHAT", userMessage: "I had trouble processing that request. Can you rephrase it?" });
  }
}