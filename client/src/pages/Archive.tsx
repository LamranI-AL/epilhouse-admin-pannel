/** @format */

import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { getAgentById } from "@/actions/agents";
import {
  getServiceById,
  getSubServiceNamesAndCategories,
} from "@/actions/services";
import { getLocationById } from "@/actions/locations";
import { getAllQuickBookings } from "@/actions/Bookings";

const BookingActivityJournal = () => {
  const [activities, setActivities] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [agentDetails, setAgentDetails] = useState<any>({});
  const [serviceDetails, setServiceDetails] = useState<any>({});
  const [locationDetails, setLocationDetails] = useState<any>({});
  const [subServiceDetails, setSubServiceDetails] = useState<any>({});
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<any>("");
  const [statusFilter, setStatusFilter] = useState<any>("all");

  // Fonction pour récupérer les activités depuis la DB (quickBookings)
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllQuickBookings();

      if (!result.success) {
        throw new Error(
          result.error || "Erreur lors de la récupération des bookings",
        );
      }

      // Transformer les quickBookings en activités avec historique
      const bookingActivities =
        result.quickBookings?.map((booking) => {
          // Déterminer le type d'action basé sur les timestamps
          let action = "create";
          let changes = ["created"];

          if (booking.createdAt && booking.updatedAt) {
            const created = booking.createdAt.toDate
              ? booking.createdAt.toDate()
              : new Date(booking.createdAt);
            const updated = booking.updatedAt.toDate
              ? booking.updatedAt.toDate()
              : new Date(booking.updatedAt);

            if (Math.abs(updated.getTime() - created.getTime()) > 1000) {
              // Plus d'1 seconde de différence
              action = "update";
              changes = ["status", "notes", "selectedServices"]; // Champs probablement modifiés
            }
          }

          return {
            id: `activity_${booking.id}`,
            bookingId: booking.id,
            action: action,
            updatedBy: booking.updatedBy || booking.agent?.id,
            updatedAt: booking.updatedAt,
            createdAt: booking.createdAt,
            changes: changes,
            booking: booking,
          };
        }) || [];

      // Trier par date de mise à jour décroissante
      bookingActivities.sort((a, b) => {
        const dateA = a.updatedAt?.toDate
          ? a.updatedAt.toDate()
          : new Date(a.updatedAt);
        const dateB = b.updatedAt?.toDate
          ? b.updatedAt.toDate()
          : new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });

      setActivities(bookingActivities);
    } catch (err) {
      console.error("Erreur lors de la récupération des activités:", err);
      setError("Impossible de charger les activités. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les détails d'un agent par ID
  const getAgentDetailsById = async (agentId: any) => {
    if (!agentId) return null;

    if (agentDetails[agentId]) {
      return agentDetails[agentId];
    }

    try {
      const result = await getAgentById(agentId);

      if (result.success && result.agent) {
        setAgentDetails((prev: any) => ({
          ...prev,
          [agentId]: result.agent,
        }));
        return result.agent;
      }

      return null;
    } catch (err) {
      console.error(
        `Erreur lors de la récupération de l'agent ${agentId}:`,
        err,
      );
      return null;
    }
  };

  // Fonction pour récupérer les détails d'un service par ID
  const getServiceDetailsById = async (serviceId: any) => {
    if (!serviceId) return null;

    if (serviceDetails[serviceId]) {
      return serviceDetails[serviceId];
    }

    try {
      const result = await getServiceById(serviceId);

      if (result.success && result.service) {
        setServiceDetails((prev: any) => ({
          ...prev,
          [serviceId]: result.service,
        }));
        return result.service;
      }

      return null;
    } catch (err) {
      console.error(
        `Erreur lors de la récupération du service ${serviceId}:`,
        err,
      );
      return null;
    }
  };

  // Fonction pour récupérer les détails d'un lieu par ID
  const getLocationDetailsById = async (locationId: any) => {
    if (!locationId) return null;

    if (locationDetails[locationId]) {
      return locationDetails[locationId];
    }

    try {
      const result = await getLocationById(locationId);

      if (result.success && result.location) {
        setLocationDetails((prev: any) => ({
          ...prev,
          [locationId]: result.location,
        }));
        return result.location;
      }

      return null;
    } catch (err) {
      console.error(
        `Erreur lors de la récupération du lieu ${locationId}:`,
        err,
      );
      return null;
    }
  };

  // Fonction pour récupérer les détails des sous-services
  const getSubServicesDetails = async (selectedServices: any) => {
    if (!selectedServices || selectedServices.length === 0) return [];

    try {
      const subServiceIds = selectedServices
        .map((service: any) => service.subServiceId)
        .filter(Boolean);

      if (subServiceIds.length === 0) return [];

      const result = await getSubServiceNamesAndCategories(subServiceIds);

      if (result && result.success && result.data) {
        // Mettre en cache les résultats
        result.data.forEach((subService: any) => {
          setSubServiceDetails((prev: any) => ({
            ...prev,
            [subService.subServiceId]: subService,
          }));
        });

        return result.data;
      }

      return [];
    } catch (err) {
      console.error("Erreur lors de la récupération des sous-services:", err);
      return [];
    }
  };

  // Pré-charger les détails des agents qui ont fait les mises à jour
  useEffect(() => {
    const loadAgentDetails = async () => {
      const agentIds = [
        ...new Set(
          activities.map((activity) => activity.updatedBy).filter(Boolean),
        ),
      ];

      for (const agentId of agentIds) {
        if (!agentDetails[agentId]) {
          await getAgentDetailsById(agentId);
        }
      }
    };

    if (activities.length > 0) {
      loadAgentDetails();
    }
  }, [activities]);

  // Chargement initial des données
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fonction pour formater les dates
  const formatDate = (date: any) => {
    if (!date) return "N/A";

    let dateObj;
    if (date.toDate && typeof date.toDate === "function") {
      // Timestamp Firestore
      dateObj = date.toDate();
    } else if (date.seconds) {
      // Timestamp Firestore format objet
      dateObj = new Date(date.seconds * 1000);
    } else {
      // Date normale
      dateObj = new Date(date);
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (status: any) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "converted":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur de l'action
  const getActionColor = (action: any) => {
    switch (action?.toLowerCase()) {
      case "create":
      case "created":
        return "bg-green-100 text-green-800";
      case "update":
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "delete":
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le texte du statut en français
  const getStatusText = (status: any) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      case "converted":
        return "Converti";
      default:
        return status || "Inconnu";
    }
  };

  // Fonction pour gérer l'affichage des détails
  const handleViewDetails = async (activity: any) => {
    try {
      setSelectedBooking({ ...activity, loadingDetails: true });

      // Récupérer les détails de l'agent
      const agent = await getAgentDetailsById(
        activity.updatedBy || activity.booking?.agent?.id,
      );

      // Récupérer les détails du lieu
      const location = await getLocationDetailsById(
        activity.booking?.location?.id || activity.booking?.locationId,
      );

      // Récupérer les détails des services principaux
      const servicesPromises =
        activity.booking?.selectedServices?.map((service: any) =>
          getServiceDetailsById(service.serviceId),
        ) || [];
      const services = await Promise.all(servicesPromises);

      // Récupérer les détails des sous-services
      const subServices = await getSubServicesDetails(
        activity.booking?.selectedServices,
      );

      setSelectedBooking({
        ...activity,
        agentDetails: agent,
        servicesDetails: services.filter(Boolean),
        locationDetails: location,
        subServicesDetails: subServices,
        loadingDetails: false,
      });
    } catch (err) {
      console.error("Erreur lors de la récupération des détails:", err);
      setSelectedBooking((prev: any) => ({
        ...prev,
        loadingDetails: false,
        detailsError: true,
      }));
    }
  };

  // Filtrage des activités
  const filteredActivities = activities.filter((activity: any) => {
    const matchesSearch =
      !searchTerm ||
      activity.booking?.clientFirstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.booking?.clientLastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.booking?.clientEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.booking?.client?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.booking?.client?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.booking?.client?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      activity.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      activity.booking?.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Chargement des activités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-red-800">
                Erreur de chargement
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchActivities}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Journal d'Activité des Bookings
        </h1>
        <p className="text-gray-600">
          Traçabilité complète des modifications et mises à jour
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmé</option>
              <option value="pending">En attente</option>
              <option value="cancelled">Annulé</option>
              <option value="converted">Converti</option>
            </select>
          </div>
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des activités */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Activités Récentes ({filteredActivities.length})
              </h2>
            </div>
            {filteredActivities.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune activité trouvée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                              activity.action,
                            )}`}>
                            {activity.action === "create" ||
                            activity.action === "created"
                              ? "Création"
                              : activity.action === "update" ||
                                activity.action === "updated"
                              ? "Mise à jour"
                              : "Suppression"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Booking #
                            {activity.bookingId?.slice(-6) ||
                              activity.id?.slice(-6)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {/* Nom du client */}
                          {(activity.booking?.clientFirstName ||
                            activity.booking?.client?.firstName) && (
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                Client:{" "}
                                {activity.booking?.clientFirstName ||
                                  activity.booking?.client?.firstName}{" "}
                                {activity.booking?.clientLastName ||
                                  activity.booking?.client?.lastName}
                              </span>
                            </div>
                          )}

                          {/* Date et heure */}
                          {activity.booking?.selectedDate && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {activity.booking.selectedDate}{" "}
                                {activity.booking.selectedTime &&
                                  `à ${activity.booking.selectedTime}`}
                              </span>
                            </div>
                          )}

                          {/* Lieu */}
                          {activity.booking?.location?.name && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {activity.booking.location.name}
                              </span>
                            </div>
                          )}

                          {/* Statut */}
                          {activity.booking?.status && (
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(activity.booking.status)}
                              <span className="text-sm">
                                {getStatusText(activity.booking.status)}
                              </span>
                            </div>
                          )}

                          {/* Montant total */}
                          {activity.booking?.totalAmount && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {activity.booking.totalAmount} €
                              </span>
                            </div>
                          )}

                          {/* Nombre de services */}
                          {activity.booking?.selectedServices?.length > 0 && (
                            <div className="text-xs text-purple-600">
                              {activity.booking.selectedServices.length}{" "}
                              service(s) sélectionné(s)
                            </div>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-gray-500">
                          {activity.updatedAt &&
                            `Modifié le ${formatDate(activity.updatedAt)}`}
                          {activity.updatedBy && (
                            <div className="mt-1">
                              Mis à jour par:{" "}
                              {agentDetails[activity.updatedBy]?.firstName ||
                                "Agent"}{" "}
                              {agentDetails[activity.updatedBy]?.lastName ||
                                activity.updatedBy}
                            </div>
                          )}
                        </div>

                        {activity.changes && activity.changes.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600">
                            Champs modifiés: {activity.changes.join(", ")}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewDetails(activity)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Détails du booking sélectionné */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Détails du Booking
                </h3>
                <p className="text-sm text-gray-500">
                  ID: {selectedBooking.bookingId || selectedBooking.id}
                </p>
              </div>

              {selectedBooking.loadingDetails ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Chargement des détails...
                  </p>
                </div>
              ) : (
                <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                  {/* Informations Client */}
                  {(selectedBooking.booking?.client ||
                    selectedBooking.booking?.clientFirstName) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Informations Client
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>
                            {selectedBooking.booking?.client?.firstName ||
                              selectedBooking.booking?.clientFirstName}{" "}
                            {selectedBooking.booking?.client?.lastName ||
                              selectedBooking.booking?.clientLastName}
                          </span>
                        </div>
                        {(selectedBooking.booking?.client?.email ||
                          selectedBooking.booking?.clientEmail) && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>
                              {selectedBooking.booking?.client?.email ||
                                selectedBooking.booking?.clientEmail}
                            </span>
                          </div>
                        )}
                        {(selectedBooking.booking?.client?.phone ||
                          selectedBooking.booking?.clientPhone) && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>
                              {selectedBooking.booking?.client?.phone ||
                                selectedBooking.booking?.clientPhone}
                            </span>
                          </div>
                        )}
                        {selectedBooking.booking?.userId && (
                          <div className="text-xs text-gray-500">
                            ID Utilisateur: {selectedBooking.booking.userId}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Détails Agent */}
                  {selectedBooking.agentDetails && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Agent Responsable
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>
                            {selectedBooking.agentDetails.firstName}{" "}
                            {selectedBooking.agentDetails.lastName}
                          </span>
                        </div>
                        {selectedBooking.agentDetails.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{selectedBooking.agentDetails.email}</span>
                          </div>
                        )}
                        {selectedBooking.agentDetails.role && (
                          <div className="text-xs text-gray-500">
                            Rôle: {selectedBooking.agentDetails.role}
                          </div>
                        )}
                        {selectedBooking.agentDetails.totalBookings && (
                          <div className="text-xs text-gray-500">
                            Réservations totales:{" "}
                            {selectedBooking.agentDetails.totalBookings}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {selectedBooking.booking?.selectedServices &&
                    selectedBooking.booking.selectedServices.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Services Sélectionnés
                        </h4>
                        <div className="space-y-2">
                          {selectedBooking.booking.selectedServices.map(
                            (service: any, index: any) => {
                              const serviceDetail =
                                selectedBooking.servicesDetails?.[index];
                              const subServiceDetail =
                                selectedBooking.subServicesDetails?.find(
                                  (sub: any) =>
                                    sub.subServiceId === service.subServiceId,
                                );

                              return (
                                <div
                                  key={index}
                                  className="text-sm bg-gray-50 p-3 rounded">
                                  <div className="font-medium">
                                    {serviceDetail?.name ||
                                      subServiceDetail?.categoryName ||
                                      `Service ${service.serviceId?.slice(-6)}`}
                                  </div>
                                  {subServiceDetail?.subServiceName && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      Sous-service:{" "}
                                      {subServiceDetail.subServiceName}
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-600 mt-1">
                                    Sessions: {service.sessionsCount || 1}
                                  </div>
                                  {service.dates &&
                                    service.dates.length > 0 &&
                                    service.dates[0] && (
                                      <div className="text-xs text-gray-500">
                                        Date programmée: {service.dates[0]}
                                      </div>
                                    )}
                                  <div className="flex gap-2 mt-1">
                                    {service.useDiscountPrice && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Prix réduit
                                      </span>
                                    )}
                                    {service.usePackagePrice && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                        Prix package
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}

                  {/* Détails de la réservation */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Détails de la Réservation
                    </h4>
                    <div className="space-y-2 text-sm">
                      {selectedBooking.booking?.selectedDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{selectedBooking.booking.selectedDate}</span>
                        </div>
                      )}
                      {selectedBooking.booking?.selectedTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{selectedBooking.booking.selectedTime}</span>
                        </div>
                      )}
                      {selectedBooking.booking?.startTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            Début:{" "}
                            {formatDate(selectedBooking.booking.startTime)}
                          </span>
                        </div>
                      )}
                      {selectedBooking.booking?.endTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            Fin: {formatDate(selectedBooking.booking.endTime)}
                          </span>
                        </div>
                      )}
                      {(selectedBooking.locationDetails?.name ||
                        selectedBooking.booking?.location?.name) && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {selectedBooking.locationDetails?.name ||
                              selectedBooking.booking.location.name}
                          </span>
                          {selectedBooking.locationDetails?.city && (
                            <span className="text-xs text-gray-500">
                              ({selectedBooking.locationDetails.city})
                            </span>
                          )}
                        </div>
                      )}
                      {selectedBooking.booking?.totalAmount && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{selectedBooking.booking.totalAmount} €</span>
                        </div>
                      )}
                      {selectedBooking.booking?.notes && (
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{selectedBooking.booking.notes}</span>
                        </div>
                      )}
                      {selectedBooking.booking?.selectedGender && (
                        <div className="text-xs text-purple-600">
                          Genre sélectionné:{" "}
                          {selectedBooking.booking.selectedGender}
                        </div>
                      )}
                      {selectedBooking.booking?.selectedCategoryId && (
                        <div className="text-xs text-gray-500">
                          Catégorie ID:{" "}
                          {selectedBooking.booking.selectedCategoryId}
                        </div>
                      )}
                      {selectedBooking.booking?.isRecurring !== undefined && (
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              selectedBooking.booking.isRecurring
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                            {selectedBooking.booking.isRecurring
                              ? "Réservation récurrente"
                              : "Réservation unique"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Historique */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Historique
                    </h4>
                    <div className="text-sm space-y-1">
                      {selectedBooking.booking?.createdAt && (
                        <div className="text-xs text-gray-500">
                          Créé le:{" "}
                          {formatDate(selectedBooking.booking.createdAt)}
                        </div>
                      )}
                      {selectedBooking.updatedAt && (
                        <div className="text-xs text-gray-500">
                          Dernière mise à jour:{" "}
                          {formatDate(selectedBooking.updatedAt)}
                        </div>
                      )}
                      {selectedBooking.changes &&
                        selectedBooking.changes.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Champs modifiés:{" "}
                            {selectedBooking.changes.join(", ")}
                          </div>
                        )}
                      {selectedBooking.booking?.status && (
                        <div className="text-xs text-gray-500">
                          Statut actuel:{" "}
                          {getStatusText(selectedBooking.booking.status)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informations techniques */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Informations Techniques
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="text-xs text-gray-500">
                        ID Booking: {selectedBooking.bookingId}
                      </div>
                      {selectedBooking.booking?.locationId && (
                        <div className="text-xs text-gray-500">
                          ID Location: {selectedBooking.booking.locationId}
                        </div>
                      )}
                      {selectedBooking.updatedBy && (
                        <div className="text-xs text-gray-500">
                          Modifié par:{" "}
                          {selectedBooking.agentDetails?.firstName || "Agent"}{" "}
                          {selectedBooking.agentDetails?.lastName ||
                            selectedBooking.updatedBy}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedBooking.detailsError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-xs text-yellow-700">
                        Certains détails n'ont pas pu être chargés
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Sélectionnez une activité pour voir les détails</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingActivityJournal;
