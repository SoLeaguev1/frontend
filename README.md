# Fantasy Crypto League - Frontend

A gamified wallet battle application on Solana that allows users to compete in real-time crypto portfolio battles with betting functionality.

## Technical Architecture

### Core Stack
- **Framework**: Next.js 14 with App Router
- **Runtime**: React 18.3.1 with TypeScript 5.0
- **Blockchain**: Solana Web3.js 1.98.4 with Anchor 0.32.1
- **Styling**: Tailwind CSS with custom CRT/terminal theme
- **Fonts**: Press Start 2P, VT323 (retro gaming aesthetic)

### Solana Integration

#### Smart Contract Interface
- **Program ID**: `Fo5yHR18hNooLoFzxYcjpi5BoUx5rhnxhzVRetpVeSsY`
- **Network**: Configurable via `NEXT_PUBLIC_SOLANA_RPC` (defaults to devnet)
- **Framework**: Anchor for program interaction and account management

#### Wallet Support
Multi-wallet adapter configuration supporting:
- Phantom
- Solflare  
- Coinbase Wallet
- Trust Wallet
- WalletConnect (Zerion integration)

#### Core Contract Functions
```typescript
// Battle lifecycle management
createBattle(battleType, leagueAmount, durationDays) → {battlePDA, signature}
joinBattle(battleAddress) → signature
commitInitialState(battleAddress, walletBalanceHash) → signature

// Betting system
placeBet(battleAddress, predictedWinner, betAmount) → {betPDA, signature}
claimBetWinnings(battleAddress, merkleProof, payoutAmount, leafHash) → signature

// Reward claiming
claimWinnings(battleAddress, merkleProof, amount, leafHash) → signature
```

### Application State Machine

The main game loop follows a finite state machine pattern in `app/page.tsx`:

```
attract → wallet → modeSelect → select/createFriend → bet → fight → gameover
```

#### State Transitions
1. **attract**: Initial splash screen
2. **wallet**: Wallet connection flow
3. **modeSelect**: Choose battle mode (main event vs friend battle)
4. **select**: Player selection for battles
5. **createFriend**: Custom battle creation interface
6. **bet**: Betting interface with Solana integration
7. **fight**: Live battle tracking with real wallet monitoring
8. **gameover**: Results display and winnings claim

### Data Architecture

#### Type Definitions (`types/index.ts`)
```typescript
interface Player {
  id: string;
  username: string;
  walletAddress: string;
  level?: number;
}

interface League {
  id: string;
  name: string;
  players: Player[];
  status: 'pending' | 'active' | 'completed';
  maxPlayers: number;
  prizePool: number;
  rules: LeagueRules;
}

interface WalletSnapshot {
  playerId: string;
  timestamp: Date;
  totalValue: number;
  tokens: TokenBalance[];
  percentageChange: number;
  rank: number;
}
```

#### Backend API Integration (`lib/api.ts`)
- **Base URL**: `NEXT_PUBLIC_ORACLE_BACKEND_URL` (default: `http://localhost:4000`)
- **Real-time Updates**: 30-second intervals during active battles
- **API Functions**:
  - `getWalletSnapshot(address)` - Fetch portfolio data
  - `settleBattle(battleId, players, bets)` - Request battle settlement
  - `getMerkleProof(battleResult, player, amount)` - Get payout proof
  - `getSolanaTopTokens()` - Fetch token data

### Component Architecture

#### Core Game Components
```
components/
├── AttractMode.tsx          # Initial game screen
├── ModeSelect.tsx           # Battle mode selection
├── CharacterSelect.tsx      # Player selection interface
├── BettingModal.tsx         # Solana betting integration
├── FightScreen.tsx          # Live battle monitoring
├── GameOver.tsx             # Results and claiming interface
├── CreateFriendBattle.tsx   # Custom battle creation
└── BattleManager.tsx        # Battle management interface
```

#### Wallet Context (`contexts/WalletContext.tsx`)
Provides application-wide wallet state management with:
- Multi-wallet adapter configuration
- Network selection (Mainnet/Devnet)
- Connection state management
- Transaction signing interface

### Smart Contract Integration Details

#### Program Derived Addresses (PDAs)
```typescript
// Global state PDA
[Buffer.from('global_state')] → globalStatePDA

// Battle-specific PDAs
[Buffer.from('battle'), creator.toBuffer(), amount.toBuffer()] → battlePDA
[Buffer.from('battle_vault'), battlePDA.toBuffer()] → vaultPDA

// Betting PDAs
[Buffer.from('bet'), battlePDA.toBuffer(), bettor.toBuffer()] → betPDA
[Buffer.from('betting_pool'), battlePDA.toBuffer()] → bettingPoolPDA
[Buffer.from('betting_vault'), battlePDA.toBuffer()] → bettingVaultPDA

// Player commitment PDAs
[Buffer.from('commit'), battlePDA.toBuffer(), player.toBuffer()] → playerCommitPDA
```

#### Transaction Construction
All blockchain interactions use manual instruction building for precise control:

```typescript
// Example: Create Battle Instruction
const instructionData = Buffer.alloc(18);
const discriminator = Buffer.from([0x02, 0xf9, 0x36, 0xd8, 0x2a, 0x63, 0xbb, 0x66]);
discriminator.copy(instructionData, 0);

const battleTypeValue = battleType === 'OneVsOne' ? 0 : 1;
instructionData.writeUInt8(battleTypeValue, 8);
amountBN.toArrayLike(Buffer, 'le', 8).copy(instructionData, 9);
instructionData.writeUInt8(durationDays, 17);
```

### Real-time Battle System

#### Wallet Tracking
- **Data Source**: External API for portfolio values
- **Update Frequency**: 30-second intervals during active battles
- **Tracked Metrics**: Total portfolio value, percentage growth, token balances
- **Featured Wallets**: Pre-configured whale wallets for main events

#### Battle Logic (Frontend View)
1. **Initialization**: Display wallet connection and battle setup
2. **Live Tracking**: Real-time UI updates with portfolio data
3. **Settlement**: Display battle results from backend
4. **Claiming**: Interface for payout transactions


#### Responsive Design
- Mobile-first approach with terminal-style interfaces
- Keyboard navigation support
- Touch-friendly betting controls

### Development Environment

#### Scripts
```bash
npm run dev      # Next.js development server (localhost:3000)
npm run build    # Production build with static optimization  
npm run start    # Production server
npm run lint     # ESLint code quality checks
```

#### Environment Variables
```bash
NEXT_PUBLIC_SOLANA_RPC=<solana_rpc_endpoint>           # Default: devnet
NEXT_PUBLIC_ORACLE_BACKEND_URL=<oracle_backend_url>    # Default: localhost:4000
```


### Backend Integration

#### Required Backend API
The frontend expects a backend service providing:
- `GET /api/wallet/{address}/snapshot` - Portfolio data
- `POST /api/battle/{id}/settle` - Battle settlement
- `POST /api/merkle/proof` - Payout proofs
- `GET /api/tokens/top` - Token information

#### Solana Program Interface
- Anchor program for battle and betting logic
- Wallet adapter compatibility
- Transaction signing and submission

### Development Setup

#### Quick Start
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit NEXT_PUBLIC_ORACLE_BACKEND_URL and NEXT_PUBLIC_SOLANA_RPC

# Start development server
npm run dev
```

#### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

#### Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_ORACLE_BACKEND_URL=https://your-backend-api.com
```
