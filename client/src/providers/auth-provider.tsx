/** @format */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useLocation } from "wouter";
import { auth, db } from "@/lib/firebase";
import { AgentWithDetails } from "@/types";

// Types pour les rôles et données agent
type UserRole = "user" | "admin" | "superAdmin";

interface AgentData {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  phone?: string | null;
  title?: string | null;
  bio?: string | null;
  status?: string;
  isOnLeave?: boolean;
  totalBookings?: number;
  createdAt?: any;
  lastLogin?: any;
  updatedAt?: any;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
  title?: string;
  role?: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  agentData: AgentData | any;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  // Fonction pour récupérer les données agent depuis Firestore
  const fetchAgentData = async (uid: string): Promise<AgentData | null> => {
    try {
      const agentDocRef = doc(db, "agents", uid);
      const agentDoc = await getDoc(agentDocRef);

      if (agentDoc.exists()) {
        const data = agentDoc.data() as AgentData;
        return {
          // id: uid,
          ...data,
        };
      } else {
        console.error("Aucun document agent trouvé pour cet UID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données agent:", error);
      return null;
    }
  };

  // Fonction pour créer un document agent dans Firestore
  const createAgentDocument = async (
    uid: string,
    userData: any,
  ): Promise<void> => {
    try {
      const agentDocRef = doc(db, "agents", uid);

      const agentData: any = {
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        displayName: userData.displayName || null,
        email: userData.email,
        phone: userData.phone || null,
        title: userData.title || null,
        role: userData.role || "user",
        bio: userData.bio || null,
        workingDays: userData.workingDays || [],
        workingHours: userData.workingHours || [],
        highlights: userData.highlights || [],
        status: userData.status || "active",
        isOnLeave: userData.isOnLeave || false,
        totalBookings: userData.totalBookings || 0,
        assignedLocations: userData.assignedLocations || [],
        assignedServices: userData.assignedServices || [],
        assignedServiceIds: userData.assignedServiceIds || [],
        assignedLocationId: userData.assignedLocationId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        password: userData.password || null,
      };

      await setDoc(agentDocRef, agentData);
    } catch (error) {
      console.error("Erreur lors de la création du document agent:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // User authentifié - récupérer les données depuis la collection "agents"
        const agentInfo = await fetchAgentData(user.uid);

        if (agentInfo) {
          setAgentData(agentInfo);
          setUserRole(agentInfo.role);

          // Redirection selon le rôle
          if (location === "/login" || location === "/register") {
            switch (agentInfo.role) {
              case "superAdmin":
                navigate("/");
                break;
              case "admin":
                navigate("/dashboard");
                break;
              case "user":
              default:
                navigate("/login");
                break;
            }
          }
        } else {
          // User authentifié mais pas dans la collection agents
          console.error(
            "Utilisateur non autorisé - pas dans la collection agents",
          );
          await signOut(auth);
          navigate("/login");
        }
      } else {
        // User non authentifié
        setAgentData(null);
        setUserRole(null);

        if (location !== "/login" && location !== "/register") {
          navigate("/login");
        }
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [location, navigate]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Vérifier si l'utilisateur existe dans la collection "agents"
      const agentInfo = await fetchAgentData(user.uid);

      if (!agentInfo) {
        // Si pas dans la collection agents, déconnecter
        await signOut(auth);
        throw new Error(
          "Utilisateur non autorisé. Contactez l'administrateur.",
        );
      }

      // Mettre à jour la dernière connexion
      const agentDocRef = doc(db, "agents", user.uid);
      await setDoc(
        agentDocRef,
        {
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      // Mise à jour des states
      setAgentData(agentInfo);
      setUserRole(agentInfo.role);

      // Redirection selon le rôle
      switch (agentInfo.role) {
        case "superAdmin":
          navigate("/admin/dashboard");
          break;
        case "admin":
          navigate("/admin");
          break;
        case "user":
        default:
          navigate("/");
          break;
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setLoading(false);
      throw new Error(error.message || "Erreur de connexion");
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);

      // Validation des données
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      if (data.password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;

      // Mettre à jour le profil Firebase avec le nom
      await updateProfile(user, {
        displayName: data.displayName || `${data.firstName} ${data.lastName}`,
      });

      // Créer le document agent dans Firestore
      await createAgentDocument(user.uid, data);

      // Récupérer les données de l'agent nouvellement créé
      const agentInfo = await fetchAgentData(user.uid);

      if (agentInfo) {
        setAgentData(agentInfo);
        setUserRole(agentInfo.role);

        // Redirection selon le rôle
        switch (agentInfo.role) {
          case "superAdmin":
            navigate("/");
            break;
          case "admin":
            navigate("/");
            break;
          case "user":
          default:
            navigate("/");
            break;
        }
      }
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setLoading(false);

      // Gestion des erreurs Firebase spécifiques
      let errorMessage = "Erreur lors de l'inscription";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Cette adresse email est déjà utilisée";
          break;
        case "auth/invalid-email":
          errorMessage = "Adresse email invalide";
          break;
        case "auth/weak-password":
          errorMessage = "Le mot de passe est trop faible";
          break;
        case "auth/operation-not-allowed":
          errorMessage =
            "L'inscription par email/mot de passe n'est pas activée";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Vérifier si l'utilisateur existe dans la collection "agents"
      const agentInfo = await fetchAgentData(user.uid);

      if (!agentInfo) {
        // Si pas dans la collection agents, créer automatiquement un document
        // ou déconnecter selon votre politique

        // Option 1: Créer automatiquement (recommandé pour Google)
        const displayName = user.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const googleUserData: RegisterData = {
          email: user.email || "",
          password: "", // Pas de mot de passe pour Google
          firstName,
          lastName,
          displayName: user.displayName || "",
          role: "user", // Rôle par défaut pour les comptes Google
        };

        await createAgentDocument(user.uid, googleUserData);

        const newAgentInfo = await fetchAgentData(user.uid);
        if (newAgentInfo) {
          setAgentData(newAgentInfo);
          setUserRole(newAgentInfo.role);
          navigate("/");
        }

        // Option 2: Déconnecter (plus strict)
        // await signOut(auth);
        // throw new Error("Utilisateur non autorisé. Contactez l'administrateur.");
      } else {
        // Mettre à jour la dernière connexion
        const agentDocRef = doc(db, "agents", user.uid);
        await setDoc(
          agentDocRef,
          {
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        // Mise à jour des states
        setAgentData(agentInfo);
        setUserRole(agentInfo.role);

        // Redirection selon le rôle
        switch (agentInfo.role) {
          case "superAdmin":
            navigate("/admin/dashboard");
            break;
          case "admin":
            navigate("/admin");
            break;
          case "user":
          default:
            navigate("/");
            break;
        }
      }
    } catch (error: any) {
      console.error("Erreur de connexion Google:", error);
      setLoading(false);
      throw new Error(error.message || "Erreur de connexion Google");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAgentData(null);
      setUserRole(null);
      navigate("/login");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    agentData,
    userRole,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
