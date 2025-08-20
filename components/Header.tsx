import React from 'react';
import { ZetaChainIcon, CubeIcon, WalletIcon } from './IconComponents';

interface HeaderProps {
    address: string | null;
}

export const Header: React.FC<HeaderProps> = ({ address }) => {
    
    const truncateAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

    return (
        <header className="fixed top-0 left-0 right-0 bg-slate-900/50 backdrop-blur-md border-b border-cyan-500/20 z-10">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <CubeIcon className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
                        ZetaChain <span className="text-cyan-400">Odyssey</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2 p-2 rounded-md bg-slate-800 border border-slate-700">
                        <ZetaChainIcon />
                        <span className="text-white font-semibold">ZetaChain Athens 3</span>
                    </div>
                    {address ? (
                         <div className="flex items-center space-x-3 p-2 rounded-md bg-green-900/30 border border-green-500/50">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <WalletIcon className="w-5 h-5 text-green-400"/>
                            <span className="text-green-300 font-mono text-sm">{truncateAddress(address)}</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 text-yellow-400">
                            <span className="relative flex h-3 w-3">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                            <span>Disconnected</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};