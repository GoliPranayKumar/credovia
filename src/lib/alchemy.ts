import { Alchemy, Network, Utils, AssetTransfersCategory } from "alchemy-sdk";

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
    // Basic validation before contacting Alchemy
    // Note: Ethereum addresses are 42 characters (0x + 40 hex chars)
    const validEthAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!address || !validEthAddressRegex.test(address)) {
      throw new Error(`Invalid wallet address format: ${address}. Please ensure you enter a valid 42-character Ethereum address (e.g. 0x123...).`);
    }

    const [nfts, balance, assetTransfers, tokens] = await Promise.all([
      alchemy.nft.getNftsForOwner(address),
      alchemy.core.getBalance(address, "latest"),
      alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: [
          AssetTransfersCategory.EXTERNAL, 
          AssetTransfersCategory.ERC20, 
          AssetTransfersCategory.ERC721, 
          AssetTransfersCategory.ERC1155
        ],
        maxCount: 100 // Estimate active transactor
      }),
      alchemy.core.getTokenBalances(address)
    ]);
    
    // Calculate token diversity (how many different tokens they have > 0 balance)
    const activeTokens = tokens.tokenBalances.filter(
      (token) => token.tokenBalance && token.tokenBalance !== "0" && token.tokenBalance !== "0x0"
    ).length;

    // Check if they have an active ENS domain attached (Alchemy core logic proxy)
    // Note: To precisely get ENS name would require a separate call, but we simulate a check 
    // based on transaction history and token existence.
    const hasActivity = nfts.totalCount > 0 || assetTransfers.transfers.length > 0;

    return {
      nfts: nfts.totalCount,
      balance: Utils.formatEther(balance),
      transactionCount: assetTransfers.transfers.length,
      tokenDiversity: activeTokens,
      isVerified: hasActivity
    };
  } catch (error: any) {
    console.error("Alchemy Analysis Error:", error);
    return { error: error.message || "Failed to fetch from Alchemy" };
  }
}
