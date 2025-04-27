import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Authentication helpers
const registerWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const loginWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

const loginWithGithub = () => {
  return signInWithPopup(auth, githubProvider);
};

const logoutUser = () => {
  return signOut(auth);
};

const updateUserProfile = (user: FirebaseUser, displayName: string, photoURL?: string) => {
  return updateProfile(user, { displayName, photoURL: photoURL || null });
};

// Check if a username is available
const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Check if username contains only alphanumeric characters and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return false;
    }
    
    // Query to find any documents with this username
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    
    const querySnapshot = await getDocs(usernameQuery);
    return querySnapshot.empty; // Return true if no documents found with this username
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};

// Create user document in Firestore with username
const createUserDocument = async (user: FirebaseUser, username?: string) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    
    // Check if user document already exists
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('User document already exists');
      return userDoc.data();
    }
    
    let finalUsername = username;
    
    // If no username provided, create one from email or display name
    if (!finalUsername) {
      if (user.displayName) {
        // Create a username from display name (lowercase and remove spaces)
        const baseUsername = user.displayName.toLowerCase().replace(/\s+/g, '');
        finalUsername = baseUsername;
        
        // Check if this username is available
        let isAvailable = await checkUsernameAvailability(finalUsername);
        let counter = 1;
        
        // If not available, try appending numbers until we find an available one
        while (!isAvailable && counter < 100) {
          finalUsername = `${baseUsername}${counter}`;
          isAvailable = await checkUsernameAvailability(finalUsername);
          counter++;
        }
      } else if (user.email) {
        // Create username from email (portion before @)
        const baseUsername = user.email.split('@')[0].toLowerCase();
        finalUsername = baseUsername;
        
        // Check if this username is available
        let isAvailable = await checkUsernameAvailability(finalUsername);
        let counter = 1;
        
        // If not available, try appending numbers
        while (!isAvailable && counter < 100) {
          finalUsername = `${baseUsername}${counter}`;
          isAvailable = await checkUsernameAvailability(finalUsername);
          counter++;
        }
      } else {
        // If no email or display name, create a random username
        finalUsername = `user_${Math.floor(Math.random() * 100000)}`;
      }
    }
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      username: finalUsername?.toLowerCase(),
      createdAt: new Date().toISOString(),
      bio: "",
      socialLinks: {},
    };
    
    await setDoc(userRef, userData);
    console.log('User document created successfully in Firestore');
    return userData;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Update username in Firestore
const updateUsername = async (userId: string, username: string): Promise<boolean> => {
  try {
    // First check if username is available
    const isAvailable = await checkUsernameAvailability(username);
    
    if (!isAvailable) {
      return false;
    }
    
    // Update the user document with new username
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      username: username.toLowerCase()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating username:', error);
    return false;
  }
};

// Get user by username
const getUserByUsername = async (username: string): Promise<any> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};

// Update user document in Firestore
const updateUserDocument = async (userId: string, data: Partial<{displayName: string | null, photoURL: string | null, bio: string, username: string}>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
    console.log('User document updated successfully');
  } catch (error) {
    console.error('Error updating user document:', error);
    throw error;
  }
};

export {
  auth,
  db,
  storage,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginWithGithub,
  logoutUser,
  updateUserProfile,
  createUserDocument,
  updateUserDocument,
  checkUsernameAvailability,
  updateUsername,
  getUserByUsername,
  onAuthStateChanged
};