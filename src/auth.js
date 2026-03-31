import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC1y-1p-2Sby1ELfRLSBTgR3aKXbk7ugI8",
  authDomain: "nikhar-86cff.firebaseapp.com",
  projectId: "nikhar-86cff",
  storageBucket: "nikhar-86cff.firebasestorage.app",
  messagingSenderId: "224219641540",
  appId: "1:224219641540:web:dff299c9798542f7aafb91",
  measurementId: "G-4GYSSKXSG6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Redirect logic: Only sadik@gmail.com goes to Admin
    if (user.email && user.email.toLowerCase() === 'sadik@gmail.com') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    console.error("Error signing in with Google: ", error);
    alert(error.message);
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // You could also save the user's Full Name to Firestore here
    alert("Account created successfully!");
    window.location.href = '/login.html';
  } catch (error) {
    console.error("Error creating account: ", error);
    alert(error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (user.email && user.email.toLowerCase() === 'sadik@gmail.com') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    console.error("Error logging in: ", error);
    alert("Invalid credentials or account does not exist.");
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.href = '/login.html';
  } catch (error) {
    console.error("Error logging out: ", error);
  }
};

// Export auth base for state listeners
export { auth, onAuthStateChanged };

// Make globally available for inline HTML onclick handlers
window.loginWithGoogle = loginWithGoogle;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
