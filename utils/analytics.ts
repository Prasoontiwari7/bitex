
import { DashboardData, Order, MenuItem } from '../types';

export const calculateMetrics = (data: DashboardData) => {
  const { orders, menuItems } = data;
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.timestamp.startsWith(today));

  // 1. Total Daily Sales
  const totalDailySales = todayOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  
  // Previous Day for trend
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
  const yesterdaySales = orders.filter(o => o.timestamp.startsWith(yesterday)).reduce((acc, o) => acc + o.totalAmount, 0);
  const salesTrend = yesterdaySales === 0 ? 0 : ((totalDailySales - yesterdaySales) / yesterdaySales) * 100;

  // 2. Average Order Value (AOV)
  const aov = orders.length > 0 ? orders.reduce((acc, o) => acc + o.totalAmount, 0) / orders.length : 0;

  // 3. Repeat Customer %
  const customerOrderCounts: Record<string, number> = {};
  orders.forEach(o => {
    customerOrderCounts[o.customerId] = (customerOrderCounts[o.customerId] || 0) + 1;
  });
  const totalUniqueCustomers = Object.keys(customerOrderCounts).length;
  const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const repeatRate = (repeatCustomers / totalUniqueCustomers) * 100;

  // 4. Peak Sales Hours
  const hourlySales = new Array(24).fill(0);
  orders.forEach(o => {
    const hour = new Date(o.timestamp).getHours();
    hourlySales[hour] += o.totalAmount;
  });
  const peakHourData = hourlySales.map((sales, hour) => ({
    hour: `${hour}:00`,
    sales,
    intensity: sales / Math.max(...hourlySales)
  }));

  // 5. Customer Rating
  const avgRating = orders.reduce((acc, o) => acc + o.rating, 0) / orders.length;

  // 6. Item Performance Metrics
  const itemPerformance = menuItems.map(mi => {
    let quantitySold = 0;
    orders.forEach(o => {
      o.items.forEach(oi => {
        if (oi.menuItemId === mi.id) quantitySold += oi.quantity;
      });
    });
    const profitPerItem = mi.sellingPrice - mi.costPrice;
    const totalProfit = profitPerItem * quantitySold;
    const totalRevenue = mi.sellingPrice * quantitySold;
    return {
      ...mi,
      quantitySold,
      profitPerItem,
      totalProfit,
      totalRevenue
    };
  });

  const sortedProfitItems = [...itemPerformance].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 5);
  
  // POPULARITY METRIC: Most Ordered Food
  const mostOrderedItems = [...itemPerformance]
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      orders: item.quantitySold,
      revenue: item.totalRevenue
    }));

  // 7. Contribution to Total Sales
  const totalRevenueAll = itemPerformance.reduce((acc, i) => acc + i.totalRevenue, 0);
  const contributionData = itemPerformance
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      value: item.totalRevenue,
      percentage: ((item.totalRevenue / totalRevenueAll) * 100).toFixed(1)
    }));

  // 8. Basket Size Distribution
  const buckets = [
    { range: '₹0-500', min: 0, max: 500, count: 0 },
    { range: '₹500-1k', min: 500, max: 1000, count: 0 },
    { range: '₹1k-2k', min: 1000, max: 2000, count: 0 },
    { range: '₹2k-3k', min: 2000, max: 3000, count: 0 },
    { range: '₹3k+', min: 3000, max: Infinity, count: 0 }
  ];
  orders.forEach(o => {
    const bucket = buckets.find(b => o.totalAmount >= b.min && o.totalAmount < b.max);
    if (bucket) bucket.count++;
  });

  // 9. Day Comparisons
  const dayAverages = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toISOString().split('T')[0];
    
    const prevD = new Date(d);
    prevD.setDate(prevD.getDate() - 7);
    const prevDayStr = prevD.toISOString().split('T')[0];

    const calculateDayAov = (dateStr: string) => {
      const dayOrders = orders.filter(o => o.timestamp.startsWith(dateStr));
      return dayOrders.length === 0 ? 0 : dayOrders.reduce((acc, o) => acc + o.totalAmount, 0) / dayOrders.length;
    };

    return { 
      day: d.toLocaleDateString('en-US', { weekday: 'short' }), 
      aov: Math.round(calculateDayAov(dayStr)),
      prevAov: Math.round(calculateDayAov(prevDayStr) || calculateDayAov(dayStr) * 0.95)
    };
  });

  // 10. Average Party Size
  const partySizeDist = Array.from({ length: 6 }, (_, i) => ({ 
    size: i === 5 ? '6+ Guests' : `${i + 1} Guests`, 
    count: 0 
  }));
  orders.forEach(o => {
    const idx = Math.min(o.guestCount - 1, 5);
    partySizeDist[idx].count++;
  });

  // 11. Menu Engineering Matrix
  const avgQty = itemPerformance.reduce((acc, i) => acc + i.quantitySold, 0) / itemPerformance.length;
  const avgProfit = itemPerformance.reduce((acc, i) => acc + i.profitPerItem, 0) / itemPerformance.length;
  
  const matrixData = itemPerformance.map(item => {
    let quadrant = '';
    if (item.quantitySold >= avgQty && item.profitPerItem >= avgProfit) quadrant = 'Star';
    else if (item.quantitySold >= avgQty && item.profitPerItem < avgProfit) quadrant = 'Plowhorse';
    else if (item.quantitySold < avgQty && item.profitPerItem >= avgProfit) quadrant = 'Puzzle';
    else quadrant = 'Dog';

    return {
      name: item.name,
      x: item.quantitySold,
      y: item.profitPerItem,
      quadrant
    };
  });

  return {
    totalDailySales,
    salesTrend,
    aov,
    repeatRate,
    peakHourData,
    avgRating,
    sortedProfitItems,
    mostOrderedItems,
    contributionData,
    buckets,
    dayAverages,
    partySizeDist,
    matrixData,
    avgQty,
    avgProfit
  };
};
