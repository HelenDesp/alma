import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const CONTRACT_ADDRESS = "0x28D744dAb5804eF913dF1BF361E06Ef87eE7FA47";
const ALCHEMY_API_KEY = "https://base-mainnet.g.alchemy.com/v2/-h4g9_mFsBgnf1Wqb3aC7Qj06rOkzW-m";

export default function NFTDashboard() {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const url = `${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&contractAddresses[]=${CONTRACT_ADDRESS}&withMetadata=true`;
      console.log("Fetching NFTs from:", url);
      const res = await fetch(url);
      const data = await res.json();
      console.log("Alchemy Response:", data);
      const nftList = data.ownedNfts
        .filter(nft => nft.metadata && nft.metadata.image)
        .map((nft) => {
          const metadata = nft.metadata;
          const image = metadata.image.startsWith("ipfs://")
            ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
            : metadata.image;
          return {
            tokenId: nft.tokenId.startsWith("0x")
              ? parseInt(nft.tokenId, 16).toString()
              : nft.tokenId,
            name: metadata.name,
            description: metadata.description,
            image,
          };
        });
      setNfts(nftList);
    } catch (err) {
      console.error("Failed to fetch NFTs", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isConnected) loadNFTs();
  }, [isConnected]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ReVerse Genesis NFT Dashboard</h1>
      <ConnectButton />
      {isConnected && (
        <>
          {loading ? (
            <p>Loading NFTs...</p>
          ) : nfts.length === 0 ? (
            <p>No NFTs found in this wallet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {nfts.map((nft) => (
                <div key={nft.tokenId} className="border rounded p-4 shadow">
                  <img src={nft.image} alt={`NFT ${nft.tokenId}`} className="mb-2 w-full" />
                  <h2 className="text-lg font-semibold">#{nft.tokenId} — {nft.name}</h2>
                  <p className="text-sm text-gray-600">{nft.description}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
