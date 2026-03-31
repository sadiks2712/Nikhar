import { Parser } from "json2csv";
import fs from "fs";

// Mock Data structure for Firebase Orders
const ordersData = [
  {
    orderId: "ORD-982131",
    name: "Aarika Sharma",
    phone: "9876543210",
    address: "123 Green Street, Mumbai, 400001",
    total: 350,
    status: "Pending",
    createdAt: new Date().toISOString(),
    items: "Neem & Basil (2), Rose & Almond (1)"
  },
  {
    orderId: "ORD-123456",
    name: "Rohan Verma",
    phone: "8765432109",
    address: "45 River View Apartments, Delhi, 110001",
    total: 540,
    status: "Shipped",
    createdAt: new Date().toISOString(),
    items: "Turmeric & Sandalwood (1), Coconut & Cocoa (1)"
  }
];

try {
  const fields = ['orderId', 'name', 'phone', 'address', 'items', 'total', 'status', 'createdAt'];
  const opts = { fields };
  
  const parser = new Parser(opts);
  const csv = parser.parse(ordersData);

  fs.writeFileSync("orders.csv", csv);
  console.log("✅ Successfully exported orders to orders.csv");
  console.log("This script simulates pulling from Firebase and generating a robust CSV file for the client.");
  
} catch (err) {
  console.error("Error exporting to CSV:", err);
}
