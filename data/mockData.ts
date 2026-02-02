
import { Order, MenuItem, Customer, DashboardData } from '../types';

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka Angare', category: 'Appetizer', sellingPrice: 450, costPrice: 120 },
  { id: '2', name: 'Butter Chicken Masala', category: 'Main', sellingPrice: 850, costPrice: 280 },
  { id: '3', name: 'Dal Makhani Bukhara', category: 'Main', sellingPrice: 650, costPrice: 150 },
  { id: '4', name: 'Mutton Rogan Josh', category: 'Main', sellingPrice: 1150, costPrice: 380 },
  { id: '5', name: 'Kesari Rasmalai', category: 'Dessert', sellingPrice: 350, costPrice: 90 },
  { id: '6', name: 'Classic Mango Lassi', category: 'Beverage', sellingPrice: 280, costPrice: 60 },
  { id: '7', name: 'Hara Bhara Kabab', category: 'Appetizer', sellingPrice: 420, costPrice: 110 },
  { id: '8', name: 'Paneer Lababdar', category: 'Main', sellingPrice: 750, costPrice: 220 },
  { id: '9', name: 'Gulab Jamun with Rabri', category: 'Dessert', sellingPrice: 400, costPrice: 110 },
  { id: '10', name: 'Masala Cutting Chai', category: 'Beverage', sellingPrice: 180, costPrice: 40 },
];

export const generateMockData = (): DashboardData => {
  const orders: Order[] = [];
  const customers: Customer[] = [];
  const now = new Date();
  
  // Generate ~250 customers
  for (let i = 0; i < 250; i++) {
    customers.push({
      id: `cust-${i}`,
      name: `Guest ${i + 1}`,
      firstVisit: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Generate 45 days of orders for richer trends
  for (let d = 0; d < 45; d++) {
    const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    // More orders on weekends (Friday, Saturday, Sunday)
    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    const orderCount = isWeekend ? 70 + Math.floor(Math.random() * 50) : 35 + Math.floor(Math.random() * 25);

    for (let o = 0; o < orderCount; o++) {
      // Simulate peak Indian dining hours: Lunch (1-3 PM) and late Dinner (8-11 PM)
      const rand = Math.random();
      let hour: number;
      if (rand > 0.6) {
        hour = Math.floor(Math.random() * 4) + 19; // Dinner: 7, 8, 9, 10 PM
      } else if (rand > 0.3) {
        hour = Math.floor(Math.random() * 3) + 12; // Lunch: 12, 1, 2 PM
      } else {
        hour = Math.floor(Math.random() * 24);
      }
      
      const orderDate = new Date(day);
      orderDate.setHours(hour, Math.floor(Math.random() * 60));
      
      const prepTimeMinutes = 20 + Math.floor(Math.random() * 30); // Indian cooking often takes longer
      const servedDate = new Date(orderDate.getTime() + prepTimeMinutes * 60 * 1000);
      
      const guestCount = Math.floor(Math.random() * 8) + 1; // Indian families are often larger
      const customerIdx = Math.floor(Math.random() * customers.length);
      const customer = customers[customerIdx];

      // Smart item selection logic: mostly Mains, some Appetizers and Drinks
      const itemChoices = [...MENU_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 5));
      const items = itemChoices.map(mi => ({
        menuItemId: mi.id,
        quantity: 1 + Math.floor(Math.random() * 2),
        priceAtOrder: mi.sellingPrice
      }));

      const totalAmount = items.reduce((acc, it) => acc + (it.priceAtOrder * it.quantity), 0);

      orders.push({
        id: `order-${d}-${o}`,
        timestamp: orderDate.toISOString(),
        customerId: customer.id,
        items,
        totalAmount,
        orderPlacedAt: orderDate.toISOString(),
        orderServedAt: servedDate.toISOString(),
        guestCount,
        rating: 4.2 + (Math.random() * 0.8) // High satisfaction simulation
      });
    }
  }

  return {
    orders,
    menuItems: MENU_ITEMS,
    customers
  };
};
