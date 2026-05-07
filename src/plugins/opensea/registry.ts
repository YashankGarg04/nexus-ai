export const openseaRegistry = {
  name: "OpenSea Explorer",
  actionType: "OPENSEA_COLLECTION",
  desc: "Live floor prices and collection analytics via OpenSea.",
  description: "Trigger this whenever a user mentions an NFT, asks for floor prices, or pastes an OpenSea link.",
  instructions: "Extract the exact OpenSea collection slug. If a URL is provided, extract ONLY the slug after '/collection/'. For names, replace spaces with hyphens and remove words like 'nft'.",
  example: `{"actionType": "OPENSEA_COLLECTION", "parameters": {"collectionSlug": "axie"}, "userMessage": "Fetching OpenSea data..."}`
};