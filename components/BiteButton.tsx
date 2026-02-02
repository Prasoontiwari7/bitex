
import React from 'react';

interface BiteButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  className?: string;
}

const BiteButton: React.FC<BiteButtonProps> = ({ onClick, children, variant = 'primary', icon, className = '' }) => {
  const variants = {
    primary: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-200/50 hover:shadow-amber-300/60',
    secondary: 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800',
    outline: 'bg-white border-2 border-amber-100 text-amber-600 hover:border-amber-500 hover:bg-amber-50',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-1 active:scale-95 ${variants[variant]} ${className}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

export default BiteButton;
