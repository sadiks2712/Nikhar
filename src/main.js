import './style.css'
import { auth, onAuthStateChanged, logoutUser } from './auth.js';

// Firebase Setup (Mock integration as per requirements, replace keys later)
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1y-1p-2Sby1ELfRLSBTgR3aKXbk7ugI8",
  authDomain: "nikhar-86cff.firebaseapp.com",
  projectId: "nikhar-86cff",
  storageBucket: "nikhar-86cff.firebasestorage.app",
  messagingSenderId: "224219641540",
  appId: "1:224219641540:web:dff299c9798542f7aafb91",
  measurementId: "G-4GYSSKXSG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data
const products = [
  {
    id: 'p1',
    name: 'Neem & Basil Purifying',
    category: 'Acne Control',
    price: 150,
    image: '/neem_soap.png',
    desc: 'Deep cleansing neem and basil extracts to fight acne and purify skin naturally.'
  },
  {
    id: 'p2',
    name: 'Aloe Vera & Cucumber Refresh',
    category: 'Hydration',
    price: 180,
    image: '/aloe_soap.png',
    desc: 'Cooling cucumber and soothing aloe vera for perfectly hydrated and calm skin.'
  },
  {
    id: 'p3',
    name: 'Turmeric & Sandalwood Glow',
    category: 'Radiance',
    price: 220,
    image: '/turmeric_soap.png',
    desc: 'Traditional ubtan recipe for a natural, healthy golden glow.'
  },
  {
    id: 'p4',
    name: 'Coconut & Cocoa Butter',
    category: 'Deep Moisture',
    price: 200,
    image: '/coconut_soap.png',
    desc: 'Ultra-moisturizing body soap for dry skin with raw cocoa butter.'
  },
  {
    id: 'p5',
    name: 'Rose & Almond Oil',
    category: 'Anti-Aging',
    price: 250,
    image: '/rose_soap.png',
    desc: 'Luxurious rose essential oil and sweet almond for supple, youthful skin.'
  },
  {
    id: 'p6',
    name: 'Charcoal & Tea Tree',
    category: 'Detoxifying',
    price: 190,
    image: '/charcoal_soap.png',
    desc: 'Activated bamboo charcoal pulls out toxins while tea tree keeps skin clear.'
  }
];

// State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// History State
let myHistory = [
  { id: 'ORD-982131', image: '/rose_soap.png', title: 'Rose & Almond Oil', placed: 'Just now', price: 350, qty: 1, status: 'Pending Validation' },
  { id: 'ORD-123456', image: '/neem_soap.png', title: 'Neem & Basil Purifying', placed: '3 weeks ago', price: 150, qty: 1, status: 'Delivered Successfully' }
];

// Mobile Menu
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileLinks = document.getElementById('mobile-links');
let menuOpen = false;

mobileBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  mobileLinks.classList.toggle('active', menuOpen);
});

window.closeMobileMenu = () => {
  menuOpen = false;
  mobileLinks.classList.remove('active');
};

// Navigation (SPA logic)
window.navigate = (pageId) => {
  window.scrollTo(0, 0);
  
  // Update active links
  document.querySelectorAll('.nav-link').forEach(link => {
    if(link.getAttribute('data-target') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Hide all pages, show target
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById(`page-${pageId}`);
  if(targetPage) {
    targetPage.classList.add('active');
  }

  // Refresh views if navigating
  if(pageId === 'cart') {
    renderCart();
  }
  if(pageId === 'checkout') {
    renderCheckout();
  }
  if(pageId === 'history') {
    renderHistory();
  }
};

window.scrollToAbout = () => {
  window.navigate('home');
  setTimeout(() => {
    document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
  }, 100);
}


// Rendering Products
const renderProducts = () => {
  // Featured (only 3)
  const featuredContainer = document.getElementById('featured-products-container');
  if(featuredContainer) {
    featuredContainer.innerHTML = products.slice(0, 3).map(p => productCardTemplate(p)).join('');
  }

  // All Products
  const allContainer = document.getElementById('all-products-container');
  if(allContainer) {
    allContainer.innerHTML = products.map(p => productCardTemplate(p)).join('');
  }
};

const productCardTemplate = (product) => `
  <div class="product-card" onmouseenter="startParticleEffect('${product.id}')" onmouseleave="stopParticleEffect()">
    <div class="product-image">
      <span class="product-badge">${product.category}</span>
      <img src="${product.image}" loading="lazy" alt="${product.name}">
    </div>
    <div class="product-info">
      <h3 class="product-title">${product.name}</h3>
      <p class="product-price">₹${product.price}</p>
      <p class="product-desc">${product.desc}</p>
      <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
        <i class="fa-solid fa-cart-plus"></i> Add to Cart
      </button>
    </div>
  </div>
`;

// Cart Logic
window.addToCart = (productId) => {
  const product = products.find(p => p.id === productId);
  if(!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if(existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({...product, qty: 1});
  }

  saveCart();
  updateCartBadges();
  
  // Simple toast or feedback (optional, jumping button animation)
  const badge = document.getElementById('cart-badge');
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => badge.style.transform = 'scale(1)', 200);
};

window.updateQty = (productId, change) => {
  const item = cart.find(i => i.id === productId);
  if(!item) return;

  item.qty += change;
  if(item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  
  saveCart();
  renderCart();
  updateCartBadges();
};

window.removeFromCart = (productId) => {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  renderCart();
  updateCartBadges();
};

const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const updateCartBadges = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-badge').textContent = totalItems;
  document.getElementById('mobile-cart-badge').textContent = totalItems;
};

const renderCart = () => {
  const container = document.getElementById('cart-items-container');
  const emptyMsg = document.getElementById('empty-cart-message');
  const summary = document.getElementById('cart-summary');
  
  if(cart.length === 0) {
    container.innerHTML = '';
    emptyMsg.style.display = 'block';
    summary.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  summary.style.display = 'block';

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">₹${item.price} x ${item.qty} = ₹${item.price * item.qty}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
  document.getElementById('cart-total').textContent = `₹${subtotal + 50}`; // 50 is shipping
};

window.renderHistory = () => {
  const container = document.getElementById('history-items-container');
  if (!container) return;
  
  if (myHistory.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2.5rem; color: var(--text-light);"><i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><br>No order history found.</div>';
    return;
  }
  
  container.innerHTML = myHistory.map(item => {
    let statusStyle = 'background: #fef3c7; color: #d97706; border: 1px solid #fde68a;'; // Pending
    if (item.status === 'Delivered Successfully') statusStyle = 'background: #dcfce3; color: #15803d; border: 1px solid #bbf7d0;'; // Success
    if (item.status === 'Cancelled') statusStyle = 'background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;'; // Cancelled
    
    let btnHtml = '';
    if (item.status !== 'Cancelled' && item.status !== 'Delivered Successfully') {
      btnHtml = `<button onclick="cancelOrder('${item.id}')" class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; color: #ef4444; border-color: #fca5a5; margin-top: 5px; transition: 0.2s;">Cancel Order</button>`;
    } else if (item.status === 'Cancelled') {
      btnHtml = `<button onclick="deleteHistory('${item.id}')" class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; color: var(--text-light); margin-top: 5px; transition: 0.2s;"><i class="fa-solid fa-trash"></i> Delete History</button>`;
    }

    return `
      <div class="cart-item" style="opacity: ${item.status === 'Cancelled' ? '0.6' : '1'}; position: relative; display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); margin-bottom: 1rem; transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" style="filter: ${item.status === 'Cancelled' ? 'grayscale(1)' : 'grayscale(0)'}; width: 80px; height: 80px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div class="cart-item-info" style="flex-grow: 1;">
          <div class="cart-item-title" style="font-weight: 600; font-size: 1.1rem; color: var(--text-main); margin-bottom: 0.3rem;">Order #${item.id}</div>
          <div class="cart-item-price" style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.5rem;"><i class="fa-regular fa-clock" style="margin-right:4px;"></i> Placed: ${item.placed}</div>
          <div class="cart-item-price text-main" style="margin-top: 5px; font-weight: 700; font-size: 1.2rem;">₹${item.price} <span style="font-weight: normal; font-size: 0.95rem; color: var(--text-light); margin-left: 5px;">(${item.title} x${item.qty})</span></div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 0.8rem;">
            <div style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 50px; ${statusStyle} font-size: 0.8rem; font-weight: 600;">${item.status}</div>
            ${btnHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.cancelOrder = (id) => {
  if (confirm("Are you sure you want to cancel this order? Make sure to review our cancellation policy.")) {
    const orderIndex = myHistory.findIndex(o => o.id === id);
    if (orderIndex > -1) {
      myHistory[orderIndex].status = 'Cancelled';
      window.renderHistory();
    }
  }
};

window.deleteHistory = (id) => {
  if (confirm("Permanently delete this order from your history?")) {
    myHistory = myHistory.filter(o => o.id !== id);
    window.renderHistory();
  }
};

const renderCheckout = () => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + 50;
  document.getElementById('checkout-total').textContent = total;
  if(cart.length === 0) {
    window.navigate('cart'); // Go back to cart if empty
  }
};


// Checkout submission
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if(cart.length === 0) return;

  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + 50;
  
  const placeBtn = document.getElementById('place-order-btn');
  const originalText = placeBtn.innerHTML;
  placeBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
  placeBtn.disabled = true;

  try {
    try {
      await addDoc(collection(db, "orders"), {
        name,
        phone,
        address,
        cart,
        total,
        status: "Pending",
        createdAt: new Date()
      });
    } catch(firebaseErr) {
      console.warn("Firebase mock skipped - update API keys. Processing order locally.", firebaseErr);
    }
    
    await new Promise(r => setTimeout(r, 1500));
    
    cart = [];
    saveCart();
    updateCartBadges();

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('success-order-id').innerText = '#' + orderId;
    window.navigate('success');
    e.target.reset();

  } catch(err) {
    alert("Something went wrong. Please try again.");
    console.error(err);
  } finally {
    placeBtn.innerHTML = originalText;
    placeBtn.disabled = false;
  }
});

// Particle Animation Logic
let particleInterval = null;

window.startParticleEffect = (productId) => {
  stopParticleEffect(); // clear any running effect
  const container = document.getElementById('particle-container');
  if(!container) return;

  const config = {
    'p1': { icon: 'fa-leaf', color: '#16a34a', isSolid: true }, // Neem: Green Leaf
    'p2': { icon: 'fa-seedling', color: '#4ade80', isSolid: true }, // Aloe: Fresh Sprout
    'p3': { icon: 'fa-star', color: '#fbbf24', isSolid: true }, // Turmeric: Yellow Star
    'p4': { icon: 'fa-snowflake', color: '#e2e8f0', isSolid: true }, // Coconut: Flake
    'p5': { icon: 'fa-leaf', color: '#e11d48', isSolid: true }, // Rose: Red Petal
    'p6': { icon: 'fa-circle', color: '#334155', isSolid: false } // Charcoal: Dark ash
  };

  const style = config[productId];
  if(!style) return;

  // For rose, we want lots of delicate red petals
  // For neem, green leaves falling gently
  const rate = productId === 'p5' ? 200 : 350; // faster rate for rose

  particleInterval = setInterval(() => {
    const particle = document.createElement('i');
    particle.className = `${style.isSolid ? 'fa-solid' : 'fa-regular'} ${style.icon} particle`;
    particle.style.color = style.color;
    particle.style.left = Math.random() * 100 + 'vw';
    
    // Randomize rotation scale and direction
    const size = Math.random() * 1.5 + 0.5; // between 0.5 and 2rem
    particle.style.fontSize = size + 'rem';
    
    // Varying speeds based on size
    const duration = Math.random() * 5 + 4; // between 4 and 9s
    particle.style.animationDuration = duration + 's';
    
    // Slightly randomize drop angle using CSS transform
    const angleX = Math.random() * 360;
    particle.style.transform = `rotateX(${angleX}deg)`;

    container.appendChild(particle);

    // cleanup after falling
    setTimeout(() => {
      if (particle.parentNode === container) {
        particle.remove();
      }
    }, duration * 1000);

  }, rate);
};

window.stopParticleEffect = () => {
  if(particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  
  // Optionally clear existing particles to immediately stop the scene, 
  // but letting them fall out gracefully looks better!
};

// Init
window.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartBadges();
  renderHistory();
  renderHistory();

  // Load Nav Auth State
  onAuthStateChanged(auth, (user) => {
    const userContainer = document.getElementById('nav-user-container');
    if (!userContainer) return;
    
    if (user) {
      const displayName = user.displayName || user.email.split('@')[0];
      const avatarHTML = user.photoURL 
        ? `<img src="${user.photoURL}" alt="User" style="width:35px; height:35px; border-radius:50%; object-fit:cover; margin-right:8px;" referrerpolicy="no-referrer">`
        : `<div style="width:35px; height:35px; border-radius:50%; background:var(--primary); color:white; display:flex; justify-content:center; align-items:center; font-weight:bold; margin-right:8px;">${displayName.charAt(0).toUpperCase()}</div>`;
        
      const adminBtnHtml = user.email === 'sadik@gmail.com' 
        ? `<a href="/admin.html" class="dropdown-item"><i class="fa-solid fa-gauge"></i> Admin Dashboard</a>` 
        : '';
        
      userContainer.innerHTML = `
        <div style="position: relative;" id="profile-dropdown-wrapper">
          <div style="display: flex; align-items: center; cursor: pointer; transition: 0.2s;" onmouseenter="this.style.opacity=0.8" onmouseleave="this.style.opacity=1" onclick="toggleProfileDropdown(event)">
            ${avatarHTML}
            <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--text-light); margin-left: 5px;"></i>
          </div>

          <div id="profile-dropdown" class="profile-dropdown">
            <div class="dropdown-header">
               ${user.photoURL 
                 ? `<img src="${user.photoURL}" class="dropdown-avatar" referrerpolicy="no-referrer">` 
                 : `<div class="dropdown-avatar">${displayName.charAt(0).toUpperCase()}</div>`}
               <div class="dropdown-header-info">
                 <strong>${displayName}</strong>
                 <span title="${user.email}">${user.email}</span>
               </div>
            </div>
            <div class="dropdown-body">
              ${adminBtnHtml}
              <a href="#" class="dropdown-item" onclick="navigate('history'); document.getElementById('profile-dropdown').classList.remove('show');"><i class="fa-solid fa-box-open"></i> Order History</a>
              <div class="dropdown-divider" style="margin: 0.5rem 0;"></div>
              <a href="#" class="dropdown-item text-danger" onclick="if(confirm('Are you sure you want to sign out?')) { window.logoutUser(); }">
                <i class="fa-solid fa-right-from-bracket"></i> Sign out
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      userContainer.innerHTML = `<a href="/login.html" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.95rem; border-radius: 8px;">Sign In</a>`;
    }
  });
});

window.toggleProfileDropdown = (event) => {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) dropdown.classList.toggle('show');
};

document.addEventListener('click', (event) => {
  const dropdownWrapper = document.getElementById('profile-dropdown-wrapper');
  const dropdown = document.getElementById('profile-dropdown');
  
  if (dropdown && dropdown.classList.contains('show')) {
    if (dropdownWrapper && !dropdownWrapper.contains(event.target)) {
      dropdown.classList.remove('show');
    }
  }
});
