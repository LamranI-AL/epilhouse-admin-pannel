/** @format */

// actions/categories.ts - Actions CRUD pour les catégories
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types";

const COLLECTION_NAME = "categories";

export const getAllCategories = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Category);
    });

    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des catégories",
    };
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const category = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Category;

      return { success: true, category };
    } else {
      return { success: false, error: "Catégorie non trouvée" };
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error: "Erreur lors du chargement de la catégorie",
    };
  }
};

export const addCategory = async (
  categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding category:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la catégorie",
    };
  }
};

export const updateCategory = async (
  id: string,
  categoryData: Partial<Category>,
) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de la catégorie",
    };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    // Vérifier s'il y a des services dans cette catégorie
    const servicesQuery = query(
      collection(db, "services"),
      // where('categoryId', '==', id) // Décommentez si vous voulez empêcher la suppression
    );
    const servicesSnapshot = await getDocs(servicesQuery);

    if (!servicesSnapshot.empty) {
      return {
        success: false,
        error: "Impossible de supprimer une catégorie contenant des services",
      };
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de la catégorie",
    };
  }
};
