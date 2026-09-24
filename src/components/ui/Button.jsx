import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ariaLabel,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0C] disabled:opacity-50 disabled:cursor-not-allowed no-select touch-target';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#E60012] to-[#B8000E] text-white hover:shadow-[0_0_20px_rgba(230,0,18,0.4)] hover:brightness-110 active:scale-[0.97]',
    secondary: 'bg-gradient-to-r from-[#5A2D82] to-[#3D1D5C] text-white hover:shadow-[0_0_20px_rgba(90,45,130,0.4)] hover:brightness-110 active:scale-[0.97]',
    subtle: 'bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md active:scale-[0.97]',
    ghost: 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-[0.97]',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 active:scale-[0.97]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}
