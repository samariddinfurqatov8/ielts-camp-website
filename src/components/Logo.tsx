import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showSubtitle = true, className = '' }: LogoProps) {
  const circleSizes = {
    sm: 'w-9 h-9 text-[10px]',
    md: 'w-11 h-11 text-xs',
    lg: 'w-16 h-16 text-sm',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Red Circle with Crisp White Text: IELTS CAMP */}
      <div
        className={`${circleSizes[size]} rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex flex-col items-center justify-center font-black tracking-tight shadow-md shadow-red-600/25 ring-2 ring-red-500/20 shrink-0 leading-none text-center px-1`}
        title="IELTS CAMP"
      >
        <span className="font-extrabold uppercase tracking-tighter">IELTS</span>
        <span className="text-[0.65em] tracking-widest font-bold opacity-95">CAMP</span>
      </div>

      {showSubtitle && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`${titleSizes[size]} font-black tracking-tight text-slate-900`}>
              IELTS <span className="text-red-600">CAMP</span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
            Ta’lim Markazi
          </span>
        </div>
      )}
    </div>
  );
}
