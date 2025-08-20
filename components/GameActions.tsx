
import React from 'react';
import { Card } from './Card';
import { ActionButton } from './ActionButton';
import { SparklesIcon, SwordIcon, ScrollIcon, HammerIcon, CubeIcon } from './IconComponents';

interface GameActionsProps {
  onAction: (action: string) => void;
  isLoading: boolean;
  hasCharacter: boolean;
}

export const GameActions: React.FC<GameActionsProps> = ({ onAction, isLoading, hasCharacter }) => {
  return (
    <Card title="Game Actions" icon={<CubeIcon className="w-6 h-6 text-cyan-400"/>}>
        <div className="flex flex-col space-y-4">
            {!hasCharacter && (
                <ActionButton 
                    onClick={() => onAction('mintCharacter')} 
                    isLoading={isLoading}
                    icon={<SparklesIcon className="w-6 h-6"/>}
                >
                    Mint Character NFT
                </ActionButton>
            )}

            <ActionButton 
                onClick={() => onAction('startQuest')} 
                isLoading={isLoading}
                disabled={!hasCharacter}
                icon={<ScrollIcon className="w-6 h-6"/>}
            >
                Start Quest
            </ActionButton>

            <ActionButton 
                onClick={() => onAction('enterArena')} 
                isLoading={isLoading}
                disabled={!hasCharacter}
                icon={<SwordIcon className="w-6 h-6"/>}
            >
                Battle Arena
            </ActionButton>

            <ActionButton 
                onClick={() => onAction('craftItem')} 
                isLoading={isLoading}
                disabled={!hasCharacter}
                icon={<HammerIcon className="w-6 h-6"/>}
            >
                Craft Item
            </ActionButton>
        </div>
    </Card>
  );
};
