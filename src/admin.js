import './style.css'; 
import { auth, onAuthStateChanged } from './auth.js';

// Mock Data structure for Firebase Orders
const ordersData = [
  {
    orderId: "ORD-982131",
    name: "Aarika Sharma",
    phone: "+91 9876543210",
    address: "123 Green Street, Mumbai, 400001",
    total: 350,
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000).toLocaleString(),
    items: "Neem & Basil (2), Rose & Almond (1)"
  },
  {
    orderId: "ORD-123456",
    name: "Rohan Verma",
    phone: "+91 8765432109",
    address: "45 River View Apartments, Delhi, 110001",
    total: 540,
    status: "Shipped",
    createdAt: new Date(Date.now() - 86000000).toLocaleString(),
    items: "Turmeric & Sandalwood (1), Coconut & Cocoa (1)"
  },
  {
    orderId: "ORD-654321",
    name: "Priya Desai",
    phone: "+91 7654321098",
    address: "70 Lakeview Road, Bangalore, 560001",
    total: 250,
    status: "Pending",
    createdAt: new Date().toLocaleString(),
    items: "Charcoal & Tea Tree (1), Aloe Vera & Cucumber (1)"
  }
];

// Calculate Stats
const calculateStats = () => {
  const totalRev = ordersData.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = ordersData.length;
  const pending = ordersData.filter(o => o.status === 'Pending').length;

  document.getElementById('stat-revenue').textContent = `₹${totalRev}`;
  document.getElementById('stat-orders').textContent = totalOrders;
  document.getElementById('stat-pending').textContent = pending;
};

// Render Table
const renderTable = () => {
  const tbody = document.getElementById('orders-tbody');
  if(!tbody) return;

  tbody.innerHTML = ordersData.map(order => `
    <tr>
      <td><strong>${order.orderId}</strong></td>
      <td>${order.name}</td>
      <td>${order.phone}</td>
      <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${order.items}</td>
      <td>₹${order.total}</td>
      <td>
        <span class="status ${order.status.toLowerCase()}">${order.status} Wait</span>
      </td>
    </tr>
  `).join('');
};

// Export CSV Functionality (Client-Side implementation of the Node logic)
const downloadCSV = () => {
  const header = ['Order ID', 'Name', 'Phone', 'Address', 'Items', 'Total (₹)', 'Status', 'Date'];
  
  const csvRows = [];
  csvRows.push(header.join(',')); // Add header
  
  for(const row of ordersData) {
    const values = [
      row.orderId,
      `"${row.name}"`, // Quote strings that might contain commas
      row.phone,
      `"${row.address}"`,
      `"${row.items}"`,
      row.total,
      row.status,
      `"${row.createdAt}"`
    ];
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link element
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `nikhar_orders_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


document.addEventListener('DOMContentLoaded', () => {
  // Fix status label string
  const getStatusClass = (status) => status.toLowerCase();
  
  const tbody = document.getElementById('orders-tbody');
  
  if(tbody) {
    tbody.innerHTML = ordersData.map(order => `
      <tr>
        <td><strong>${order.orderId}</strong></td>
        <td>${order.name}</td>
        <td>${order.phone}</td>
        <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${order.items}</td>
        <td>₹${order.total}</td>
        <td>
          <span class="status ${getStatusClass(order.status)}">${order.status}</span>
        </td>
      </tr>
    `).join('');
    
    calculateStats();
  }

  const exportBtn = document.getElementById('export-csv-btn');
  if(exportBtn) {
    exportBtn.addEventListener('click', downloadCSV);
  }

  // Profile and Auth Protector Logic
  onAuthStateChanged(auth, (user) => {
    const adminName = document.getElementById('admin-name');
    const adminEmail = document.getElementById('admin-email');
    const adminAvatar = document.getElementById('admin-avatar');
    
    if (user && user.email === 'sadik@gmail.com') {
      // User is signed in and is the Admin
      const displayName = user.displayName || user.email.split('@')[0];
      
      if (adminName) adminName.textContent = displayName;
      if (adminEmail) adminEmail.textContent = user.email;
      
      if (user.photoURL && adminAvatar) {
        adminAvatar.innerHTML = `<img src="${user.photoURL}" alt="Profile" referrerpolicy="no-referrer">`;
      }
    } else if (user) {
      // User is signed in but not the admin
      alert("Unauthorized Access: This area is for admins only.");
      window.location.href = '/';
    } else {
      // User is signed out - redirect securely to login
      window.location.href = '/login.html';
    }
  });

});
