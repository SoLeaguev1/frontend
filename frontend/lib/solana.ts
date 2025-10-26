import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import { IDL } from './idl';

const PROGRAM_ID = new PublicKey('Fo5yHR18hNooLoFzxYcjpi5BoUx5rhnxhzVRetpVeSsY');
const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

function getProvider(wallet: any): AnchorProvider {
  return new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
}

function getProgram(wallet: any) {
  const provider = getProvider(wallet);
  return new Program(IDL as any, PROGRAM_ID as any, provider as any);
}

export async function initializeContract(wallet: any): Promise<string> {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    const [globalStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('global_state')],
      PROGRAM_ID
    );

    const instructionData = Buffer.alloc(40);
    const discriminator = Buffer.from([0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed]);
    discriminator.copy(instructionData, 0);
    wallet.publicKey.toBuffer().copy(instructionData, 8);

    const initInstruction = new TransactionInstruction({
      keys: [
        { pubkey: globalStatePDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    const transaction = new Transaction().add(initInstruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature);

    return signature;
  } catch (error: any) {
    throw new Error(`Contract initialization failed: ${error.message}`);
  }
}

export async function createBattle(
  wallet: any,
  battleType: 'OneVsOne' | 'Friends',
  leagueAmount: number,
  durationDays: number
): Promise<{battlePDA: PublicKey; signature?: string}> {
  if (!wallet || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  try {
    const lamports = Math.floor(leagueAmount * LAMPORTS_PER_SOL);
    const amountBN = new BN(lamports);

    const [battlePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('battle'),
        wallet.publicKey.toBuffer(),
        amountBN.toArrayLike(Buffer, 'le', 8),
      ],
      PROGRAM_ID
    );

    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('battle_vault'), battlePDA.toBuffer()],
      PROGRAM_ID
    );

    const transaction = new Transaction();

    const instructionData = Buffer.alloc(18);
    const discriminator = Buffer.from([0x02, 0xf9, 0x36, 0xd8, 0x2a, 0x63, 0xbb, 0x66]);
    discriminator.copy(instructionData, 0);

    const battleTypeValue = battleType === 'OneVsOne' ? 0 : 1;
    instructionData.writeUInt8(battleTypeValue, 8);

    amountBN.toArrayLike(Buffer, 'le', 8).copy(instructionData, 9);
    instructionData.writeUInt8(durationDays, 17);

    const createBattleInstruction = new TransactionInstruction({
      keys: [
        { pubkey: battlePDA, isSigner: false, isWritable: true },
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    transaction.add(createBattleInstruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);

    return { battlePDA, signature };
  } catch (error: any) {
    console.error('Battle creation error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    let errorMessage = error.message || 'Unknown error';

    // Check for common error patterns
    if (error?.message?.includes('insufficient')) {
      errorMessage = 'Insufficient SOL balance. Need at least ' + (leagueAmount + 0.01) + ' SOL';
    } else if (error?.message?.includes('0x1')) {
      errorMessage = 'Insufficient funds or account not found.';
    } else if (error?.message?.includes('0x0')) {
      errorMessage = 'Program account not found. Contract may not be deployed on devnet.';
    } else if (error?.message?.includes('Simulation failed')) {
      errorMessage = 'Transaction simulation failed. Check console for logs.';
    } else if (error?.message?.includes('User rejected')) {
      errorMessage = 'Transaction rejected by user.';
    } else if (error?.message?.includes('blockhash not found')) {
      errorMessage = 'Network error. Please try again.';
    } else if (error?.logs) {
      console.error('Transaction logs:', error.logs);
      errorMessage = 'Transaction failed. Check browser console for details.';
    }

    throw new Error(errorMessage);
  }
}

export async function commitInitialState(
  wallet: any,
  battleAddress: string,
  walletBalanceHash: Buffer
): Promise<string> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    const player = wallet.publicKey;
    const battle = new PublicKey(battleAddress);

    const [playerCommitPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('commit'), battle.toBuffer(), player.toBuffer()],
      PROGRAM_ID
    );

    const hashArray = Array.from(walletBalanceHash);

    const tx = await program.methods
      .commitInitialState(hashArray)
      .accounts({
        battle: battle,
        playerCommit: playerCommitPDA,
        player: player,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to commit initial state');
  }
}

export async function joinBattle(
  wallet: any,
  battleAddress: string
): Promise<string> {
  try {
    const program = getProgram(wallet);
    const player = wallet.publicKey;
    const battle = new PublicKey(battleAddress);

    const [battleVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('battle_vault'), battle.toBuffer()],
      PROGRAM_ID
    );

    const tx = await program.methods
      .joinBattle()
      .accounts({
        battle: battle,
        battleVault: battleVaultPDA,
        player: player,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to join battle');
  }
}

export async function placeBet(
  wallet: any,
  battleAddress: string,
  predictedWinner: string,
  betAmount: number
): Promise<{betPDA: PublicKey; signature?: string}> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const bettor = wallet.publicKey;
    const lamports = solToLamports(betAmount);

    if (battleAddress === 'DemoB4tt1ePDA1111111111111111111111111111111') {
      const vaultAddress = new PublicKey('53WQ1Mqh5jALs4deBTSWJEqoMn57rmnFs2wuZzf6sN1a');

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: bettor,
          toPubkey: vaultAddress,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = bettor;

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      const [betPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('bet'), Buffer.from('demo'), bettor.toBuffer()],
        PROGRAM_ID
      );

      return { betPDA, signature };
    }

    const battle = new PublicKey(battleAddress);
    const predictedWinnerPubkey = new PublicKey(predictedWinner);
    const amountBN = new BN(lamports);

    const [betPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('bet'), battle.toBuffer(), bettor.toBuffer()],
      PROGRAM_ID
    );

    const [bettingPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('betting_pool'), battle.toBuffer()],
      PROGRAM_ID
    );

    const [bettingVaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('betting_vault'), battle.toBuffer()],
      PROGRAM_ID
    );

    const instructionData = Buffer.alloc(48);
    const discriminator = Buffer.from([0xde, 0x3e, 0x43, 0xdc, 0x3f, 0xa6, 0x7e, 0x21]);
    discriminator.copy(instructionData, 0);

    predictedWinnerPubkey.toBuffer().copy(instructionData, 8);
    amountBN.toArrayLike(Buffer, 'le', 8).copy(instructionData, 40);

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: battle, isSigner: false, isWritable: false },
        { pubkey: bettingPoolPDA, isSigner: false, isWritable: true },
        { pubkey: betPDA, isSigner: false, isWritable: true },
        { pubkey: bettingVaultPDA, isSigner: false, isWritable: true },
        { pubkey: bettor, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    });

    const transaction = new Transaction().add(instruction);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = bettor;

    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature);

    return { betPDA, signature };
  } catch (error: any) {
    console.error('Bet placement error:', error);
    throw new Error(error.message || 'Failed to place bet');
  }
}

export async function claimWinnings(
  wallet: any,
  battleAddress: string,
  merkleProof: Buffer[],
  amount: number,
  leafHash: Buffer
): Promise<string> {
  const program = getProgram(wallet);
  const winner = wallet.publicKey;
  const battle = new PublicKey(battleAddress);

  const [battleVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('battle_vault'), battle.toBuffer()],
    PROGRAM_ID
  );

  const [globalStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_state')],
    PROGRAM_ID
  );

  const proofArrays = merkleProof.map(p => Array.from(p));
  const leafHashArray = Array.from(leafHash);

  const tx = await program.methods
    .claimWinnings(proofArrays, new BN(amount), leafHashArray)
    .accounts({
      battle,
      battleVault: battleVaultPDA,
      globalState: globalStatePDA,
      winner,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export async function claimBetWinnings(
  wallet: any,
  battleAddress: string,
  merkleProof: Buffer[],
  payoutAmount: number,
  leafHash: Buffer
): Promise<string> {
  const program = getProgram(wallet);
  const bettor = wallet.publicKey;
  const battle = new PublicKey(battleAddress);

  const [betPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), battle.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  );

  const [bettingVaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('betting_vault'), battle.toBuffer()],
    PROGRAM_ID
  );

  const [globalStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_state')],
    PROGRAM_ID
  );

  const proofArrays = merkleProof.map(p => Array.from(p));
  const leafHashArray = Array.from(leafHash);

  const tx = await program.methods
    .claimBetWinnings(proofArrays, new BN(payoutAmount), leafHashArray)
    .accounts({
      battle,
      bet: betPDA,
      bettingVault: bettingVaultPDA,
      globalState: globalStatePDA,
      bettor,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return tx;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function getProgramId(): PublicKey {
  return PROGRAM_ID;
}

export function hashWalletBalance(walletAddress: string, balance: number): Buffer {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${walletAddress}:${balance}:${Date.now()}`);

  const hash = new Uint8Array(32);
  for (let i = 0; i < data.length; i++) {
    hash[i % 32] ^= data[i];
  }

  return Buffer.from(hash);
}

export async function initializeGlobalState(wallet: any): Promise<string> {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getProgram(wallet);
    const admin = wallet.publicKey;

    const [globalStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('global_state')],
      PROGRAM_ID
    );

    const tx = await program.methods
      .initialize(admin)
      .accounts({
        globalState: globalStatePDA,
        payer: admin,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to initialize global state');
  }
}
