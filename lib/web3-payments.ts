// Web3 Payment Integration for TaskHub
// Supports TON blockchain via smart contract

import { supabase } from './supabase';

export interface PaymentTransaction {
  id: string;
  task_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: 'ton' | 'usd';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tx_hash?: string;
  created_at: string;
}

// Initialize Web3 connection (using wagmi)
export const initializeWeb3 = async () => {
  try {
    // Check if Web3 provider is available
    if (typeof window === 'undefined') return null;
    
    // Initialize TonConnect for TON blockchain
    // This requires TonConnect SDK
    return true;
  } catch (error) {
    console.error('Failed to initialize Web3:', error);
    return false;
  }
};

// Create escrow payment
export const createEscrowPayment = async (
  taskId: string,
  fromUserId: string,
  toUserId: string,
  amount: number,
  currency: 'ton' | 'usd' = 'ton'
): Promise<PaymentTransaction | null> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        task_id: taskId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        currency,
        payment_method: 'web3_wallet',
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating escrow payment:', error);
    return null;
  }
};

// Process payment with Web3
export const processPaymentWeb3 = async (
  paymentId: string,
  txHash: string,
  contractAddress?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        tx_hash: txHash,
        contract_address: contractAddress,
        completed_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing payment:', error);
    return false;
  }
};

// Get payment history
export const getPaymentHistory = async (
  userId: string,
  limit: number = 20
): Promise<PaymentTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

// Get balance from blockchain
export const getBlockchainBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    // TODO: Implement actual blockchain balance fetching
    // This would interact with TON RPC or similar
    console.log('Fetching balance for:', walletAddress);
    return null;
  } catch (error) {
    console.error('Error fetching blockchain balance:', error);
    return null;
  }
};

// Validate Web3 transaction
export const validateTransaction = async (
  txHash: string,
  expectedAmount: number,
  expectedRecipient: string
): Promise<boolean> => {
  try {
    // TODO: Implement actual blockchain transaction validation
    // This would check the transaction on TON blockchain
    console.log('Validating transaction:', txHash);
    return true;
  } catch (error) {
    console.error('Error validating transaction:', error);
    return false;
  }
};

// Calculate platform fee (10% commission)
export const calculatePlatformFee = (amount: number, currency: string): number => {
  const feePercentage = 0.10; // 10% platform fee (Pulse commission)
  return amount * feePercentage;
};

// Calculate executor payout (after 10% platform fee)
export const calculateExecutorPayout = (taskReward: number): number => {
  const platformFee = calculatePlatformFee(taskReward, 'usdt');
  return taskReward - platformFee; // 90% goes to executor
};

// Currency conversion rates
const exchangeRates: Record<string, number> = {
  'USDT': 1,
  'STARS': 0.01, // 1 Star = $0.01 USD
  'TON': 2.5,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  const fromRate = exchangeRates[fromCurrency.toUpperCase()] || 1;
  const toRate = exchangeRates[toCurrency.toUpperCase()] || 1;
  return (amount / fromRate) * toRate;
};

// Convert USDT to Stars (1 USDT = 100 Stars)
export const usdtToStars = (usdt: number): number => usdt * 100;

// Convert Stars to USDT (100 Stars = 1 USDT)
export const starsToUsdt = (stars: number): number => stars / 100;
