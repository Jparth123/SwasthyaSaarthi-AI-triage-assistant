import React from 'react';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'crimson' | 'purple' | 'cyan' | 'gold' | 'emerald'
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors no-select';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantStyles = {
    default: 'bg-white/10 text-zinc-300 border border-white/10',
    crimson: 'bg-[#E60012]/15 text-red-400 border border-[#E60012]/30',
    purple: 'bg-[#5A2D82]/20 text-purple-300 border border-[#5A2D82]/40',
    cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    gold: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
