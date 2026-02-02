
import { Order, MenuItem, Customer, DashboardData } from '../types';

const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Old Delhi Butter Chicken', category: 'Main', sellingPrice: 850, costPrice: 220 },
  { id: '2', name: 'Awadhi Mutton Biryani', category: 'Main', sellingPrice: 1250, costPrice: 380 },
  { id: '3', name: 'Paneer Tikka Multani', category: 'Appetizer', sellingPrice: 550, costPrice: 150 },
  { id: '4', name: 'Tandoori Jhinga (Prawns)', category: 'Main', sellingPrice: 1550, costPrice: 520 },
  { id: '5', name: 'Kesari Rasmalai', category: 'Dessert', sellingPrice: 420, costPrice: 90 },
  { id: '6', name: 'Mango Lassi Supreme', category: 'Beverage', sellingPrice: 280, costPrice: 60 },
  { id: '7', name: 'Galouti Kebab', category: 'Appetizer', sellingPrice: 650, costPrice: 180 },
  { id: '8', name: 'Dal Makhani Bukhara', category: 'Main', sellingPrice: 620, costPrice: 140 },
  { id: '9', name: 'Gulab Jamun with Rabri', category: 'Dessert', sellingPrice: 380, costPrice: 80 },
  { id: '10', name: 'Masala Kokum Cooler', category: 'Beverage', sellingPrice: 240, costPrice: 40 },
  { id: '11', name: 'Hyderabadi Veg Biryani', category: 'Main', sellingPrice: 750, costPrice: 190 },
  { id: '12', name: 'Samosa Chaat Platter', category: 'Appetizer', sellingPrice: 350, costPrice: 85 },
  { id: '13', name: 'Kashmiri Rogan Josh', category: 'Main', sellingPrice: 1100, costPrice: 340 },
  { id: '14', name: 'Gajar Ka Halwa', category: 'Dessert', sellingPrice: 320, costPrice: 70 },
  { id: '15', name: 'Assamese Masala Tea', category: 'Beverage', sellingPrice: 150, costPrice: 30 },
  { id: '16', name: 'Malai Kofta Mughlai', category: 'Main', sellingPrice: 720, costPrice: 160 },
  { id: '17', name: 'Amritsari Fish Fry', category: 'Appetizer', sellingPrice: 880, costPrice: 260 },
  { id: '18', name: 'Shahi Tukda with Thandai', category: 'Dessert', sellingPrice: 450, costPrice: 110 },
  { id: '19', name: 'Palak Paneer', category: 'Main', sellingPrice: 680, costPrice: 150 },
  { id: '20', name: 'Pink Guava Chilli Sip', category: 'Beverage', sellingPrice: 260, costPrice: 55 },
];

export const generateMockData = (): DashboardData => {
  const orders: Order[] = [];
  const customers: Customer[] = [];
  const now = new Date();
  
  // Generate ~250 customers
  const indianNames = [
    'Arjun Mehta', 'Priya Sharma', 'Rahul Kapoor', 'Sneha Reddy', 
    'Vikram Singh', 'Ananya Iyer', 'Siddharth Gupta', 'Ishani Verma',
    'Rohan Das', 'Kavita Nair', 'Amitabh Bose', 'Zoya Khan',
    'Suresh Prabhu', 'Meera Deshmukh', 'Aditya Kulkarni', 'Neha Grewal'
  ];

  for (let i = 0; i < 250; i++) {
    customers.push({
      id: `cust-${i}`,
      name: indianNames[i % indianNames.length] + ` ${i + 1}`,
      firstVisit: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Generate 30 days of orders
  for (let d = 0; d < 30; d++) {
    const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    // Heavy volume on Friday, Saturday, Sunday (Indian weekend patterns)
    const dayOfWeek = day.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5;
    const orderCount = isWeekend ? 75 + Math.floor(Math.random() * 50) : 40 + Math.floor(Math.random() * 30);

    for (let o = 0; o < orderCount; o++) {
      // Simulate peak hours: Lunch (1-3pm) and Dinner (8-11pm) - typical Indian dining hours
      let hour;
      const rand = Math.random();
      if (rand > 0.6) {
        hour = Math.floor(Math.random() * 4) + 19; // Dinner: 7, 8, 9, 10 PM
      } else if (rand > 0.3) {
        hour = Math.floor(Math.random() * 3) + 12; // Lunch: 12, 1, 2 PM
      } else {
        hour = Math.floor(Math.random() * 24);
      }
      
      const orderDate = new Date(day);
      orderDate.setHours(hour, Math.floor(Math.random() * 60));
      
      const prepTimeMinutes = 20 + Math.floor(Math.random() * 30);
      const servedDate = new Date(orderDate.getTime() + prepTimeMinutes * 60 * 1000);
      
      // Indian families often dine in larger groups
      const guestCount = Math.random() > 0.7 ? (Math.floor(Math.random() * 6) + 4) : (Math.floor(Math.random() * 3) + 1);
      const customerIdx = Math.floor(Math.random() * customers.length);
      const customer = customers[customerIdx];

      const itemChoices = [...MENU_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 5));
      const items = itemChoices.map(mi => ({
        menuItemId: mi.id,
        quantity: 1 + (Math.random() > 0.8 ? 1 : 0), // Mostly 1, sometimes 2
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
        rating: 3.5 + (Math.random() * 1.5) // Realistic satisfaction range
      });
    }
  }

  return {
    orders,
    menuItems: MENU_ITEMS,
    customers
  };
};
