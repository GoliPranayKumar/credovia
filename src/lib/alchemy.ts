import { Alchemy, Network } from "alchemy-sdk";

const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export async function analyzeWallet(address: string) {
  if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    // Return mock analysis if no API key is set
    return {
      nfts: 12,
      transactions: 150,
      isVerified: true,
      balance: "1.5 ETH"
    };
  }

  try {
    const nfts = await alchemy.nft.getNftsForOwner(address);
    const balance = await alchemy.core.getBalance(address, "latest");
    
    return {
      nfts: nfts.totalCount,
      balance: balance.toString(),
      isVerified: nfts.totalCount > 0
    };
  } catch (error) {
    console.error("Alchemy Analysis Error:", error);
    return null;
  }
}
