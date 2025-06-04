/** @format */

// components/UserDetails.tsx
/** @format */

import React from "react";
import { useUser } from "@/hooks/useUser";
import { User, Mail, Phone, Shield, Calendar, Clock } from "lucide-react";

type Props = {
  userId: string;
};

type UserItemProps = {
  user: any;
};

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "manager":
        return "Gestionnaire";
      default:
        return "Utilisateur";
    }
  };

  return (
    <div className="user-item flex items-center space-x-3">
      <div className="user-icon">
        <div className="user-icon-circle bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="user-info flex-1">
        <div className="flex items-center space-x-2">
          <div className="font-medium text-sm">
            {user?.firstName} {user?.lastName}
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
              user?.role,
            )}`}>
            {getRoleText(user?.role)}
          </span>
          {!user?.isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inactif
            </span>
          )}
        </div>
        {user?.email && (
          <div className="text-xs text-gray-500 flex items-center mt-1">
            <Mail className="w-3 h-3 mr-1" />
            {user.email}
          </div>
        )}
        {user?.phone && (
          <div className="text-xs text-gray-500 flex items-center">
            <Phone className="w-3 h-3 mr-1" />
            {user.phone}
          </div>
        )}
        {user?.lastLogin && (
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Dernière connexion:{" "}
            {new Date(user.lastLogin).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>
    </div>
  );
};

function UserDetails({ userId }: Props) {
  const { user, loading, error } = useUser({ userId });

  if (loading) {
    return (
      <div>
        <div className="loading flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Chargement de l'utilisateur...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="error text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1">
      {user ? (
        <UserItem user={user} />
      ) : (
        <div className="text-gray-500 text-sm">Aucun utilisateur trouvé</div>
      )}
    </div>
  );
}

export default UserDetails;
