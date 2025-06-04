/** @format */
"use server";

import {
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
// import { User } from "@/types/";

// CREATE: Add a new user
export async function addUser(
  data: Omit<User, "id" | "createdAt" | "updatedAt">,
) {
  const { email, firstName, lastName, phone, role, isActive, lastLogin } = data;

  const newUser = {
    email,
    firstName,
    lastName,
    phone,
    role,
    isActive,
    lastLogin,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const userRef = collection(db, "users");
    const docRef = await addDoc(userRef, newUser);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get all users with pagination and filters
export async function getUsers(
  params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    lastDoc?: DocumentSnapshot;
  } = {},
) {
  const {
    page = 1,
    limit: limitCount = 10,
    search = "",
    role = "",
    isActive,
    lastDoc,
  } = params;

  try {
    const userRef = collection(db, "users");
    let q = query(userRef);

    // Apply filters
    if (role) {
      q = query(q, where("role", "==", role));
    }

    if (isActive !== undefined) {
      q = query(q, where("isActive", "==", isActive));
    }

    // Add ordering and pagination
    q = query(q, orderBy("createdAt", "desc"));

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    q = query(q, limit(limitCount));

    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    let lastDocument = null;

    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      } as User;

      // Apply search filter (client-side for simplicity)
      if (search) {
        const fullName =
          `${userData.firstName} ${userData.lastName}`.toLowerCase();
        const email = userData.email?.toLowerCase() || "";

        if (
          fullName.includes(search.toLowerCase()) ||
          email.includes(search.toLowerCase())
        ) {
          users.push(userData);
        }
      } else {
        users.push(userData);
      }

      lastDocument = doc;
    });

    // Get total count for pagination (this is a simplified approach)
    const totalQuery = query(collection(db, "users"));
    const totalSnapshot = await getDocs(totalQuery);
    const total = totalSnapshot.size;

    return {
      success: true,
      users,
      total,
      totalPages: Math.ceil(total / limitCount),
      currentPage: page,
      hasNextPage: querySnapshot.docs.length === limitCount,
      lastDoc: lastDocument,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get user by ID
export async function getUserById(id: string) {
  try {
    const userRef = doc(db, "users", id);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      return {
        success: true,
        user: userData as User,
      };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get user by email
export async function getUserByEmail(email: string) {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      return {
        success: true,
        user: userData as User,
      };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error getting user by email:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get users by role
export async function getUsersByRole(role: string) {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("role", "==", role));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      users.push(userData as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting users by role:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get active users
export async function getActiveUsers() {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("isActive", "==", true));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      users.push(userData as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting active users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get inactive users
export async function getInactiveUsers() {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("isActive", "==", false));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      users.push(userData as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting inactive users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get recently logged in users
export async function getRecentlyLoggedInUsers(limitCount: number = 10) {
  try {
    const userRef = collection(db, "users");
    const q = query(
      userRef,
      where("lastLogin", "!=", null),
      orderBy("lastLogin", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      users.push(userData as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting recently logged in users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// READ: Get newly registered users
export async function getNewlyRegisteredUsers(limitCount: number = 10) {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, orderBy("createdAt", "desc"), limit(limitCount));
    const querySnapshot = await getDocs(q);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const userData = {
        id: doc.id,
        ...doc.data(),
      };

      users.push(userData as User);
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error getting newly registered users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update a user
export async function updateUser(id: string, data: Partial<User>) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update user status (active/inactive)
export async function updateUserStatus(id: string, isActive: boolean) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      isActive: isActive,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update user role
export async function updateUserRole(
  id: string,
  role: "user" | "admin" | "manager",
) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      role: role,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update last login
export async function updateLastLogin(id: string) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      lastLogin: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating last login:", error);
    return { success: false, error: (error as Error).message };
  }
}

// UPDATE: Update user profile
export async function updateUserProfile(
  id: string,
  profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  },
) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Delete a user
export async function deleteUser(id: string) {
  try {
    const userRef = doc(db, "users", id);
    await deleteDoc(userRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// DELETE: Soft delete (deactivate) a user
export async function deactivateUser(id: string) {
  try {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      isActive: false,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

// SEARCH: Search users by name, email, or phone
export async function searchUsers(searchTerm: string) {
  try {
    const userRef = collection(db, "users");
    const querySnapshot = await getDocs(userRef);

    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      const rawUserData = doc.data();
      const fullName =
        `${rawUserData.firstName} ${rawUserData.lastName}`.toLowerCase();
      const email = rawUserData.email?.toLowerCase() || "";
      const phone = rawUserData.phone?.toLowerCase() || "";

      if (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm.toLowerCase())
      ) {
        const userData = {
          id: doc.id,
          ...rawUserData,
        };

        users.push(userData as User);
      }
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error searching users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// ANALYTICS: Get user statistics
export async function getUserStatistics() {
  try {
    const userRef = collection(db, "users");
    const querySnapshot = await getDocs(userRef);

    let totalUsers = 0;
    let activeUsers = 0;
    let inactiveUsers = 0;
    let adminUsers = 0;
    let managerUsers = 0;
    let regularUsers = 0;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;

      if (userData.isActive) {
        activeUsers++;
      } else {
        inactiveUsers++;
      }

      switch (userData.role) {
        case "admin":
          adminUsers++;
          break;
        case "manager":
          managerUsers++;
          break;
        default:
          regularUsers++;
          break;
      }
    });

    return {
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        managerUsers,
        regularUsers,
        activePercentage:
          totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
    };
  } catch (error) {
    console.error("Error getting user statistics:", error);
    return { success: false, error: (error as Error).message };
  }
}

// BATCH: Bulk update user status
export async function bulkUpdateUserStatus(
  userIds: string[],
  isActive: boolean,
) {
  try {
    const promises = userIds.map(async (userId) => {
      const userRef = doc(db, "users", userId);
      return updateDoc(userRef, {
        isActive: isActive,
        updatedAt: new Date(),
      });
    });

    await Promise.all(promises);

    return { success: true };
  } catch (error) {
    console.error("Error bulk updating user status:", error);
    return { success: false, error: (error as Error).message };
  }
}

// BATCH: Bulk delete users
export async function bulkDeleteUsers(userIds: string[]) {
  try {
    const promises = userIds.map(async (userId) => {
      const userRef = doc(db, "users", userId);
      return deleteDoc(userRef);
    });

    await Promise.all(promises);

    return { success: true };
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    return { success: false, error: (error as Error).message };
  }
}

// VALIDATION: Check if email exists
export async function checkEmailExists(email: string, excludeUserId?: string) {
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: true, exists: false };
    }

    // If excludeUserId is provided, check if the found user is different
    if (excludeUserId) {
      const foundUserId = querySnapshot.docs[0].id;
      return {
        success: true,
        exists: foundUserId !== excludeUserId,
      };
    }

    return { success: true, exists: true };
  } catch (error) {
    console.error("Error checking email existence:", error);
    return { success: false, error: (error as Error).message };
  }
}
