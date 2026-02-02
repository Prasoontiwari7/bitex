import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { generateMockData } from './data/mockData';
import { calculateMetrics } from './utils/analytics';
import { exportOrders, exportMetrics } from './utils/csv';
import ChartCard from './components/ChartCard';
import KPICard from './components/KPICard';
import BiteButton from './components/BiteButton';
import ManualInsertModal from './components/ManualInsertModal';
import { DashboardData, Order } from './types';

// Vibrant data colors that pop against the amber theme
const VIBRANT_DATA_COLORS = ['#3B82F6', '#F43F5E', '#10B981', '#8B5CF6', '#F97316', '#06B6D4'];
const QUADRANT_COLORS = { 
  Star: '#F43F5E', 
  Plowhorse: '#3B82F6', 
  Puzzle: '#8B5CF6', 
  Dog: '#94A3B8' 
};

type DateRange = '7d' | '30d' | 'all';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData>(() => generateMockData());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff = new Date(0);
    
    if (dateRange === '7d') {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30d') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      ...data,
      orders: data.orders.filter(o => new Date(o.timestamp) >= cutoff)
    };
  }, [data, dateRange]);

  const metrics = useMemo(() => calculateMetrics(filteredData), [filteredData]);

  const [hiddenPieCategories, setHiddenPieCategories] = useState<string[]>([]);
  const [hiddenQuadrants, setHiddenQuadrants] = useState<string[]>([]);

  const themeColors = { 
    grid: '#F1F5F9', 
    text: '#64748b', 
    tooltipBg: '#ffffff' 
  };

  const generateAIInsight = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    try {
      // Initialize with Netlify environment variable
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this restaurant performance data and provide a concise, professional 3-sentence executive strategy:
      - Total Daily Sales: ₹${metrics.totalDailySales}
      - Avg Order Value: ₹${Math.round(metrics.aov)}
      - Top Category: ${metrics.contributionData[0]?.name}
      - Customer Satisfaction: ${metrics.avgRating.toFixed(1)}/5.0
      - Menu Performance: ${metrics.matrixData.length} items analyzed.
      Format: One sentence on current health, one on menu engineering (Stars/Plowhorses), and one specific growth tactic.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text || "Insight generation failed.");
    } catch (error) {
      console.error("AI Audit Error:", error);
      setAiInsight("Intelligence engine unavailable. Please check Netlify environment configuration.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredPieData = useMemo(() => {
    return metrics.contributionData.filter(item => !hiddenPieCategories.includes(item.name));
  }, [metrics.contributionData, hiddenPieCategories]);

  const pieLegendPayload = useMemo(() => {
    return metrics.contributionData.map((entry, index) => ({
      value: entry.name,
      id: entry.name,
      type: 'circle',
      color: hiddenPieCategories.includes(entry.name) ? '#E2E8F0' : VIBRANT_DATA_COLORS[index % VIBRANT_DATA_COLORS.length],
      inactive: hiddenPieCategories.includes(entry.name)
    }));
  }, [metrics.contributionData, hiddenPieCategories]);

  const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (data: any) => {
    const id = data.id || data.value;
    setter(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleManualSave = (formData: { customerName: string; amount: number; guestCount: number; rating: number }) => {
    const newOrder: Order = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerId: `walk-in-${Date.now()}`,
      items: [],
      totalAmount: formData.amount,
      orderPlacedAt: new Date().toISOString(),
      orderServedAt: new Date(Date.now() + 20 * 60000).toISOString(),
      guestCount: formData.guestCount,
      rating: formData.rating
    };
    setData(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white min-h-screen pb-12 text-slate-900 transition-colors duration-300">
      <ManualInsertModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleManualSave} />

      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-amber-200/50">BX</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500 font-black hidden sm:inline">BiteX Dashboard</span>
            </h1>
            
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl gap-1">
              {(['7d', '30d', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    dateRange === range 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BiteButton 
              onClick={generateAIInsight}
              variant="outline"
              className="hidden md:flex"
              icon={isAiLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
            >
              AI Audit
            </BiteButton>

            {/* Export Dropdown */}
            <div className="relative">
              <BiteButton 
                onClick={() => { setIsExportOpen(!isExportOpen); setIsMenuOpen(false); }} 
                variant="outline" 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
              >
                Export
              </BiteButton>
              {isExportOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Current View ({dateRange})</p>
                    </div>
                    <button 
                      onClick={() => { exportOrders(filteredData.orders); setIsExportOpen(false); }} 
                      className="w-full text-left p-3 hover:bg-amber-50 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm12-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zM9 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm12 2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                      </div>
                      <div>
                        <span className="font-bold text-sm block">Raw Orders CSV</span>
                        <span className="text-[10px] text-slate-400">Detailed line items</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => { exportMetrics(metrics); setIsExportOpen(false); }} 
                      className="w-full text-left p-3 hover:bg-amber-50 rounded-2xl flex items-center gap-3 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <div>
                        <span className="font-bold text-sm block">KPI Metrics CSV</span>
                        <span className="text-[10px] text-slate-400">Aggregated performance</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <BiteButton onClick={() => { setIsMenuOpen(!isMenuOpen); setIsExportOpen(false); }} variant="secondary" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>}>
                Ops
              </BiteButton>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-2 z-20">
                    <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left p-3 hover:bg-amber-50 rounded-2xl flex items-center gap-3 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></div>
                      <span className="font-bold text-sm">Manual Entry</span>
                    </button>
                    <button onClick={() => { setData({ orders: [], menuItems: data.menuItems, customers: [] }); setIsMenuOpen(false); }} className="w-full text-left p-3 hover:bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
                      <span className="font-bold text-sm">Reset All Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
        {aiInsight && (
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 rounded-[32px] shadow-xl animate-in slide-in-from-top-4 duration-500">
            <div className="bg-white rounded-[31px] p-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </div>
              <div className="flex-grow">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Live Business Audit</h4>
                <p className="text-slate-800 font-medium italic text-lg leading-relaxed">"{aiInsight}"</p>
              </div>
              <BiteButton onClick={() => setAiInsight(null)} variant="outline" className="flex-shrink-0">Dismiss</BiteButton>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard label="Total Revenue" value={`₹${metrics.totalDailySales.toLocaleString()}`} trend={metrics.salesTrend} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <KPICard label="Avg Ticket Size" value={`₹${Math.round(metrics.aov).toLocaleString()}`} trend={2.1} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
          <KPICard label="Repeat Rate" value={`${metrics.repeatRate.toFixed(1)}%`} trend={4.5} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
          <KPICard label="Exp. Rating" value={`${metrics.avgRating.toFixed(1)}`} trend={0.8} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Most Ordered Food" insight="Item popularity measured by order volume. Multi-colored bars indicate distinct menu categories for quick visual grouping.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.mostOrderedItems} layout="vertical" margin={{ left: 30, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={themeColors.grid} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: themeColors.text, fontSize: 10}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: themeColors.text, fontSize: 10}} width={120} />
                <Tooltip cursor={{fill: '#FFFBEB'}} contentStyle={{backgroundColor: themeColors.tooltipBg, borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="orders" radius={[0, 6, 6, 0]} barSize={32}>
                  {metrics.mostOrderedItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VIBRANT_DATA_COLORS[index % VIBRANT_DATA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Category Revenue Breakdown" insight="Relative contribution of each menu category to total sales. Vital for balancing menu mix and inventory overhead.">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={filteredPieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  {filteredPieData.map((entry, index) => {
                    const originalIndex = metrics.contributionData.findIndex(d => d.name === entry.name);
                    return <Cell key={`cell-${index}`} fill={VIBRANT_DATA_COLORS[originalIndex % VIBRANT_DATA_COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Legend onClick={toggleVisibility(setHiddenPieCategories)} payload={pieLegendPayload} wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: 600}} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Menu Matrix Analysis" insight="Stars (Rose) = High Volume & High Profit. Plowhorses (Blue) = High Volume & Low Profit. Puzzles (Purple) = Low Volume & High Profit.">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.grid} />
                <XAxis type="number" dataKey="x" name="Quantity" axisLine={false} tick={{fontSize: 10, fill: themeColors.text}} />
                <YAxis type="number" dataKey="y" name="Profit" axisLine={false} tick={{fontSize: 10, fill: themeColors.text}} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine x={metrics.avgQty} stroke="#E2E8F0" strokeWidth={1} label={{ value: 'Avg Vol', position: 'top', fill: '#94A3B8', fontSize: 10 }} />
                <ReferenceLine y={metrics.avgProfit} stroke="#E2E8F0" strokeWidth={1} label={{ value: 'Avg Prof', position: 'right', fill: '#94A3B8', fontSize: 10 }} />
                <Scatter name="Star" data={metrics.matrixData.filter(d => d.quadrant === 'Star')} fill={QUADRANT_COLORS.Star} hide={hiddenQuadrants.includes('Star')} />
                <Scatter name="Plowhorse" data={metrics.matrixData.filter(d => d.quadrant === 'Plowhorse')} fill={QUADRANT_COLORS.Plowhorse} hide={hiddenQuadrants.includes('Plowhorse')} />
                <Scatter name="Puzzle" data={metrics.matrixData.filter(d => d.quadrant === 'Puzzle')} fill={QUADRANT_COLORS.Puzzle} hide={hiddenQuadrants.includes('Puzzle')} />
                <Legend onClick={toggleVisibility(setHiddenQuadrants)} verticalAlign="bottom" wrapperStyle={{paddingTop: '10px', fontSize: '10px'}} />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Dynamic Sales Growth" insight="Comparison of current period performance against the previous 7-day average. Solid line shows current trend.">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.dayAverages}>
                <defs>
                  <linearGradient id="colorAov" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={themeColors.grid} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: themeColors.text, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: themeColors.text, fontSize: 10}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Area type="monotone" dataKey="aov" stroke="#F59E0B" strokeWidth={4} fillOpacity={1} fill="url(#colorAov)" />
                <Area type="monotone" dataKey="prevAov" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </main>

      <footer className="mt-20 py-10 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs tracking-widest uppercase">© 2025 BiteX Intelligence • Advanced Solar UI Framework • Netlify Deployment Optimized</p>
      </footer>
    </div>
  );
};

export default App;