// Web3 Escrow Contract ABI (simplified for USDT)
export const ESCROW_ABI = [
  {
    "inputs": [
      { "name": "_token", "type": "address" },
      { "name": "_recipient", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_taskId", "type": "bytes32" }
    ],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "_taskId", "type": "bytes32" }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "taskId", "type": "bytes32" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "PaymentReleased",
    "type": "event"
  }
] as const;

// USDT ABI for balance approval
export const USDT_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "type": "boolean" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses (update for production)
export const CONTRACT_ADDRESSES = {
  mainnet: {
    escrow: '0xYourEscrowContractAddress',
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  polygon: {
    escrow: '0xYourEscrowContractAddress',
    usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  bsc: {
    escrow: '0xYourEscrowContractAddress',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
  },
};

// Helper to format wallet address
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to convert USD to token decimals
export function toTokenDecimals(amount: number, decimals: number = 6): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}
