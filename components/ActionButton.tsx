
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, isLoading, disabled, children, className, icon }) => {
  const baseClasses = `
    w-full px-6 py-4 flex items-center justify-center space-x-3 
    text-lg font-bold uppercase tracking-widest 
    border-2 rounded-md transition-all duration-300 
    focus:outline-none focus:ring-4
  `;

  const enabledClasses = `
    border-cyan-400 text-cyan-300
    bg-cyan-900/20 hover:bg-cyan-500/30 hover:shadow-cyan-500/50
    focus:ring-cyan-500/50
    shadow-lg
  `;

  const disabledClasses = `
    border-gray-600 text-gray-500 bg-gray-800/50
    cursor-not-allowed
  `;

  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${disabled || isLoading ? disabledClasses : enabledClasses} ${className || ''}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
            {icon}
            <span>{children}</span>
        </>
      )}
    </button>
  );
};
