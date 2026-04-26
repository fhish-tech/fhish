import { ethers, Interface } from "ethers"

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545"

export const PRIVATE_VOTING_ABI = [
  { type: "function", name: "vote", inputs: [{ name: "handleA", type: "bytes32" }, { name: "handleB", type: "bytes32" }, { name: "proofA", type: "bytes" }, { name: "proofB", type: "bytes" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "setDecryptedResult", inputs: [{ name: "resultA", type: "uint32" }, { name: "resultB", type: "uint32" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "getVoteCount", inputs: [], outputs: [{ type: "uint256" }, { type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "getVote", inputs: [{ name: "id", type: "uint256" }], outputs: [{ name: "voter", type: "address" }, { name: "handleA", type: "bytes32" }, { name: "handleB", type: "bytes32" }, { name: "timestamp", type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "reset", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "requestDecryptResults", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "VoteCast", inputs: [{ name: "voter", type: "address", indexed: true }, { name: "handleA", type: "bytes32", indexed: false }, { name: "handleB", type: "bytes32", indexed: false }, { name: "voteId", type: "uint256", indexed: false }] },
]

const votingInterface = new Interface(PRIVATE_VOTING_ABI);

export const decodeInput = (data: string) => {
  try {
    const decoded = votingInterface.parseTransaction({ data });
    if (!decoded) return null;
    return {
      name: decoded.name,
      args: decoded.args.toObject ? decoded.args.toObject() : decoded.args,
      signature: decoded.signature
    };
  } catch (e) {
    return null;
  }
}

export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL)
}
