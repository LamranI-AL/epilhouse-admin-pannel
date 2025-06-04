/** @format */

import { AgentWithDetails } from "@/types";
import React, { useEffect, useState } from "react";
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
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Users,
} from "lucide-react";
import {
  getServiceById,
  getSubServiceNamesAndCategories,
  validateSubServiceIds,
} from "@/actions/services";
import { getLocationById } from "@/actions/locations";

type Props = {
  agents: AgentWithDetails[];
  onView?: (agent: AgentWithDetails) => void;
  onEdit?: (agent: AgentWithDetails) => void;
  onDelete?: (agent: AgentWithDetails) => void;
};

function AgentsTable({ agents, onView, onEdit, onDelete }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("");

  const getStatusBadge = (status: string, isOnLeave: boolean) => {
    if (isOnLeave) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
          <Calendar className="w-3 h-3 mr-1" />
          En congé
        </span>
      );
    }

    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm">
            <XCircle className="w-3 h-3 mr-1" />
            Inactif
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
            {status}
          </span>
        );
    }
  };

  const handleSelectAgent = (agentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAgents([...selectedAgents, agentId]);
    } else {
      setSelectedAgents(selectedAgents.filter((id) => id !== agentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(agents.map((agent) => agent.id.toString()));
    } else {
      setSelectedAgents([]);
    }
  };

  const columns: ColumnDef<AgentWithDetails>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={selectedAgents.length === agents.length && agents.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedAgents.includes(row.original.id.toString())}
          onChange={(e) =>
            handleSelectAgent(row.original.id.toString(), e.target.checked)
          }
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <span>Agent</span>
          {column.getIsSorted() === "asc" ? (
            <SortAsc className="w-4 h-4" />
          ) : column.getIsSorted() === "desc" ? (
            <SortDesc className="w-4 h-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => {
        const agent = row.original;
        const initials = `${agent.firstName[0]}${agent.lastName[0]}`;

        return (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-blue-700 font-semibold text-sm">
                  {initials}
                </span>
              </div>
              {agent.isOnLeave && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {agent.firstName} {agent.lastName}
              </div>
              {agent.displayName && (
                <div className="text-sm text-blue-600 font-medium">
                  "{agent.displayName}"
                </div>
              )}
              {agent.title && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                  {agent.title}
                </div>
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
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 hover:text-blue-600 cursor-pointer">
                {agent.email}
              </span>
            </div>
            {agent.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  {agent.phone}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <span>Statut</span>
          <Filter className="w-4 h-4 text-gray-400" />
        </div>
      ),
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="flex flex-col space-y-1">
            {getStatusBadge(agent.status, agent.isOnLeave)}
            {agent.isOnLeave && (
              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Retour prévu bientôt
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "workingHours",
      header: "Horaires",
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="space-y-2">
            {agent.workingHours && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  {agent.workingHours.start} - {agent.workingHours.end}
                </span>
              </div>
            )}
            {agent.workingDays && agent.workingDays.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.workingDays.slice(0, 4).map((day) => (
                  <span
                    key={day}
                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-200">
                    {day.substring(0, 3)}
                  </span>
                ))}
                {agent.workingDays.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    +{agent.workingDays.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "assignedLocations",
      header: "Centre",
      cell: ({ row }) => {
        const location = row.original.assignedLocationId;
        console.log(location);
        const [locationName, setLocationName] = useState("");
        useEffect(() => {
          const fetchLocation = async () => {
            const result = await getLocationById(location);
            console.log(result.location);
            setLocationName(result.location ? result.location.name : "");
          };
          fetchLocation();
        }, [location]);

        // Vérifier si l'agent a une location assignée
        if (!location) {
          return (
            <span className="text-gray-400 text-sm italic">
              Aucun centre assigné
            </span>
          );
        }

        return (
          <div className="flex items-center space-x-2 text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-200 max-w-fit">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{locationName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => {
        const subServiceIds = row.original.assignedServiceIds;
        const [serviceNamesFromIds, setserviceNamesFromIds] = useState<any[]>(
          [],
        );
        // const services = row.original.assignedServiceIds;
        if (!subServiceIds || subServiceIds.length === 0) {
          return (
            <span className="text-gray-400 text-sm italic">
              Aucun service assigné
            </span>
          );
        }

        // FITCHER LES subServices PAR ids
        useEffect(() => {
          const fetchServices = async () => {
            const result: any = await getSubServiceNamesAndCategories(
              subServiceIds as any,
            );
            console.log(result.data);
            setserviceNamesFromIds(result?.data! as any);
          };
          fetchServices();
        }, [subServiceIds]);

        return (
          <div className="space-y-1">
            {serviceNamesFromIds.slice(0, 2).map((service) => (
              <div
                key={service.id}
                className="flex items-center space-x-2 text-sm bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: service.categoryColor }}
                />
                <span className="font-medium">{service.subServiceName}</span>
              </div>
            ))}
            {subServiceIds.length > 2 && (
              <div className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                +{subServiceIds.length - 2} autres services
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalBookings",
      header: ({ column }) => (
        <button
          className="flex items-center space-x-1 hover:text-gray-900"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <span>Performance</span>
          {column.getIsSorted() === "asc" ? (
            <SortAsc className="w-4 h-4" />
          ) : column.getIsSorted() === "desc" ? (
            <SortDesc className="w-4 h-4" />
          ) : null}
        </button>
      ),
      cell: ({ row }) => {
        const bookings = row.original.totalBookings || 0;
        const getPerformanceColor = (count: number) => {
          if (count >= 50)
            return "bg-green-100 text-green-800 border-green-200";
          if (count >= 20)
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          return "bg-gray-100 text-gray-800 border-gray-200";
        };

        return (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold border shadow-sm ${getPerformanceColor(
                bookings,
              )}`}>
              {bookings}
            </span>
            <div className="text-xs text-gray-500 mt-1">réservations</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="flex items-center justify-center space-x-1">
            {onView && (
              <button
                onClick={() => onView(agent)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Voir les détails">
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(agent)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Modifier l'agent">
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(agent)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Supprimer l'agent">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
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

  const filteredAgents = table.getFilteredRowModel().rows;
  const statusCounts = {
    total: agents.length,
    active: agents.filter((a) => a.status === "active" && !a.isOnLeave).length,
    inactive: agents.filter((a) => a.status === "inactive").length,
    onLeave: agents.filter((a) => a.isOnLeave).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header avec statistiques */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Équipe d'Agents
              </h1>
              <p className="text-sm text-gray-600">
                Gérez vos {agents.length} agents et leurs assignations
              </p>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.active}
              </div>
              <div className="text-xs text-gray-600">Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statusCounts.onLeave}
              </div>
              <div className="text-xs text-gray-600">En congé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.inactive}
              </div>
              <div className="text-xs text-gray-600">Inactifs</div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-80 bg-white shadow-sm"
              />
            </div>

            {/* Filtre par statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm">
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
              <option value="onLeave">En congé</option>
            </select>
          </div>

          {/* Actions groupées */}
          {selectedAgents.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAgents.length} agent(s) sélectionné(s)
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                Actions groupées
              </button>
            </div>
          )}
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
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
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
          <tbody className="bg-white divide-y divide-gray-100">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4">
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
                  className="px-6 py-16 text-center text-gray-500">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Aucun agent trouvé
                      </p>
                      <p className="text-sm text-gray-500">
                        {globalFilter
                          ? "Essayez de modifier vos critères de recherche"
                          : "Commencez par ajouter votre premier agent"}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination améliorée */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              Affichage de{" "}
              <span className="font-medium">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
              </span>{" "}
              à{" "}
              <span className="font-medium">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  filteredAgents.length,
                )}
              </span>{" "}
              sur <span className="font-medium">{filteredAgents.length}</span>{" "}
              résultats
            </div>

            {/* Sélecteur de taille de page */}
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              {[10, 20, 30, 50].map((pageSize) => (
                <option
                  key={pageSize}
                  value={pageSize}>
                  {pageSize} par page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        page === pageIndex
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700 hover:bg-gray-100 border border-gray-300"
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
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentsTable;
