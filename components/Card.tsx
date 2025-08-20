
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, icon }) => {
  return (
    <div className={`
      bg-slate-900/50 
      border border-cyan-500/20 
      rounded-lg 
      backdrop-blur-sm 
      shadow-lg 
      shadow-cyan-500/10
      transition-all duration-300
      h-full
      ${className || ''}
    `}>
      {title && (
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center space-x-3">
            {icon}
            <h2 className="text-xl font-bold text-cyan-300 tracking-wider uppercase">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
