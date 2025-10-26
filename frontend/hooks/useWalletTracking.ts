import { useState, useEffect, useCallback } from 'react';
import { WalletSnapshot } from '../types';
import { fetchWalletSnapshot } from '../lib/api';

// Stub for subscribeToUpdates (WebSocket not yet implemented)
const subscribeToUpdates = async (leagueId: string, callback: (snapshot: any) => void) => {
  return () => {}; // Return unsubscribe function
};

export function useWalletTracking(walletAddress: string, interval: number = 60000) {
  const [snapshot, setSnapshot] = useState<WalletSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWalletSnapshot(walletAddress);
      if (data) {
        setSnapshot(data);
        setError(null);
      } else {
        setError('Failed to fetch wallet data');
      }
    } catch (err) {
      setError('Error fetching wallet snapshot');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchSnapshot();
    const intervalId = setInterval(fetchSnapshot, interval);

    return () => clearInterval(intervalId);
  }, [fetchSnapshot, interval]);

  return { snapshot, loading, error, refetch: fetchSnapshot };
}

export function useLeagueUpdates(leagueId: string) {
  const [snapshots, setSnapshots] = useState<WalletSnapshot[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(true);

    const unsubscribe = subscribeToUpdates(leagueId, (snapshot) => {
      setSnapshots((prev) => {
        const existing = prev.find((s) => s.playerId === snapshot.playerId);
        if (existing) {
          return prev.map((s) =>
            s.playerId === snapshot.playerId ? snapshot : s
          );
        }
        return [...prev, snapshot];
      });
    });

    return () => {
      setConnected(false);
      unsubscribe.then((unsub) => unsub());
    };
  }, [leagueId]);

  return { snapshots, connected };
}

export function useCountdown(endDate: Date) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return timeRemaining;
}
