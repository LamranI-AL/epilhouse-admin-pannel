/** @format */

// hooks/useCategories.ts - Hook personnalisé pour les catégories
import { useState, useEffect } from "react";
import { getAllCategories } from "@/actions/categories";
import { Category } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllCategories();
      if (result.success) {
        setCategories(result?.categories as any);
      } else {
        setError(result.error || "Erreur inconnue");
        toast({
          title: "Erreur",
          description: result.error || "Impossible de charger les catégories",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = "Erreur lors du chargement des catégories";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories,
  };
};
