// Web3 Escrow Integration for Pulse
import { toHex, parseAbi } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContract } from 'wagmi';

export const ESCROW_ABI = parseAbi([
  'function createTask(bytes32 taskId, uint256 amount) external',
  'function assignExecutor(bytes32 taskId, address executor) external',
  'function completeTask(bytes32 taskId) external',
  'function refundTask(bytes32 taskId) external',
  'function getTask(bytes32 taskId) external view returns (address, address, uint256, bool, bool)',
  'event TaskCreated(bytes32 indexed taskId, address creator, uint256 amount)',
  'event TaskCompleted(bytes32 indexed taskId, address executor, uint256 executorAmount, uint256 adminAmount)',
]);

export const USDT_ABI = parseAbi([
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
]);

// BSC Mainnet addresses
export const CONTRACT_ADDRESSES = {
  bsc: {
    escrow: '0xYourEscrowContractAddress', // Deploy first
    usdt: '0x55d398326f99059fF775485246999027B3197955',
  },
  bscTestnet: {
    escrow: '0xYourTestEscrowAddress',
    usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  },
} as const;

export const ADMIN_ADDRESS = '0xa657fb7e405534d0b9d07b5edf413fddc3922128';

// Helper functions
export function generateTaskId(title: string, creator: string, timestamp: number): `0x${string}` {
  const data = `${title}-${creator}-${timestamp}`;
  return toHex(data, { size: 32 });
}

export function calculateSplit(amount: number): { executor: number; admin: number } {
  const adminFee = amount * 0.1; // 10%
  const executorAmount = amount * 0.9; // 90%
  return { executor: executorAmount, admin: adminFee };
}

// React hooks for Escrow (Wagmi v2 compatible)
export function useCreateEscrowTask() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createTask = (taskId: `0x${string}`, amount: number) => {
    const amountWei = BigInt(Math.floor(amount * 1e18)); // USDT has 18 decimals on BSC

    writeContract({
      address: CONTRACT_ADDRESSES.bsc.escrow as `0x${string}`,
      abi: ESCROW_ABI,
      functionName: 'createTask',
      args: [taskId, amountWei],
    });
  };

  return { createTask, isPending, isConfirming, isConfirmed, hash };
}

export function useCompleteEscrowTask() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const completeTask = (taskId: `0x${string}`) => {
    writeContract({
      address: CONTRACT_ADDRESSES.bsc.escrow as `0x${string}`,
      abi: ESCROW_ABI,
      functionName: 'completeTask',
      args: [taskId],
    });
  };

  return { completeTask, isPending, isConfirming, isConfirmed, hash };
}

export function useEscrowBalance(address: `0x${string}` | undefined) {
  const { data: balance } = useBalance({
    address,
    token: CONTRACT_ADDRESSES.bsc.usdt as `0x${string}`,
  });

  return balance;
}

// Helper to handle errors safely
export function handleEscrowError(error: any) {
  return { success: false, message: error?.message || 'Unknown error' } as any;
}
