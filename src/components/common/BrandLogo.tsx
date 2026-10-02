import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  glow = true
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 rounded-xl bg-[#030712] border border-slate-800/80 overflow-hidden ${sizeClasses[size]} ${
        glow ? 'shadow-md shadow-cyan-500/15' : ''
      } ${className}`}
    >
      <img
        src="/logo.png"
        alt="Level Up Infinity Logo"
        className="w-full h-full object-contain p-0.5 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};
