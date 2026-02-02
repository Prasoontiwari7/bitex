
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Legend,
  AreaChart, Area, ReferenceLine, LabelList
} from 'recharts';
import { generateMockData } from './data/mockData';
import { calculateMetrics } from './utils/analytics';
import ChartCard from './components/ChartCard';
import KPICard from './components/KPICard';
import BiteButton from './components/BiteButton';
import ManualInsertModal from './components/ManualInsertModal';
import { DashboardData, Order, Customer } from './types';

const COLORS = ['#F59E0B', '#10B981', '#F43F5E', '#8B5CF6', '#3B82F6', '#6366F1', '#EC4899', '#14B8A6'];
const QUADRANT_COLORS = {
  Star: '#F59E0B',
  Plowhorse: '#FB923C',
  Puzzle: '#6366F1',
  Dog: '#94A3B8'
};

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData>(() => generateMockData());
  const metrics = useMemo(() => calculateMetrics(data), [data]);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Chart Visibility Toggles
  const [hiddenPieCategories, setHiddenPieCategories] = useState<string[]>([]);
  const [hiddenProfitItems, setHiddenProfitItems] = useState<string[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Data for charts
  const filteredPieData = metrics.contributionData.filter(item => !hiddenPieCategories.includes(item.name));
  const filteredProfitData = metrics.sortedProfitItems.filter(item => !hiddenProfitItems.includes(item.name));

  // Handlers
  const handleExtractData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BiteX_Data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure? This will wipe all transaction history.")) {
      setData({ orders: [], customers: [], menuItems: data.menuItems });
      setIsMenuOpen(false);
    }
  };

  const handleManualSave = (formData: { customerName: string; amount: number; guestCount: number; rating: number }) => {
    const customerId = `walk-in-${Date.now()}`;
    const newCustomer: Customer = {
      id: customerId,
      name: formData.customerName,
      firstVisit: new Date().toISOString()
    };

    const newOrder: Order = {
      id: `manual-${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerId: customerId,
      items: [], // Simplified for manual entry
      totalAmount: formData.amount,
      orderPlacedAt: new Date().toISOString(),
      orderServedAt: new Date(Date.now() + 15 * 60000).toISOString(),
      guestCount: formData.guestCount,
      rating: formData.rating
    };

    setData(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer],
      orders: [newOrder, ...prev.orders]
    }));
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">BiteX</h1>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Executive Analytics</span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <BiteButton 
            variant="secondary" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          >
            Management
          </BiteButton>

          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
              <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg></div>
                <div><p className="text-sm font-bold text-slate-800">Record Order</p><p className="text-[10px] text-slate-400 font-medium">Manual transaction entry</p></div>
              </button>
              <button onClick={handleExtractData} className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></div>
                <div><p className="text-sm font-bold text-slate-800">Export Analytics</p><p className="text-[10px] text-slate-400 font-medium">Download JSON snapshot</p></div>
              </button>
              <div className="h-px bg-slate-100 my-2 mx-2" />
              <button onClick={handleClearData} className="w-full text-left px-4 py-3 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-colors group text-rose-600">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></div>
                <div><p className="text-sm font-bold">Reset System</p><p className="text-[10px] opacity-60 font-medium">Wipe all operational data</p></div>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 mt-10">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard label="Daily Revenue" value={`₹${metrics.totalDailySales.toLocaleString()}`} trend={metrics.salesTrend} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <KPICard label="Avg Ticket Size" value={`₹${Math.round(metrics.aov).toLocaleString()}`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
          <KPICard label="Loyalty Rate" value={`${metrics.repeatRate.toFixed(1)}%`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
          <KPICard label="Guest Satisfaction" value={`${metrics.avgRating.toFixed(1)} / 5`} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <ChartCard title="Peak Hours Heatmap" insight="Dinner service (7-10 PM) generates 65% of daily revenue. Staffing should peak at 19:30.">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.peakHourData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue Distribution" insight="Mains contribute the bulk of value. Promote 'Puzzle' appetizers to increase AOV without complexity.">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={filteredPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {filteredPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  onClick={(data: any) => {
                    const { value } = data;
                    setHiddenPieCategories(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Menu Engineering" insight="Items in the top-right are 'Stars'. Increase visibility of 'Plowhorses' via menu positioning.">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name="Quantity Sold" axisLine={false} tickLine={false} label={{ value: 'Quantity', position: 'bottom', offset: 0, fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Profit / Item" axisLine={false} tickLine={false} label={{ value: 'Margin', angle: -90, position: 'left', fontSize: 10 }} />
                <ZAxis type="category" dataKey="quadrant" name="Category" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine x={metrics.avgQty} stroke="#94a3b8" strokeDasharray="5 5" />
                <ReferenceLine y={metrics.avgProfit} stroke="#94a3b8" strokeDasharray="5 5" />
                {Object.keys(QUADRANT_COLORS).map((q) => (
                  <Scatter key={q} name={q} data={metrics.matrixData.filter(d => d.quadrant === q)} fill={(QUADRANT_COLORS as any)[q]} shape="circle" />
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Profit Leaders" insight="Focus inventory control on these 5 items. Small cost reductions here yield maximum bottom-line impact.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredProfitData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#fff7ed'}} />
                <Bar dataKey="totalProfit" fill="#F59E0B" radius={[0, 10, 10, 0]} barSize={20}>
                  {filteredProfitData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Service Velocity" insight="Weekend wait times increase by 12 mins. Pre-prep for high-volume items is critical on Fri/Sat.">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.dayAverages}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} label={{ value: 'Min', angle: -90, position: 'left', fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="waitTime" stroke="#10B981" strokeWidth={4} dot={{r: 6, fill: '#10B981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Party Size Dynamics" insight="2-4 guest parties dominate. Layout optimization should favor modular seating for quick reconfiguration.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.partySizeDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="size" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#3B82F6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </main>

      <ManualInsertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleManualSave} 
      />
    </div>
  );
};

export default App;
