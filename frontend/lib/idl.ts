export const IDL = {
  version: '0.1.0',
  name: 'contracts',
  address: 'Fo5yHR18hNooLoFzxYcjpi5BoUx5rhnxhzVRetpVeSsY',
  metadata: {
    address: 'Fo5yHR18hNooLoFzxYcjpi5BoUx5rhnxhzVRetpVeSsY',
    source: 'anchor',
    spec: '0.1.0'
  },
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'globalState', isMut: true, isSigner: false },
        { name: 'payer', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [{ name: 'admin', type: 'publicKey' }]
    },
    {
      name: 'setMerkleRoot',
      accounts: [
        { name: 'globalState', isMut: true, isSigner: false },
        { name: 'admin', isMut: false, isSigner: true }
      ],
      args: [{ name: 'merkleRoot', type: { array: ['u8', 32] } }]
    },
    {
      name: 'createBattle',
      accounts: [
        { name: 'battle', isMut: true, isSigner: false },
        { name: 'battleVault', isMut: true, isSigner: false },
        { name: 'creator', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'battleType', type: { defined: 'BattleType' } },
        { name: 'leagueAmount', type: 'u64' },
        { name: 'durationDays', type: 'u8' }
      ]
    },
    {
      name: 'joinBattle',
      accounts: [
        { name: 'battle', isMut: true, isSigner: false },
        { name: 'battleVault', isMut: true, isSigner: false },
        { name: 'player', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: 'commitInitialState',
      accounts: [
        { name: 'battle', isMut: false, isSigner: false },
        { name: 'playerCommit', isMut: true, isSigner: false },
        { name: 'player', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [{ name: 'walletBalanceHash', type: { array: ['u8', 32] } }]
    },
    {
      name: 'claimWinnings',
      accounts: [
        { name: 'battle', isMut: false, isSigner: false },
        { name: 'battleVault', isMut: true, isSigner: false },
        { name: 'globalState', isMut: false, isSigner: false },
        { name: 'winner', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'merkleProof', type: { vec: { array: ['u8', 32] } } },
        { name: 'amount', type: 'u64' },
        { name: 'leafHash', type: { array: ['u8', 32] } }
      ]
    },
    {
      name: 'placeBet',
      accounts: [
        { name: 'battle', isMut: false, isSigner: false },
        { name: 'bettingPool', isMut: true, isSigner: false },
        { name: 'bet', isMut: true, isSigner: false },
        { name: 'bettingVault', isMut: true, isSigner: false },
        { name: 'bettorTokenAccount', isMut: true, isSigner: false },
        { name: 'bettor', isMut: true, isSigner: true },
        { name: 'mint', isMut: false, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'predictedWinner', type: 'publicKey' },
        { name: 'betAmount', type: 'u64' }
      ]
    },
    {
      name: 'claimBetWinnings',
      accounts: [
        { name: 'battle', isMut: false, isSigner: false },
        { name: 'bet', isMut: true, isSigner: false },
        { name: 'bettingVault', isMut: true, isSigner: false },
        { name: 'globalState', isMut: false, isSigner: false },
        { name: 'bettorTokenAccount', isMut: true, isSigner: false },
        { name: 'bettor', isMut: false, isSigner: true },
        { name: 'tokenProgram', isMut: false, isSigner: false }
      ],
      args: [
        { name: 'merkleProof', type: { vec: { array: ['u8', 32] } } },
        { name: 'payoutAmount', type: 'u64' },
        { name: 'leafHash', type: { array: ['u8', 32] } }
      ]
    }
  ],
  accounts: [
    {
      name: 'globalState',
      type: {
        kind: 'struct',
        fields: [
          { name: 'admin', type: 'publicKey' },
          { name: 'merkleRoot', type: { array: ['u8', 32] } },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'battle',
      type: {
        kind: 'struct',
        fields: [
          { name: 'creator', type: 'publicKey' },
          { name: 'battleType', type: { defined: 'BattleType' } },
          { name: 'leagueAmount', type: 'u64' },
          { name: 'maxPlayers', type: 'u8' },
          { name: 'currentPlayers', type: 'u8' },
          { name: 'players', type: { vec: 'publicKey' } },
          { name: 'startTime', type: 'i64' },
          { name: 'endTime', type: 'i64' },
          { name: 'isActive', type: 'bool' },
          { name: 'totalPool', type: 'u64' },
          { name: 'bump', type: 'u8' }
        ]
      }
    },
    {
      name: 'bettingPool',
      type: {
        kind: 'struct',
        fields: [
          { name: 'battle', type: 'publicKey' },
          { name: 'totalPool', type: 'u64' },
          { name: 'betsOnPlayerA', type: 'u64' },
          { name: 'betsOnPlayerB', type: 'u64' },
          { name: 'isSettled', type: 'bool' }
        ]
      }
    },
    {
      name: 'bet',
      type: {
        kind: 'struct',
        fields: [
          { name: 'bettor', type: 'publicKey' },
          { name: 'battle', type: 'publicKey' },
          { name: 'predictedWinner', type: 'publicKey' },
          { name: 'amount', type: 'u64' },
          { name: 'isClaimed', type: 'bool' }
        ]
      }
    },
    {
      name: 'playerCommit',
      type: {
        kind: 'struct',
        fields: [
          { name: 'battle', type: 'publicKey' },
          { name: 'player', type: 'publicKey' },
          { name: 'walletBalanceHash', type: { array: ['u8', 32] } },
          { name: 'timestamp', type: 'i64' },
          { name: 'isVerified', type: 'bool' }
        ]
      }
    }
  ],
  types: [
    {
      name: 'BattleType',
      type: {
        kind: 'enum',
        variants: [{ name: 'OneVsOne' }, { name: 'Friends' }]
      }
    }
  ],
  events: [
    {
      name: 'BattleCreated',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'creator', type: 'publicKey', index: false },
        { name: 'battleType', type: { defined: 'BattleType' }, index: false },
        { name: 'leagueAmount', type: 'u64', index: false },
        { name: 'endTime', type: 'i64', index: false }
      ]
    },
    {
      name: 'PlayerJoined',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'player', type: 'publicKey', index: false },
        { name: 'totalPlayers', type: 'u8', index: false }
      ]
    },
    {
      name: 'WinningsClaimed',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'winner', type: 'publicKey', index: false },
        { name: 'amount', type: 'u64', index: false }
      ]
    },
    {
      name: 'MerkleRootUpdated',
      fields: [
        { name: 'merkleRoot', type: { array: ['u8', 32] }, index: false },
        { name: 'admin', type: 'publicKey', index: false }
      ]
    },
    {
      name: 'BetPlaced',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'bettor', type: 'publicKey', index: false },
        { name: 'predictedWinner', type: 'publicKey', index: false },
        { name: 'amount', type: 'u64', index: false }
      ]
    },
    {
      name: 'BetWinningsClaimed',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'bettor', type: 'publicKey', index: false },
        { name: 'amount', type: 'u64', index: false }
      ]
    },
    {
      name: 'PlayerCommitted',
      fields: [
        { name: 'battle', type: 'publicKey', index: false },
        { name: 'player', type: 'publicKey', index: false },
        { name: 'walletBalanceHash', type: { array: ['u8', 32] }, index: false },
        { name: 'timestamp', type: 'i64', index: false }
      ]
    }
  ],
  errors: [
    { code: 6000, name: 'NotAdmin', msg: 'Not authorized admin' },
    { code: 6001, name: 'InvalidDuration', msg: 'Invalid battle duration' },
    { code: 6002, name: 'BattleNotActive', msg: 'Battle is not active' },
    { code: 6003, name: 'BattleFull', msg: 'Battle is full' },
    { code: 6004, name: 'BattleEnded', msg: 'Battle has ended' },
    { code: 6005, name: 'AlreadyJoined', msg: 'Already joined this battle' },
    { code: 6006, name: 'BattleNotEnded', msg: 'Battle has not ended yet' },
    { code: 6007, name: 'NotParticipant', msg: 'Not a participant in this battle' },
    { code: 6008, name: 'InvalidMerkleProof', msg: 'Invalid merkle proof' },
    { code: 6009, name: 'BettingOnlyFor1v1', msg: 'Betting is only allowed for 1v1 battles' },
    { code: 6010, name: 'BattleNotFull', msg: 'Battle is not full yet' },
    { code: 6011, name: 'InvalidPredictedWinner', msg: 'Invalid predicted winner' },
    { code: 6012, name: 'ParticipantCannotBet', msg: 'Battle participants cannot bet' },
    { code: 6013, name: 'NotBetOwner', msg: 'Not the owner of this bet' },
    { code: 6014, name: 'AlreadyClaimed', msg: 'Bet winnings already claimed' }
  ]
};
