import { Order } from '../types';

/**
 * Converts an array of objects to a CSV string.
 */
export const convertToCSV = (objArray: any[]) => {
  if (objArray.length === 0) return '';
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  const header = Object.keys(array[0]).join(',') + '\r\n';
  str += header;

  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (const index in array[i]) {
      if (line !== '') line += ',';
      
      let value = array[i][index];
      // Handle strings with commas
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      line += value;
    }
    str += line + '\r\n';
  }
  return str;
};

/**
 * Triggers a browser download for a CSV string.
 */
export const downloadCSV = (csvString: string, fileName: string) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Specifically exports orders in a flattened format.
 */
export const exportOrders = (orders: Order[]) => {
  const flattenedOrders = orders.map(o => ({
    OrderID: o.id,
    Timestamp: o.timestamp,
    CustomerID: o.customerId,
    TotalAmount: o.totalAmount,
    GuestCount: o.guestCount,
    Rating: o.rating,
    ItemsCount: o.items.length
  }));
  const csv = convertToCSV(flattenedOrders);
  downloadCSV(csv, `bitex_orders_${new Date().toISOString().split('T')[0]}.csv`);
};

/**
 * Exports current dashboard metrics as a single-row CSV.
 */
export const exportMetrics = (metrics: any) => {
  const data = [{
    DailySales: metrics.totalDailySales,
    AverageOrderValue: metrics.aov,
    RepeatRate: `${metrics.repeatRate.toFixed(2)}%`,
    AverageRating: metrics.avgRating.toFixed(2),
    TopCategory: metrics.contributionData[0]?.name || 'N/A'
  }];
  const csv = convertToCSV(data);
  downloadCSV(csv, `bitex_metrics_${new Date().toISOString().split('T')[0]}.csv`);
};
