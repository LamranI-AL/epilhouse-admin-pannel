/** @format */

// hooks/useUser.ts
/** @format */

import { useState, useEffect } from "react";
import { getUserById } from "@/actions/users"; // Assuming this function exists
import { User } from "@/types/user";

type UserProps = {
  userId: string;
};

export const useUser = ({ userId }: UserProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("UserId:", userId);
  console.log("User:", user);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getUserById(userId);
        setUser(result.user || result);
      } catch (err) {
        setError("Erreur lors du chargement de l'utilisateur");
        console.error("Error fetching user:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};
