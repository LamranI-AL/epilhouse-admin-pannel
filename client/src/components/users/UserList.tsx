/** @format */

// components/UserList.tsx
/** @format */

import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Mail,
  Phone,
  Shield,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@/types";

const columnHelper = createColumnHelper<User>();

export default function UserList() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { users, totalUsers, totalPages, loading, error } = useUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    role: roleFilter,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
        ? false
        : undefined,
  });

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

  const columns = useMemo(
    () => [
      columnHelper.accessor("firstName", {
        header: "Utilisateur",
        cell: (info) => (
          <div className="flex items-center space-x-3">
            <div className="user-avatar bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">
                {info.row.original.firstName?.charAt(0)}
                {info.row.original.lastName?.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium text-sm">
                {info.row.original.firstName} {info.row.original.lastName}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {info.row.original.email}
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("phone", {
        header: "Téléphone",
        cell: (info) => (
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 mr-1 text-gray-400" />
            {info.getValue() || "Non renseigné"}
          </div>
        ),
      }),
      columnHelper.accessor("role", {
        header: "Rôle",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
              info.getValue(),
            )}`}>
            {getRoleText(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: "Statut",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              info.getValue()
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
            {info.getValue() ? "Actif" : "Inactif"}
          </span>
        ),
      }),
      columnHelper.accessor("lastLogin", {
        header: "Dernière connexion",
        cell: (info) => {
          const firebaseTimestamp = info.getValue();
          let displayDate;

          if (
            firebaseTimestamp &&
            typeof firebaseTimestamp?.toDate === "function"
          ) {
            // Convert Firebase Timestamp to JavaScript Date object
            const jsDate = firebaseTimestamp.toDate();
            displayDate = jsDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (firebaseTimestamp) {
            // Fallback for other date formats (though less likely if you expect Firebase Timestamps)
            // This part attempts to handle cases where it might already be a Date object or a parsable string/number
            try {
              const date = new Date(firebaseTimestamp);
              // Check if the date is valid
              if (!isNaN(date.getTime())) {
                displayDate = date.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else {
                displayDate = "Date invalide";
              }
            } catch (error) {
              displayDate = "Date invalide";
            }
          } else {
            displayDate = "Jamais connecté";
          }

          return <div className="text-sm text-gray-600">{displayDate}</div>;
        },
      }),
      // FAIRE LA DATE DE CREATION DEFIRBASE AUSSI

      columnHelper.accessor("createdAt", {
        header: "Date de création",
        cell: (info) => {
          const firebaseTimestamp = info.getValue();
          let displayDate;

          if (
            firebaseTimestamp &&
            typeof firebaseTimestamp.toDate === "function"
          ) {
            // Convert Firebase Timestamp to JavaScript Date object
            const jsDate = firebaseTimestamp.toDate();
            displayDate = jsDate.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } else if (firebaseTimestamp) {
            // Fallback for other date formats (though less likely if you expect Firebase Timestamps)
            // This part attempts to handle cases where it might already be a Date object or a parsable string/number
            try {
              const date = new Date(firebaseTimestamp);
              // Check if the date is valid
              if (!isNaN(date.getTime())) {
                displayDate = date.toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              } else {
                displayDate = "Date invalide";
              }
            } catch (error) {
              displayDate = "Date invalide";
            }
          } else {
            displayDate = "Jamais connecté";
          }

          return <div className="text-sm text-gray-600">{displayDate}</div>;
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex space-x-2">
            <button
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Voir">
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-green-600 hover:bg-green-50 rounded"
              title="Modifier">
              <Edit className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Supprimer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600">Gérez vos utilisateurs</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les rôles</option>
              <option value="user">Utilisateur</option>
              <option value="manager">Gestionnaire</option>
              <option value="admin">Administrateur</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {pagination.pageIndex * pagination.pageSize + 1} à{" "}
              {Math.min(
                (pagination.pageIndex + 1) * pagination.pageSize,
                totalUsers,
              )}{" "}
              sur {totalUsers} utilisateurs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-sm">
                Page {pagination.pageIndex + 1} sur {totalPages}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
