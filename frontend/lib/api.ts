const ORACLE_BACKEND_URL = process.env.NEXT_PUBLIC_ORACLE_BACKEND_URL || 'http://localhost:4000';

export async function getWalletSnapshot(walletAddress: string) {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/wallet/${walletAddress}/snapshot`);
  if (!response.ok) {
    throw new Error('Failed to fetch wallet snapshot');
  }
  return response.json();
}

export async function settleBattle(
  battleId: string,
  players: string[],
  bets: { bettor: string; predictedWinner: string; amount: number }[],
  battlePrizePool: number
) {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/battle/${battleId}/settle`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      players,
      bets,
      battlePrizePool,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to settle battle');
  }

  return response.json();
}

export async function getBattleSnapshot(battleId: string, ipfsCid: string) {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/battle/${battleId}/snapshot/${ipfsCid}`);
  if (!response.ok) {
    throw new Error('Failed to fetch battle snapshot');
  }
  return response.json();
}

export async function getMerkleProof(
  battleResult: any,
  player: string,
  amount: number
) {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/merkle/proof`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      battleResult,
      player,
      amount,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get merkle proof');
  }

  return response.json();
}

export async function fetchWalletSnapshot(walletAddress: string) {
  return getWalletSnapshot(walletAddress);
}

export async function getSolanaTopTokens() {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/tokens/top`);
  if (!response.ok) {
    throw new Error('Failed to fetch tokens from Zerion API');
  }
  return response.json();
}

export async function fetchTokenPrices(tokenAddresses: string[]) {
  const response = await fetch(`${ORACLE_BACKEND_URL}/api/tokens/prices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tokens: tokenAddresses }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch token prices from Zerion API');
  }

  return response.json();
}

export async function getWalletPortfolioValue(walletAddress: string) {
  const snapshot = await getWalletSnapshot(walletAddress);
  return snapshot?.totalValue || 0;
}
