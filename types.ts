
export interface MenuItem {
  id: string;
  name: string;
  category: 'Appetizer' | 'Main' | 'Dessert' | 'Beverage';
  sellingPrice: number;
  costPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  timestamp: string; // ISO format
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  orderPlacedAt: string;
  orderServedAt: string;
  guestCount: number;
  rating: number; // 1-5
}

export interface Customer {
  id: string;
  name: string;
  firstVisit: string;
}

export interface DashboardData {
  orders: Order[];
  menuItems: MenuItem[];
  customers: Customer[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  [key: string]: any;
}
