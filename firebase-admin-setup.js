// This is your Node.js backend using the Firebase Admin SDK
// Make sure to add 'firebase-admin' to your package.json dependencies 
// Run 'npm install firebase-admin' if you haven't already.

const admin = require("firebase-admin");

// IMPORTANT: Download your serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
// Place it securely in your project or outside the public directory. Do not commit it to version control!
const serviceAccount = require("./serviceAccountKey.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Example: Get a reference to the Firestore Database
const db = admin.firestore();

// Example Function: Fetch all orders and log them securely on the server
async function fetchOrdersFromBackend() {
  try {
    const ordersSnapshot = await db.collection("orders").get();
    
    if (ordersSnapshot.empty) {
      console.log("No orders found in Firebase.");
      return;
    }

    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Successfully fetched ${orders.length} orders from the backend secure channel!`);
    console.log(orders);
    
    // You could plug this directly into your existing json2csv script!
    
  } catch (error) {
    console.error("Error accessing Firebase securely:", error);
  }
}

// NOTE: To test this file, you MUST have the valid serviceAccountKey.json in the same directory.
// Then run: node firebase-admin-setup.js
// fetchOrdersFromBackend();
