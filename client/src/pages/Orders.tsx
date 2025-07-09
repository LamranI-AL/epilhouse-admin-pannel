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
  SlidersHorizontal,
  FilterX,
  CalendarIcon,
  Loader2,
  RotateCcw,
  Archive,
  Star,
  TrendingUp,
  Users,
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

// Interface pour les filtres avancés
interface AdvancedFilters {
  service: string;
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  agent: string;
  location: string;
  client: string;
  status: string;
  paymentStatus: string;
  amountMin: string;
  amountMax: string;
}

export default function EnhancedReservationTableUX() {
  const { quickBookings } = useBooking();
  const { agentData, currentUser, userRole } = useAuth();

  // États principaux
  const [reservations, setReservations] = useState<QuickReservation[]>([]);
  const [filteredData, setFilteredData] = useState<QuickReservation[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // États pour les filtres basiques
  const [searchFilter, setSearchFilter] = useState("");
  const [quickSearchFocus, setQuickSearchFocus] = useState(false);

  // États pour les filtres avancés
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    service: "",
    dateFrom: "",
    dateTo: "",
    timeFrom: "",
    timeTo: "",
    agent: "",
    location: "",
    client: "",
    status: "",
    paymentStatus: "",
    amountMin: "",
    amountMax: "",
  });

  // États pour les actions
  const [selectedReservations, setSelectedReservations] = useState<string[]>(
    [],
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(
    null,
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<QuickReservation | null>(null);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // États pour l'UX
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statusOptions = [
    "Show All",
    "En attente",
    "Confirmé",
    "Annulé",
    "Approuvé",
  ];

  const paymentStatusOptions = ["Show All", "Not Paid", "Paid", "Pending"];

  // Récupération des réservations selon le rôle
  const fetchReservations = async () => {
    setInitialLoading(true);
    try {
      const result = await getAllQuickBookings();
      console.log(result);

      if (result.success) {
        let allReservations = result.quickBookings || [];
        console.log(allReservations);
        console.log(userRole);

        // Filtrer selon le rôle utilisateur
        if (userRole === "admin" && agentData?.assignedLocationId) {
          allReservations = allReservations.filter(
            (reservation: QuickReservation) =>
              reservation.locationId === agentData.assignedLocationId,
          );
        } else if (userRole === "superAdmin") {
          // SuperAdmin voit tout
        } else if (userRole === "admin" && !agentData?.assignedLocationId) {
          allReservations = [];
        } else {
          allReservations = [];
        }

        setReservations(allReservations);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      setReservations([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Actualisation manuelle
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReservations();
    setIsRefreshing(false);
  };

  useEffect(() => {
    console.log(userRole);
    console.log(agentData?.assignedLocationId);
    if (
      userRole &&
      (userRole === "superAdmin" ||
        (userRole === "admin" && agentData?.assignedLocationId))
    ) {
      console.log("ici a fitch");
      fetchReservations();
    } else if (userRole === "admin" && !agentData?.assignedLocationId) {
      setInitialLoading(false);
      setReservations([]);
    } else if (userRole) {
      setInitialLoading(false);
      setReservations([]);
    }
  }, [userRole, agentData?.assignedLocationId]);

  useEffect(() => {
    if (quickBookings && !userRole) {
      setReservations(quickBookings);
      setInitialLoading(false);
    }
  }, [quickBookings, userRole]);

  // Application des filtres avec compteur
  useEffect(() => {
    let filtered = reservations.filter((r) => {
      const matchesSearch =
        r.clientFirstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.clientLastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.clientEmail.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesAdvancedDateFrom =
        !advancedFilters.dateFrom ||
        new Date(r.selectedDate) >= new Date(advancedFilters.dateFrom);

      const matchesAdvancedDateTo =
        !advancedFilters.dateTo ||
        new Date(r.selectedDate) <= new Date(advancedFilters.dateTo);

      const matchesAdvancedTimeFrom =
        !advancedFilters.timeFrom || r.selectedTime >= advancedFilters.timeFrom;

      const matchesAdvancedTimeTo =
        !advancedFilters.timeTo || r.selectedTime <= advancedFilters.timeTo;

      const matchesAdvancedClient =
        !advancedFilters.client ||
        `${r.clientFirstName} ${r.clientLastName}`
          .toLowerCase()
          .includes(advancedFilters.client.toLowerCase());

      const matchesAdvancedStatus =
        !advancedFilters.status ||
        advancedFilters.status === "Show All" ||
        r.status === advancedFilters.status;

      return (
        matchesSearch &&
        matchesAdvancedDateFrom &&
        matchesAdvancedDateTo &&
        matchesAdvancedTimeFrom &&
        matchesAdvancedTimeTo &&
        matchesAdvancedClient &&
        matchesAdvancedStatus
      );
    });

    // Compter les filtres actifs
    const activeCount =
      Object.values(advancedFilters).filter(
        (value) => value && value !== "Show All",
      ).length + (searchFilter ? 1 : 0);
    setActiveFiltersCount(activeCount);

    // Calculer la pagination
    const total = Math.ceil(filtered.length / pageSize);
    setTotalPages(total);

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    setFilteredData(paginated);
  }, [reservations, searchFilter, advancedFilters, currentPage, pageSize]);

  // Fonction pour réinitialiser tous les filtres
  const resetAllFilters = () => {
    setSearchFilter("");
    setAdvancedFilters({
      service: "",
      dateFrom: "",
      dateTo: "",
      timeFrom: "",
      timeTo: "",
      agent: "",
      location: "",
      client: "",
      status: "",
      paymentStatus: "",
      amountMin: "",
      amountMax: "",
    });
    setCurrentPage(1);
  };

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
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reservation: QuickReservation) => {
    setSelectedReservation(reservation);
    setShowViewModal(true);
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
    a.download = `reservations_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Utilitaires
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  // Calculs pour les statistiques
  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    revenue: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
  };

  // Affichage conditionnel selon les permissions
  if (userRole === "admin" && !agentData?.assignedLocationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Accès limité
          </h1>
          <p className="text-gray-600 mb-6">
            Votre compte admin n'est pas encore assigné à une location.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center text-sm text-orange-700">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Contactez un super administrateur pour configurer votre accès.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement en cours...
          </h1>
          <p className="text-gray-600">Récupération de vos réservations</p>
        </div>
      </div>
    );
  }

  if (!reservations.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Aucune réservation
          </h1>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première réservation.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center mx-auto">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle réservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        {/* Header avec statistiques */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Rendez-vous
                {userRole === "admin" && (
                  <span className="ml-3 text-base font-normal bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Admin
                  </span>
                )}
                {userRole === "superAdmin" && (
                  <span className="ml-3 text-base font-normal bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 inline mr-1" />
                    Super Admin
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Gérez vos réservations clients avec une interface intuitive
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                <RotateCcw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualiser
              </button>
              {/* <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                Paramètres
              </button> */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Statistiques visuelles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    En attente
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Confirmées
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.confirmed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.cancelled}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenus</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.revenue}€
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section des filtres améliorée */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          {/* Barre de recherche rapide */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onFocus={() => setQuickSearchFocus(true)}
                  onBlur={() => setQuickSearchFocus(false)}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg transition-all ${
                    quickSearchFocus
                      ? "border-blue-500 ring-4 ring-blue-100"
                      : "border-gray-300 hover:border-gray-400"
                  } focus:outline-none`}
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  showAdvancedFilters
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                <SlidersHorizontal className="w-4 h-4" />
                Filtres avancés
                {activeFiltersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Filtre Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={advancedFilters.dateFrom}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          dateFrom: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="date"
                      value={advancedFilters.dateTo}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          dateTo: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Filtre Heure */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={advancedFilters.timeFrom}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          timeFrom: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="time"
                      value={advancedFilters.timeTo}
                      onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          timeTo: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Filtre Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={advancedFilters.client}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        client: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Filtre Statut */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) =>
                      setAdvancedFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                    {statusOptions.map((option) => (
                      <option
                        key={option}
                        value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {activeFiltersCount > 0 && (
                    <span className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {activeFiltersCount} filtre(s) actif(s)
                    </span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetAllFilters}
                    disabled={activeFiltersCount === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <FilterX className="w-4 h-4" />
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => console.log("Filtres appliqués")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tableau principal avec design amélioré */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header du tableau */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Réservations
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredData.length} résultat
                  {filteredData.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option value={10}>10 par page</option>
                  <option value={25}>25 par page</option>
                  <option value={50}>50 par page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table responsive */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  {/* <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th> */}
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Emplacement
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  // Skeleton amélioré
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr
                      key={index}
                      className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded-lg"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((reservation, index) => (
                    <tr
                      key={reservation.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-25"
                      }`}>
                      {/* Date & Heure */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {new Date(
                              reservation.selectedDate,
                            ).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Clock className="w-3 h-3" />
                            {reservation.selectedTime}
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {reservation.clientFirstName.charAt(0)}
                            {reservation.clientLastName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.clientFirstName}{" "}
                              {reservation.clientLastName}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {reservation.clientEmail}
                            </div>
                            {reservation.clientPhone && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {reservation.clientPhone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      {/* <td className="px-6 py-4">
                        <div className="text-sm">
                          <ServiceDetails booking={reservation} />
                        </div>
                      </td> */}

                      {/* Emplacement */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <LocationDetails booking={reservation} />
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            reservation.status,
                          )}`}>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              reservation.status === "pending"
                                ? "bg-yellow-400"
                                : reservation.status === "confirmed"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}></div>
                          {getStatusText(reservation.status)}
                        </span>
                      </td>

                      {/* Montant */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                          <DollarSign className="w-4 h-4" />
                          {reservation.totalAmount}€
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {reservation.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleAccept(reservation.id)}
                                disabled={loading}
                                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Confirmer">
                                <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                              <button
                                onClick={() => handleReject(reservation.id)}
                                disabled={loading}
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 group"
                                title="Rejeter">
                                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleView(reservation)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors group"
                            title="Voir détails">
                            <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={() => {
                              setReservationToDelete(reservation.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors group"
                            title="Supprimer">
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // État vide amélioré
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucune réservation trouvée
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Essayez de modifier vos critères de recherche ou créez
                          une nouvelle réservation.
                        </p>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={resetAllFilters}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Réinitialiser les filtres
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Nouvelle réservation
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination améliorée */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Affichage de {(currentPage - 1) * pageSize + 1} à{" "}
                  {Math.min(currentPage * pageSize, reservations.length)} sur{" "}
                  {reservations.length} réservations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors">
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}>
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors">
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de suppression amélioré */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmer la suppression
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cette réservation ? Toutes
                les données associées seront perdues définitivement.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setReservationToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}>
                  Annuler
                </button>
                <button
                  onClick={() =>
                    reservationToDelete && handleDelete(reservationToDelete)
                  }
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de visualisation amélioré */}
      {showViewModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Détails de la réservation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ID: {selectedReservation.id}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedReservation(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Informations client */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Informations client
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Nom complet
                      </div>
                      <div className="text-sm text-gray-900">
                        {selectedReservation.clientFirstName}{" "}
                        {selectedReservation.clientLastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Email
                      </div>
                      <div className="text-sm text-gray-900">
                        {selectedReservation.clientEmail}
                      </div>
                    </div>
                    {selectedReservation.clientPhone && (
                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Téléphone
                        </div>
                        <div className="text-sm text-gray-900">
                          {selectedReservation.clientPhone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Détails de la réservation */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-500" />
                    Détails de la réservation
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Date
                      </div>
                      <div className="text-sm text-gray-900">
                        {selectedReservation.selectedDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Heure
                      </div>
                      <div className="text-sm text-gray-900">
                        {selectedReservation.selectedTime}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Emplacement
                      </div>
                      <div className="text-sm text-gray-900">
                        <LocationDetails booking={selectedReservation} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Montant
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {selectedReservation.totalAmount}€
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-500" />
                  Service
                </h4>
                <ServiceDetails booking={selectedReservation} />
              </div>

              {/* Notes */}
              {selectedReservation.notes && (
                <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" />
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedReservation.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {selectedReservation.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleAccept(selectedReservation.id);
                        setShowViewModal(false);
                        setSelectedReservation(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      disabled={loading}>
                      <Check className="w-4 h-4" />
                      Confirmer
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReservation.id);
                        setShowViewModal(false);
                        setSelectedReservation(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      disabled={loading}>
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
