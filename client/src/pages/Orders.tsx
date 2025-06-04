/** @format */

import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  MapPin,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  Settings,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { QuickReservation } from "@/types";
import { useBooking } from "@/hooks/use-booking";
import {
  updateBookingStatus,
  deleteBooking,
  deleteQuickBooking,
  updateBooking,
  getAllQuickBookings,
} from "@/actions/Bookings";
import ServiceDetails from "./ServiceByReservations";
import LocationDetails from "@/components/location/detailsById";
import { useAuth } from "@/providers/auth-provider";

export default function EnhancedReservationTable() {
  const { quickBookings } = useBooking();
  const { agentData, currentUser, userRole } = useAuth();

  // State pour les données et filtres
  const [reservations, setReservations] = useState<QuickReservation[]>([]);
  const [filteredData, setFilteredData] = useState<QuickReservation[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // State pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // State pour les actions
  const [selectedReservations, setSelectedReservations] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<QuickReservation | null>(null);

  // Fonction pour récupérer les réservations selon le rôle
  const fetchReservations = async () => {
    setInitialLoading(true);
    try {
      console.log("Récupération des réservations...");
      console.log("UserRole:", userRole);
      console.log("AgentData:", agentData);

      const result = await getAllQuickBookings();

      if (result.success) {
        let allReservations = result.quickBookings || [];
        console.log("Total réservations récupérées:", allReservations.length);

        // Filtrer selon le rôle utilisateur
        if (userRole === "admin" && agentData?.assignedLocationId) {
          console.log(
            "Admin détecté - Filtrage par location:",
            agentData.assignedLocationId,
          );

          allReservations = allReservations.filter(
            (reservation: QuickReservation) =>
              reservation.locationId === agentData.assignedLocationId,
          );

          console.log(
            "Réservations après filtrage admin:",
            allReservations.length,
          );
        } else if (userRole === "superAdmin") {
          console.log(
            "SuperAdmin détecté - Affichage de toutes les réservations",
          );
          // Pas de filtrage pour superAdmin
        } else if (userRole === "admin" && !agentData?.assignedLocationId) {
          console.log(
            "Admin sans assignedLocationId - Aucune réservation affichée",
          );
          allReservations = [];
        } else {
          console.log("Rôle non reconnu ou non autorisé");
          allReservations = [];
        }

        setReservations(allReservations);
      } else {
        console.error(
          "Erreur lors de la récupération des réservations:",
          result,
        );
        setReservations([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      setReservations([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Charger les données selon le rôle et les permissions
  useEffect(() => {
    if (
      userRole &&
      (userRole === "superAdmin" ||
        (userRole === "admin" && agentData?.assignedLocationId))
    ) {
      fetchReservations();
    } else if (userRole === "admin" && !agentData?.assignedLocationId) {
      console.log("Admin sans assignedLocationId - Pas de chargement");
      setInitialLoading(false);
      setReservations([]);
    } else if (userRole) {
      console.log("Rôle détecté mais non autorisé:", userRole);
      setInitialLoading(false);
      setReservations([]);
    }
  }, [userRole, agentData?.assignedLocationId]);

  // Utiliser les données du hook si disponibles (pour compatibilité)
  useEffect(() => {
    if (quickBookings && !userRole) {
      setReservations(quickBookings);
      setInitialLoading(false);
    }
  }, [quickBookings, userRole]);

  // Appliquer les filtres et la pagination
  useEffect(() => {
    let filtered = reservations.filter((r) => {
      const matchesSearch =
        r.clientFirstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.clientLastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.clientEmail.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesLocation =
        !locationFilter || r.locationId === locationFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter;

      return matchesSearch && matchesLocation && matchesStatus;
    });

    // Calculer la pagination
    const total = Math.ceil(filtered.length / pageSize);
    setTotalPages(total);

    // Appliquer la pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredData(paginated);
  }, [
    reservations,
    searchFilter,
    locationFilter,
    statusFilter,
    currentPage,
    pageSize,
  ]);

  // Actions individuelles
  const handleAccept = async (id: string) => {
    setLoading(true);
    try {
      const updatedBooking = {
        id: id,
        agent: {
          id: currentUser?.uid,
          firstName: agentData?.firstName,
          lastName: agentData?.lastName,
        },
        updatedAt: new Date(),
        updatedBy: currentUser?.uid,
      };

      console.log("Mise à jour booking:", updatedBooking);
      await updateBooking(id, updatedBooking as any);
      await updateBookingStatus(id, "confirmed");

      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "confirmed" as const, updatedAt: new Date() }
            : r,
        ),
      );
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      alert("Erreur lors de la confirmation de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    try {
      const updatedBooking = {
        id: id,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid,
      };
      await updateBooking(id, updatedBooking as any);
      await updateBookingStatus(id, "cancelled");

      setReservations((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: "cancelled" as const, updatedAt: new Date() }
            : r,
        ),
      );
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      alert("Erreur lors de l'annulation de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteQuickBooking(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setShowDeleteModal(false);
      setReservationToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reservation: QuickReservation) => {
    setSelectedReservation(reservation);
    setShowViewModal(true);
  };

  const handleEdit = (reservation: QuickReservation) => {
    console.log("Éditer la réservation:", reservation);
    alert(`Fonctionnalité d'édition pour la réservation #${reservation.id}`);
  };

  // Actions de sélection
  const handleSelectReservation = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedReservations([...selectedReservations, id]);
    } else {
      setSelectedReservations(
        selectedReservations.filter((resId) => resId !== id),
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReservations(filteredData.map((r) => r.id));
    } else {
      setSelectedReservations([]);
    }
  };

  // Actions groupées
  const handleBulkStatusChange = async (status: "confirmed" | "cancelled") => {
    setLoading(true);
    try {
      const promises = selectedReservations.map((id) =>
        updateBookingStatus(id, status),
      );
      await Promise.all(promises);

      setReservations((prev) =>
        prev.map((r) =>
          selectedReservations.includes(r.id)
            ? { ...r, status, updatedAt: new Date() }
            : r,
        ),
      );
      setSelectedReservations([]);
    } catch (error) {
      console.error("Erreur lors de la mise à jour groupée:", error);
      alert("Erreur lors de la mise à jour groupée");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      const promises = selectedReservations.map((id) => deleteBooking(id));
      await Promise.all(promises);

      setReservations((prev) =>
        prev.filter((r) => !selectedReservations.includes(r.id)),
      );
      setSelectedReservations([]);
    } catch (error) {
      console.error("Erreur lors de la suppression groupée:", error);
      alert("Erreur lors de la suppression groupée");
    } finally {
      setLoading(false);
    }
  };

  // Export des données
  const handleExport = () => {
    const csvData = filteredData.map((r) => ({
      ID: r.id,
      Client: `${r.clientFirstName} ${r.clientLastName}`,
      Email: r.clientEmail,
      Téléphone: r.clientPhone,
      Date: r.selectedDate,
      Heure: r.selectedTime,
      Statut: getStatusText(r.status),
      Total: r.totalAmount,
      Notes: r.notes,
      Location: r.locationId,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations_${userRole}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Utilitaires
  const getStatusColor = (status: string) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    if (status === "confirmed") return "bg-green-100 text-green-800";
    if (status === "cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    if (status === "pending") return "En attente";
    if (status === "confirmed") return "Confirmé";
    if (status === "cancelled") return "Annulé";
    return status;
  };

  const uniqueLocations = Array.from(
    new Set(reservations.map((r) => r.locationId)),
  );
  const uniqueStatuses = Array.from(new Set(reservations.map((r) => r.status)));

  // Affichage conditionnel selon les permissions
  if (userRole === "admin" && !agentData?.assignedLocationId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-orange-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès limité
          </h1>
          <p className="text-gray-600 mb-6">
            Votre compte admin n'est pas encore assigné à une location.
            Contactez un super administrateur pour configurer votre accès.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-400 mr-2" />
              <div className="text-sm text-orange-700">
                <strong>Information :</strong> Les administrateurs ne peuvent
                accéder qu'aux réservations de leur location assignée.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Chargement des réservations...
          </h1>
          <p className="text-gray-600">
            {userRole === "admin"
              ? "Récupération des réservations de votre location..."
              : "Récupération de toutes les réservations..."}
          </p>
        </div>
      </div>
    );
  }

  if (!reservations.length) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Réservations
            {userRole === "admin" && (
              <span className="text-sm font-normal text-blue-600 ml-2">
                (Admin - Location: {agentData?.assignedLocationId})
              </span>
            )}
            {userRole === "superAdmin" && (
              <span className="text-sm font-normal text-green-600 ml-2">
                (Super Admin - Toutes locations)
              </span>
            )}
          </h1>
          <p className="text-gray-600 mb-6">
            {userRole === "admin"
              ? "Aucune réservation trouvée pour votre location"
              : "Aucune réservation trouvée"}
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une réservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header avec actions globales */}
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                Réservations
                {userRole === "admin" && (
                  <span className="ml-3 flex items-center text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin - {agentData?.assignedLocationId}
                  </span>
                )}
                {userRole === "superAdmin" && (
                  <span className="ml-3 flex items-center text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 mr-1" />
                    Super Admin - Toutes locations
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Gérez vos réservations clients ({reservations.length} au total)
                {userRole === "admin" && " - Limitées à votre location"}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedReservations.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkStatusChange("confirmed")}
                    disabled={loading}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Confirmer ({selectedReservations.length})
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange("cancelled")}
                    disabled={loading}
                    className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center text-sm">
                    <X className="w-4 h-4 mr-1" />
                    Annuler ({selectedReservations.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center text-sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer ({selectedReservations.length})
                  </button>
                </div>
              )}
              <button
                onClick={handleExport}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm">
                <Download className="w-4 h-4 mr-1" />
                Exporter
              </button>
              <button
                onClick={fetchReservations}
                disabled={initialLoading}
                className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center text-sm">
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${
                    initialLoading ? "animate-spin" : ""
                  }`}
                />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Info panel pour debug/info - à retirer en production */}
        <div className="px-6 py-3 border-b bg-blue-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-blue-700">
              <span>
                <strong>Rôle:</strong> {userRole}
              </span>
              <span>
                <strong>Location:</strong>{" "}
                {agentData?.assignedLocationId || "Non assignée"}
              </span>
              <span>
                <strong>Réservations chargées:</strong> {reservations.length}
              </span>
            </div>
            {userRole === "admin" && (
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                Filtrage automatique par location activé
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border rounded-md hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Location Filter - Masqué pour les admins car filtrage automatique */}
              {userRole === "superAdmin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Toutes les locations</option>
                    {uniqueLocations.map((locationId) => (
                      <option
                        key={locationId}
                        value={locationId}>
                        {locationId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tous les statuts</option>
                  {uniqueStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}>
                      {getStatusText(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Éléments par page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedReservations.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Heure
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Récurrent
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Notes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading
                ? // Loading skeleton
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 10 }).map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredData.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="hover:bg-gray-50">
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(
                            reservation.id,
                          )}
                          onChange={(e) =>
                            handleSelectReservation(
                              reservation.id,
                              e.target.checked,
                            )
                          }
                          className="rounded"
                        />
                      </td>

                      {/* Client */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm">
                              {reservation.clientFirstName}{" "}
                              {reservation.clientLastName}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {reservation.clientEmail}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {reservation.clientPhone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                          {reservation.selectedDate}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {reservation.selectedTime}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                          <LocationDetails booking={reservation} />
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {reservation.locationId}
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium">
                          <ServiceDetails booking={reservation} />
                        </div>
                        <div className="text-xs text-gray-500">
                          Services:{" "}
                          {Array.isArray(reservation.selectedServices)
                            ? reservation.selectedServices.length
                            : 1}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4">
                        <div className="flex items-center font-semibold text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {reservation.totalAmount}€
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            reservation.status,
                          )}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </td>

                      {/* Recurring */}
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {reservation.isRecurring ? (
                            <>
                              <RefreshCw className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="text-xs text-blue-600">Oui</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Non</span>
                          )}
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-4">
                        {reservation.notes && (
                          <div className="flex items-start max-w-xs">
                            <FileText className="w-4 h-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-600 line-clamp-2">
                              {reservation.notes}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          {reservation.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(reservation.id)}
                                disabled={loading}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Accepter">
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(reservation.id)}
                                disabled={loading}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                                title="Annuler">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Menu actions */}
                          <div className="relative">
                            <button
                              onClick={() => handleView(reservation)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                              title="Voir les détails">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="relative">
                            <button
                              onClick={() => handleEdit(reservation)}
                              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              title="Modifier">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="relative">
                            <button
                              onClick={() => {
                                setReservationToDelete(reservation.id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
              {Math.min(currentPage * pageSize, reservations.length)} sur{" "}
              {reservations.length} réservations
              {userRole === "admin" && (
                <span className="text-blue-600 ml-1">
                  (Location: {agentData?.assignedLocationId})
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-2 text-sm">
                Page {currentPage} sur {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer avec statistiques */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Total: {reservations.length} réservations</span>
              {userRole === "admin" && (
                <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">
                  Filtré par location: {agentData?.assignedLocationId}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-100 rounded-full mr-1"></div>
                En attente:{" "}
                {reservations.filter((r) => r.status === "pending").length}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded-full mr-1"></div>
                Confirmées:{" "}
                {reservations.filter((r) => r.status === "confirmed").length}
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded-full mr-1"></div>
                Annulées:{" "}
                {reservations.filter((r) => r.status === "cancelled").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold">
                Confirmer la suppression
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cette réservation ? Cette
              action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReservationToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}>
                Annuler
              </button>
              <button
                onClick={() =>
                  reservationToDelete && handleDelete(reservationToDelete)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={loading}>
                {loading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {showViewModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                Détails de la réservation
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedReservation(null);
                }}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations client */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  Informations client
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {selectedReservation.clientFirstName}{" "}
                      {selectedReservation.clientLastName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedReservation.clientEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedReservation.clientPhone}</span>
                  </div>
                </div>
              </div>

              {/* Informations réservation */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">
                  Détails de la réservation
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{selectedReservation.selectedDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{selectedReservation.selectedTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <LocationDetails booking={selectedReservation} />
                      <div className="text-xs text-gray-500">
                        ID: {selectedReservation.locationId}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <ServiceDetails booking={selectedReservation} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-green-600">
                      {selectedReservation.totalAmount}€
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedReservation.status,
                      )}`}>
                      {getStatusText(selectedReservation.status)}
                    </span>
                  </div>
                  {selectedReservation.isRecurring && (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-600">
                        Réservation récurrente
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedReservation.notes && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-3">
                  Notes
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-700">{selectedReservation.notes}</p>
                </div>
              </div>
            )}

            {/* Actions dans le modal */}
            <div className="mt-6 flex justify-end space-x-3">
              {selectedReservation.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleAccept(selectedReservation.id);
                      setShowViewModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    disabled={loading}>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedReservation.id);
                      setShowViewModal(false);
                      setSelectedReservation(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  handleEdit(selectedReservation);
                  setShowViewModal(false);
                  setSelectedReservation(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
