/** @format */

import { AgentWithDetails } from "@/types";
import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

type Props = {
  agents: AgentWithDetails[];
};

function AgentsTable({ agents }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const getStatusBadge = (status: string, isOnLeave: boolean) => {
    if (isOnLeave) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <Calendar className="w-3 h-3 mr-1" />
          En congé
        </span>
      );
    }

    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Inactif
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const columns: ColumnDef<AgentWithDetails>[] = [
    {
      accessorKey: "name",
      header: "Agent",
      cell: ({ row }) => {
        const agent = row.original;
        const initials = `${agent.firstName[0]}${agent.lastName[0]}`;

        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-medium text-sm">
                {initials}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {agent.firstName} {agent.lastName}
              </div>
              {agent.displayName && (
                <div className="text-sm text-gray-500">
                  "{agent.displayName}"
                </div>
              )}
              {agent.title && (
                <div className="text-xs text-gray-400">{agent.title}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900">{agent.email}</span>
            </div>
            {agent.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{agent.phone}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const agent = row.original;
        return getStatusBadge(agent.status, agent.isOnLeave);
      },
    },
    {
      accessorKey: "workingHours",
      header: "Horaires",
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="space-y-1">
            {agent.workingHours && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>
                  {agent.workingHours.start} - {agent.workingHours.end}
                </span>
              </div>
            )}
            {agent.workingDays && agent.workingDays.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.workingDays.slice(0, 3).map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                    {day.substring(0, 3)}
                  </span>
                ))}
                {agent.workingDays.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    +{agent.workingDays.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "locations",
      header: "Localisations",
      cell: ({ row }) => {
        const locations = row.original.assignedLocations;
        if (!locations || locations.length === 0) {
          return <span className="text-gray-400 text-sm">Aucune</span>;
        }

        return (
          <div className="space-y-1">
            {locations.slice(0, 2).map((location) => (
              <div
                key={location.id}
                className="flex items-center space-x-1 text-sm">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-gray-700">{location.name}</span>
              </div>
            ))}
            {locations.length > 2 && (
              <div className="text-xs text-gray-500">
                +{locations.length - 2} autres
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => {
        const services = row.original.assignedServices;
        if (!services || services.length === 0) {
          return <span className="text-gray-400 text-sm">Aucun</span>;
        }

        return (
          <div className="space-y-1">
            {services.slice(0, 2).map((service) => (
              <div
                key={service.id}
                className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <span className="text-gray-700">{service.name}</span>
              </div>
            ))}
            {services.length > 2 && (
              <div className="text-xs text-gray-500">
                +{services.length - 2} autres
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalBookings",
      header: "Réservations",
      cell: ({ row }) => {
        const bookings = row.original.totalBookings;
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {bookings}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: agents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Agents</h1>
              <p className="text-sm text-gray-600">
                Gérez vos {agents.length} agents
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-80"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 transition-colors">
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
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-2">
                    <User className="w-12 h-12 text-gray-300" />
                    <p>Aucun agent trouvé</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            à{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}{" "}
            sur {table.getFilteredRowModel().rows.length} résultats
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, table.getPageCount()) },
                (_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const totalPages = table.getPageCount();

                  let startPage = Math.max(0, pageIndex - 2);
                  let endPage = Math.min(totalPages - 1, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(0, endPage - 4);
                  }

                  const page = startPage + i;
                  if (page >= totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => table.setPageIndex(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        page === pageIndex
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}>
                      {page + 1}
                    </button>
                  );
                },
              )}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentsTable;
