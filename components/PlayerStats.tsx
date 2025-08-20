import React from 'react';
import type { Player } from '../types';
import { Card } from './Card';
import { WalletIcon, SparklesIcon, ZetaChainIcon, CubeIcon } from './IconComponents';

interface PlayerStatsProps {
  player: Player | null;
}

const StatItem: React.FC<{ label: string; value: string | number; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
            {icon}
            <span className="text-slate-400">{label}</span>
        </div>
        <span className="font-mono text-white font-bold">{value}</span>
    </div>
);


export const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  if (!player) {
    return (
      <Card title="Player Stats" icon={<WalletIcon className="w-6 h-6 text-cyan-400"/>}>
        <div className="text-center text-slate-400">Loading player data...</div>
      </Card>
    );
  }

  const truncateAddress = (address: string) => `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <Card title="Player Profile" icon={<WalletIcon className="w-6 h-6 text-cyan-400"/>}>
        <div className="space-y-4">
            {player.characterNFT ? (
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <img 
                        src={player.characterNFT.imageUrl} 
                        alt={player.characterNFT.name} 
                        className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan-500 shadow-lg shadow-cyan-500/30"
                    />
                    <h3 className="text-2xl font-bold text-white">{player.characterNFT.name}</h3>
                    <p className="text-cyan-400">{player.characterNFT.class}</p>
                </div>
            ) : (
                <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-slate-700 flex items-center justify-center">
                        <span className="text-5xl text-slate-500">?</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">No Character NFT</h3>
                    <p className="text-slate-500">Mint a character to begin.</p>
                </div>
            )}
            
            <div className="space-y-2">
                <StatItem label="Address" value={truncateAddress(player.address)} icon={<WalletIcon className="w-5 h-5 text-slate-500"/>} />
                <StatItem label="Level" value={player.level} icon={<SparklesIcon className="w-5 h-5 text-slate-500"/>} />
                <StatItem label="ZETA" value={player.zetaBalance.toFixed(4)} icon={<ZetaChainIcon />} />
                <StatItem label="Game Token" value={player.gameTokenBalance} icon={<CubeIcon className="w-5 h-5 text-slate-500"/>} />
            </div>

            <div>
                <h4 className="text-slate-300 font-bold mb-2 mt-4">Inventory</h4>
                <div className="p-3 bg-slate-800/50 rounded-md min-h-[60px] border border-slate-700/50">
                    {player.items.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {player.items.map((item, index) => (
                                <span key={index} className="bg-cyan-900/50 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded border border-cyan-500/30">{item}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm">Your inventory is empty.</p>
                    )}
                </div>
            </div>
        </div>
    </Card>
  );
};