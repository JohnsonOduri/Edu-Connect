import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/lib/types";
import { toast } from "sonner";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from "firebase/auth";
import { auth, database } from "@/firebase";
import { ref, set, get, onValue } from "firebase/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setupUserInDatabase = async (firebaseUser: FirebaseUser, userData: { name: string, role: UserRole }) => {
    try {
      // Use the role directly from userData without defaulting to "student"
      const userRole = userData.role;

      console.log("Setting up user in database with role:", userRole);

      console.log("Saving user data to database:", {
        name: userData.name,
        email: firebaseUser.email,
        role: userData.role
      });

      // Save additional user data to Firebase Realtime Database
      await set(ref(database, `users/${firebaseUser.uid}`), {
        name: userData.name,
        email: firebaseUser.email,
        role: userRole, // Use the role passed from signup
        createdAt: new Date().toISOString()
      });

      console.log("User data saved to database with role:", userRole);
      return true;
    } catch (error) {
      console.error("Error saving user data to database:", error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener with Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? "SIGNED_IN" : "null", firebaseUser);
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile data from Firebase Realtime Database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User data from database:", userData);

            // Use the role from the database
            const userRole = userData.role;
            console.log("Fetched user role:", userRole);

            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: userRole as UserRole,
              avatar: userData.avatar || firebaseUser.photoURL || ''
            });
          } else {
            // If user exists in Firebase Auth but not in database,
            // create a basic record
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'student' as UserRole, // Default role
              avatar: firebaseUser.photoURL || ''
            });
            
            // Set up the user in the database
            await setupUserInDatabase(firebaseUser, {
              name: firebaseUser.displayName || '',
              role: 'student'
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Error loading user profile");
        }
      } else {
        // User is not logged in
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      toast.success("Login successful");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to login";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account exists with this email";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid login credentials";
      }
      
      toast.error(errorMessage);
      setLoading(false);
      return Promise.reject(error);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setLoading(true);

      // Use the role directly without defaulting
      const userRole = role;

      console.log("Signup process with role:", userRole);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update user profile with name
      await updateProfile(firebaseUser, {
        displayName: name
      });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      console.log("Creating user with role:", userRole);

      // Save additional user data to Firebase Realtime Database
      const success = await setupUserInDatabase(firebaseUser, { name, role: userRole });

      if (success) {
        toast.success("Account created successfully! Please verify your email.");
      } else {
        toast.warning("Account created but profile data could not be saved");
      }

      return Promise.resolve();
    } catch (error: any) {
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email is already in use";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      }

      toast.error(errorMessage);
      setLoading(false);
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      
      setUser(null);
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
