## ZetaChain Smart Contract Game UI (with Gemini AI Assistant)

This project is a full-stack demo of a blockchain game built for ZetaChain that includes:

- A set of Solidity smart contracts for gameplay primitives (ERC20 token, ERC721 character NFTs, actions, items).
- A React + Vite frontend that connects a wallet, shows player stats, actions, and an activity feed.
- An optional Gemini-powered AI assistant to help users with questions about the game and ZetaChain.

The codebase is structured so you can develop locally, deploy contracts to ZetaChain (testnet/mainnet), and interact from the UI.

### High-Level Overview

- **Smart contracts** live in `contracts/` and include:
  - `GameContract.sol` (core gameplay/state + events)
  - `GameToken` (ERC20 in-game currency, symbol `GTK`)
  - `GameNFT` (ERC721 character NFTs)
- **Dev tooling** is configured with Hardhat (`hardhat.config.ts`), deployment and verification scripts in `scripts/`, and tests in `test/`.
- **Frontend** is a React app (Vite) in the repo root with UI components in `components/` and app state in `App.tsx`.
- **AI server** is a small Express service in `server/` that exposes `POST /api/ai/chat` and uses Gemini via `@google/generative-ai`.

## How It Works (End to End)

### 1) Contracts and Game Logic

- `contracts/GameContract.sol` deploys and owns two helper contracts:
  - `GameToken` (ERC20): mints/burns gameplay rewards and costs.
  - `GameNFT` (ERC721): mints character NFTs with metadata.
- Players can:
  - Register: get initial tokens and a `Player` record stored on-chain.
  - Mint character: pay tokens to mint an NFT character with stats.
  - Perform actions: `mine`, `battle`, `completeQuest` (earn tokens + XP, cooldowns apply).
  - Buy items: purchase predefined items using tokens.
- Events (e.g., `PlayerRegistered`, `CharacterMinted`, `GameAction`) can be read by off-chain services/UIs to update state.

Development and deployment use Hardhat. See `scripts/deploy.ts` and `scripts/verify.ts` for automation, and `test/GameContract.test.ts` for usage examples and invariants.

### 2) Frontend App

- The UI connects a wallet (MetaMask) via `ethers` and shows:
  - Player stats (`components/PlayerStats.tsx`)
  - Game actions (`components/GameActions.tsx`)
  - Activity feed (`components/ActivityFeed.tsx`)
- The AI assistant panel (`components/AIAssistant.tsx`) is embedded in the right column to answer questions in natural language.
- The sample UI ships with mocked contract calls in `App.tsx`. After deploying, you can replace the mocks with the real contract ABI and address to invoke on-chain methods (using `ethers.Contract`).

### 3) Gemini AI Assistant

- Server: `server/index.ts` exposes `POST /api/ai/chat` (JSON) and calls Gemini (`@google/generative-ai`).
- Client: `ai/gemini.ts` posts to the server endpoint; `components/AIAssistant.tsx` renders a simple chat with history.
- Env config allows setting a custom model and base URL. The assistant is instructed to answer concisely in Spanish by default, but you can adjust the system prompt.

## Project Structure

- `contracts/` — Solidity contracts
- `scripts/` — Hardhat deploy/verify/interact scripts
- `test/` — Hardhat tests (TypeScript)
- `server/` — Express server exposing `/api/ai/chat`
- `ai/gemini.ts` — Frontend client for AI server
- `components/` — React UI components (stats, actions, activity, AI)
- `App.tsx` — Main app view and state
- `hardhat.config.ts` — Hardhat configuration (ZetaChain networks included)
- `vite.config.ts` — Vite config for the React app
- `CONTRACT_README.md` — Detailed contract docs and commands

## Prerequisites

- Node.js 18+
- MetaMask (or compatible) in your browser
- For contract deployment: a wallet funded with ZETA (testnet or mainnet)

## Environment Variables

Copy `env.example` to `.env` and fill in values.

- Blockchain/Hardhat
  - `PRIVATE_KEY`: private key (without 0x) for deployments
  - `ZETASCAN_API_KEY`: optional for contract verification
  - `ZETA_TESTNET_RPC`, `ZETA_MAINNET_RPC`: optional custom RPCs
- AI Server
  - `GEMINI_API_KEY`: Gemini API key
  - `GEMINI_MODEL`: default `gemini-1.5-flash` (change as desired)
  - `SERVER_PORT`: default `8787`
  - `VITE_API_BASE_URL`: default `http://localhost:8787` for the frontend to call the server

## Install

```bash
npm install
```

## Run Locally (Frontend + AI Server)

Open two terminals:

```bash
# Terminal 1: start the AI server
npm run dev:ai

# Terminal 2: start the UI
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

## Compile and Test Contracts

```bash
# Compile
npm run compile

# Run tests
npm test
```

## Deploy to ZetaChain

Make sure `.env` has your `PRIVATE_KEY` and you have ZETA gas.

```bash
# Testnet (Athens 3)
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet
```

The deploy script logs addresses for `GameContract`, `GameToken`, and `GameNFT`. Use them to wire the frontend (`ethers.Contract`) or the sample interact script.

## Interact Scripts (Optional)

```bash
# Show contract info (after updating addresses in scripts/interact.ts)
npm run interact:info

# Perform sample gameplay interactions
npm run interact:play
```

## Tech Stack

- Smart Contracts: Solidity, OpenZeppelin
- Tooling: Hardhat, TypeScript, Ethers v6
- Frontend: React 19, Vite
- AI: Express, `@google/generative-ai` (Gemini)

## Notes and Security

- Contracts include basic protections (Ownable, ReentrancyGuard) but should be audited before production use.
- The UI currently simulates contract actions. Replace mocks with real calls once you deploy and have ABI/addresses.
- Never commit real private keys. Use environment variables and secrets.

## Useful Links

- ZetaChain Docs: https://docs.zetachain.com/
- Zeta Testnet Faucet: https://labs.zetachain.com/faucet
- Zeta Testnet Explorer: https://explorer.athens3.zetachain.com
- Zeta Mainnet Explorer: https://explorer.zetachain.com
