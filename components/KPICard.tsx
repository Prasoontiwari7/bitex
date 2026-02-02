
import React from 'react';

interface KPICardProps {
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
  isCurrency?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, trend, icon }) => {
  const isPositive = trend && trend >= 0;

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-amber-50 p-7 flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-200/40 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 ease-out group cursor-default">
      <div className="flex justify-between items-start mb-6">
        <span className="text-slate-400 font-bold text-[10px] tracking-[0.15em] uppercase">{label}</span>
        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{value}</h2>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">vs prev period</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 w-full h-1.5 bg-amber-50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${isPositive ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-rose-400 to-pink-500'}`} 
          style={{ width: '72%' }}
        ></div>
      </div>
    </div>
  );
};

export default KPICard;
