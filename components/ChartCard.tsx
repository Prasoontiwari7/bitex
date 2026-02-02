
import React from 'react';

interface ChartCardProps {
  title: string;
  insight: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, insight, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-[32px] shadow-sm border border-amber-100/50 p-8 flex flex-col hover:shadow-2xl hover:shadow-amber-200/20 hover:-translate-y-1 hover:scale-[1.01] transition-all duration-500 ease-out cursor-default ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-slate-900 font-black text-xl tracking-tight">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 transition-transform duration-300 group-hover:rotate-12">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
      </div>
      <div className="flex-grow min-h-[280px]">
        {children}
      </div>
      <div className="mt-8 pt-6 border-t border-amber-50">
        <div className="bg-amber-50/50 rounded-2xl p-4 flex gap-4 items-start border border-amber-100/30 group">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-amber-200 transition-transform duration-300 group-hover:scale-110">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
            <span className="font-black text-amber-600 not-italic uppercase tracking-widest text-[10px] block mb-0.5">Strategic Insight</span>
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
