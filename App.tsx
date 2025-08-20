import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import type { Player, ActivityLog } from './types';
import { Header } from './components/Header';
import { PlayerStats } from './components/PlayerStats';
import { GameActions } from './components/GameActions';
import { ActivityFeed } from './components/ActivityFeed';
import { WalletIcon, ZetaChainIcon } from './components/IconComponents';
import { AIAssistant } from './components/AIAssistant';

// In a real app, these would come from a constants file and the ABI from build artifacts
const MOCK_CONTRACT_ADDRESS = "0xAbC...dEf";

const App: React.FC = () => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    const addLog = useCallback((message: string, status: 'success' | 'pending' | 'error') => {
        setActivityLog(prev => [
            ...prev,
            { id: Date.now(), message, status, timestamp: new Date().toLocaleTimeString() }
        ]);
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            addLog('MetaMask is not installed. Please install it to continue.', 'error');
            return;
        }
        
        setIsConnecting(true);
        addLog('Connecting to wallet...', 'pending');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            // You could check chainId here to ensure it's ZetaChain Athens 3 testnet
            // const network = await provider.getNetwork();
            // if (network.chainId !== 7001n) {
            //     addLog('Please switch to ZetaChain Athens 3 Testnet in MetaMask.', 'error');
            //     setIsConnecting(false);
            //     return;
            // }

            setSigner(signer);
            addLog(`Wallet connected: ${address}`, 'success');
            loadInitialData(address);
        } catch (err) {
            console.error(err);
            addLog('Failed to connect wallet.', 'error');
        } finally {
            setIsConnecting(false);
        }
    };
    
    const loadInitialData = (address: string) => {
        addLog('Fetching player data from contract...', 'pending');
        // Simulate fetching data from the smart contract
        setTimeout(() => {
            setPlayer({
                address: address,
                zetaBalance: 12.3456, // This would be fetched using provider.getBalance(address)
                gameTokenBalance: 1000,
                level: 1,
                characterNFT: null,
                items: [],
            });
            addLog('Player data loaded successfully.', 'success');
        }, 1000);
    };

    const handleAction = async (action: string) => {
        if (isLoading || !player || !signer) return;

        setIsLoading(true);
        addLog(`Action initiated: ${action}...`, 'pending');

        // This simulates an ethers.js contract interaction lifecycle
        try {
            // const gameContract = new ethers.Contract(MOCK_CONTRACT_ADDRESS, ABI, signer);
            addLog('Please confirm the transaction in your wallet.', 'pending');
            await new Promise(res => setTimeout(res, 1500)); // Simulate user signing time
            
            // const tx = await gameContract.someMethod(...);
            const fakeTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            addLog(`Transaction sent: ${fakeTxHash.substring(0, 10)}...`, 'pending');
            
            await new Promise(res => setTimeout(res, 3000)); // Simulate block confirmation time
            // await tx.wait();

            // If transaction is successful, update state
            switch(action) {
                case 'mintCharacter':
                    setPlayer(p => p ? {
                        ...p,
                        characterNFT: {
                            name: 'Zeta Warrior',
                            class: 'Cyber Knight',
                            imageUrl: `https://picsum.photos/seed/${p.address}/200`
                        },
                        gameTokenBalance: p.gameTokenBalance - 100
                    } : null);
                    addLog('Character NFT minted successfully!', 'success');
                    break;
                case 'startQuest':
                    setPlayer(p => p ? { ...p, gameTokenBalance: p.gameTokenBalance + 50 } : null);
                    addLog('Quest "Crystal Caverns" started. Reward: 50 Tokens.', 'success');
                    break;
                case 'enterArena':
                     setPlayer(p => p ? { ...p, level: p.level + 1 } : null);
                    addLog('Victory in the arena! You are now Level 2.', 'success');
                    break;
                case 'craftItem':
                     setPlayer(p => p ? {
                        ...p,
                        items: [...p.items, 'Cyber Shield'],
                        gameTokenBalance: p.gameTokenBalance - 25,
                    } : null);
                    addLog('Crafted [Cyber Shield].', 'success');
                    break;
                default:
                    throw new Error('Unknown action');
            }
        } catch (error) {
            addLog(`Transaction failed: ${action}.`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderGame = () => (
        <main className="container mx-auto px-6 pt-24 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <PlayerStats player={player} />
                </div>
                <div className="lg:col-span-4">
                    <GameActions 
                        onAction={handleAction} 
                        isLoading={isLoading}
                        hasCharacter={!!player?.characterNFT}
                    />
                </div>
                <div className="lg:col-span-4 space-y-4">
                    <ActivityFeed logs={activityLog} />
                    <AIAssistant />
                </div>
            </div>
        </main>
    );

    const renderConnect = () => (
        <main className="container mx-auto px-6 pt-24 pb-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="text-center bg-slate-900/60 p-10 rounded-lg border border-cyan-500/20 shadow-xl max-w-lg">
                <ZetaChainIcon />
                <h2 className="text-3xl font-bold mt-4 mb-2 text-white">Welcome to ZetaChain Odyssey</h2>
                <p className="text-slate-400 mb-8">Connect your wallet to interact with the game's smart contracts on the ZetaChain network and begin your adventure.</p>
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full max-w-xs mx-auto px-6 py-4 flex items-center justify-center space-x-3 text-lg font-bold uppercase tracking-widest border-2 rounded-md transition-all duration-300 focus:outline-none focus:ring-4 border-cyan-400 text-cyan-300 bg-cyan-900/20 hover:bg-cyan-500/30 hover:shadow-cyan-500/50 focus:ring-cyan-500/50 shadow-lg disabled:border-gray-600 disabled:text-gray-500 disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                >
                    {isConnecting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Connecting...</span>
                        </>
                    ) : (
                        <>
                            <WalletIcon className="w-6 h-6"/>
                            <span>Connect Wallet</span>
                        </>
                    )}
                </button>
            </div>
        </main>
    );


    return (
        <div 
            className="min-h-screen bg-slate-900 text-white font-sans bg-cover bg-fixed"
            style={{ backgroundImage: 'url("https://picsum.photos/seed/space/1920/1080")' }}
        >
            <div className="min-h-screen bg-slate-900/80 backdrop-blur-sm">
                <Header address={player?.address ?? null} />
                {player ? renderGame() : renderConnect()}
            </div>
        </div>
    );
};

export default App;