/** @format */

// hooks/useUsers.ts
/** @format */

import { useState, useEffect } from "react";
import { getUsers, getUserById } from "@/actions/users"; // Assuming these functions exist
import { User } from "@/types";

type UsersProps = {
  userIds?: string[];
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
};

export const useUsers = ({
  userIds,
  page = 1,
  limit = 10,
  search = "",
  role = "",
  isActive,
}: UsersProps = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Users params:", {
    userIds,
    page,
    limit,
    search,
    role,
    isActive,
  });
  console.log("Users:", users);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (userIds && userIds.length > 0) {
          // Fetch specific users by IDs
          const userPromises = userIds.map(async (userId) => {
            const result = await getUserById(userId);
            return result.user || result;
          });

          const fetchedUsers = await Promise.all(userPromises);
          setUsers(fetchedUsers.filter(Boolean) as User[]);
          setTotalUsers(fetchedUsers.length);
          setTotalPages(1);
        } else {
          // Fetch all users with pagination and filters
          const result = await getUsers({
            page,
            limit,
            search,
            role: role || undefined,
            isActive,
          });

          setUsers(result.users || []);
          setTotalUsers(result.total || 0);
          setTotalPages(Math.ceil((result.total || 0) / limit));
        }
      } catch (err) {
        setError("Erreur lors du chargement des utilisateurs");
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userIds, page, limit, search, role, isActive]);

  return {
    users,
    totalUsers,
    totalPages,
    loading,
    error,
    currentPage: page,
  };
};
