/** @format */

import { useState, useEffect } from "react";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, User, Shield, ShieldCheck } from "lucide-react";
import { BookingWithDetails } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { getAllQuickBookings } from "@/actions/Bookings";

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    service: "all",
    agent: "all",
    status: "all",
    date: "",
  });
  const { toast } = useToast();
  const { currentUser, userRole, agentData } = useAuth();

  console.log("currentUser", currentUser);
  console.log("userRole", userRole);
  console.log("agentData", agentData);

  // Fonction pour récupérer les bookings selon le rôle et l'agent
  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("🔍 Récupération des réservations...");
      console.log("👤 Current User ID:", currentUser?.uid);
      console.log("🎭 User Role:", userRole);
      console.log("📍 Agent Data:", agentData);

      const result = await getAllQuickBookings();

      if (result.success) {
        let allBookings = result.quickBookings || [];
        console.log("📊 Total réservations récupérées:", allBookings.length);

        // ÉTAPE 1: Filtrage par rôle et location
        if (userRole === "admin" && agentData?.assignedLocationId) {
          console.log(
            "🔒 Admin détecté - Filtrage par location:",
            agentData.assignedLocationId,
          );
          allBookings = allBookings.filter(
            (booking: any) =>
              booking.locationId === agentData.assignedLocationId,
          );
          console.log(
            "📍 Réservations après filtrage location:",
            allBookings.length,
          );
        } else if (userRole === "superAdmin") {
          console.log("👑 SuperAdmin détecté - Pas de filtrage par location");
        } else {
          console.log("❌ Rôle non reconnu ou pas d'assignedLocationId");
        }

        // ÉTAPE 2: Filtrage par agent (currentUser.uid)
        if (currentUser?.uid) {
          console.log("🎯 Filtrage par agent assigné:", currentUser.uid);

          // Filtrer les réservations où agent.id correspond à currentUser.uid
          const agentFilteredBookings = allBookings.filter((booking: any) => {
            const hasAgent = booking.agent && booking.agent.id;
            const isAssignedToCurrentUser =
              hasAgent && booking.agent.id === currentUser.uid;

            console.log(`📋 Booking ${booking.id}:`, {
              hasAgent,
              agentId: booking.agent?.id,
              currentUserId: currentUser.uid,
              isAssigned: isAssignedToCurrentUser,
            });

            return isAssignedToCurrentUser;
          });

          allBookings = agentFilteredBookings;
          console.log(
            "👤 Réservations après filtrage agent:",
            allBookings.length,
          );
        } else {
          console.log("⚠️ Pas de currentUser.uid disponible");
          allBookings = [];
        }

        console.log("✅ Réservations finales:", allBookings);

        // Convertir les données Firebase vers le format BookingWithDetails
        const formattedBookings = await formatBookingsData(allBookings);

        setBookings(formattedBookings);
        setFilteredBookings(formattedBookings);
      } else {
        console.error(
          "❌ Erreur lors de la récupération des bookings:",
          result,
        );
        toast({
          title: "Erreur",
          description: "Impossible de charger les rendez-vous.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Erreur lors du chargement des bookings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour formater les données Firebase vers BookingWithDetails
  const formatBookingsData = async (
    firebaseBookings: any[],
  ): Promise<BookingWithDetails[]> => {
    return firebaseBookings.map((booking, index) => ({
      id: booking.id || index + 1, // Utiliser l'ID réel du booking
      startTime: `${booking.selectedDate}T${booking.selectedTime}:00Z`,
      endTime: `${booking.selectedDate}T${booking.selectedTime}:00Z`, // Vous pouvez calculer l'heure de fin selon la durée du service
      status: booking.status || "pending",
      notes: booking.notes || null,
      totalAmount: booking.totalAmount?.toString() || "0.00",
      service: {
        id: 1,
        name: "Service", // À récupérer depuis la base de données
        color: "blue",
        duration: 30,
      },
      agent: {
        id: booking.agent?.id || 1,
        firstName: booking.agent?.firstName || "Agent",
        lastName: booking.agent?.lastName || "",
        displayName:
          booking.agent?.displayName ||
          `${booking.agent?.firstName || "Agent"} ${
            booking.agent?.lastName || ""
          }`.trim(),
      },
      client: {
        id: 1,
        firstName: booking.clientFirstName || "",
        lastName: booking.clientLastName || "",
        email: booking.clientEmail || "",
        phone: booking.clientPhone || "",
      },
      location: {
        id: 1,
        name: booking.locationId || "Location", // À récupérer depuis la base de données
      },
    }));
  };

  // Charger les bookings au montage du composant et quand les données changent
  useEffect(() => {
    if (
      currentUser?.uid &&
      userRole &&
      (userRole === "superAdmin" ||
        (userRole === "admin" && agentData?.assignedLocationId))
    ) {
      fetchBookings();
    } else if (userRole === "admin" && !agentData?.assignedLocationId) {
      console.log("🚫 Admin sans assignedLocationId - pas de chargement");
      setLoading(false);
      setBookings([]);
      setFilteredBookings([]);
    } else if (!currentUser?.uid) {
      console.log("🚫 Pas de currentUser.uid - pas de chargement");
      setLoading(false);
      setBookings([]);
      setFilteredBookings([]);
    }
  }, [userRole, agentData?.assignedLocationId, currentUser?.uid]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Appliquer les filtres
    let filtered = bookings;

    if (newFilters.service !== "all") {
      filtered = filtered.filter(
        (b) => b.service.id.toString() === newFilters.service,
      );
    }

    if (newFilters.agent !== "all") {
      filtered = filtered.filter(
        (b) => b.agent.id.toString() === newFilters.agent,
      );
    }

    if (newFilters.status !== "all") {
      filtered = filtered.filter((b) => b.status === newFilters.status);
    }

    if (newFilters.date) {
      filtered = filtered.filter(
        (b) =>
          new Date(b.startTime).toISOString().split("T")[0] === newFilters.date,
      );
    }

    setFilteredBookings(filtered);
  };

  const handleEdit = (booking: BookingWithDetails) => {
    console.log("Edit booking:", booking);
    toast({
      title: "Modifier le rendez-vous",
      description: "Fonctionnalité à implémenter",
    });
  };

  const handleDelete = (id: number) => {
    setBookings(bookings.filter((b) => b.id !== id));
    setFilteredBookings(filteredBookings.filter((b) => b.id !== id));
    toast({
      title: "Rendez-vous supprimé",
      description: "Le rendez-vous a été supprimé avec succès.",
    });
  };

  const handleExport = () => {
    const csvData = filteredBookings.map((booking) => ({
      ID: booking.id,
      Client: `${booking.client.firstName} ${booking.client.lastName}`,
      Email: booking.client.email,
      Téléphone: booking.client.phone,
      Date: new Date(booking.startTime).toLocaleDateString("fr-FR"),
      Heure: new Date(booking.startTime).toLocaleTimeString("fr-FR"),
      Agent: booking.agent.displayName,
      Statut: booking.status,
      Total: `${booking.totalAmount}€`,
      Notes: booking.notes || "",
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes_reservations_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export terminé",
      description: "Le fichier CSV a été téléchargé avec succès.",
    });
  };

  // Affichage conditionnel selon le rôle et les permissions
  if (!currentUser?.uid) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-orange-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentification requise
          </h2>
          <p className="text-gray-600">
            Vous devez être connecté pour voir vos rendez-vous.
          </p>
        </div>
      </div>
    );
  }

  if (userRole === "admin" && !agentData?.assignedLocationId) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-orange-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Accès limité
          </h2>
          <p className="text-gray-600">
            Votre compte admin n'est pas encore assigné à une location.
            Contactez un super administrateur pour configurer votre accès.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Chargement de vos rendez-vous assignés...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight flex items-center">
            <User className="w-8 h-8 mr-3 text-teal-600" />
            Mes Rendez-vous Assignés
            {userRole === "admin" && (
              <span className="ml-3 flex items-center text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                <Shield className="w-4 h-4 mr-1" />
                Admin - Id de la centre : {agentData?.assignedLocationId}
              </span>
            )}
            {userRole === "superAdmin" && (
              <span className="ml-3 flex items-center text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Super Admin
              </span>
            )}
          </h2>
          <p className="mt-1 text-gray-600">
            Gérez les rendez-vous qui vous sont assignés en tant que{" "}
            <strong>
              {agentData?.firstName} {agentData?.lastName}
            </strong>
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={handleExport}
            disabled={bookings.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV ({bookings.length})
          </Button>
        </div>
      </div>

      {/* Info Panel avec filtrage détaillé */}
      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations de Filtrage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div className="space-y-1">
              <p>
                <strong>👤 Agent connecté:</strong> {agentData?.firstName}{" "}
                {agentData?.lastName}
              </p>
              <p>
                <strong>🆔 User ID:</strong> {currentUser?.uid}
              </p>
              <p>
                <strong>🎭 Rôle:</strong> {userRole}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <strong>📍 Location assignée:</strong>{" "}
                {agentData?.assignedLocationId || "Aucune"}
              </p>
              <p>
                <strong>📊 Mes réservations:</strong> {bookings.length}
              </p>
              {/* <p>
                <strong>🔍 Filtrage actif:</strong> Agent ID ={" "}
                {currentUser?.uid}
              </p> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message si aucun booking */}
      {bookings.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun rendez-vous assigné
            </h3>
            <p className="text-gray-600 mb-4">
              {userRole === "admin"
                ? "Aucun rendez-vous ne vous est assigné dans votre location pour le moment."
                : "Aucun rendez-vous ne vous est assigné pour le moment."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>
                <strong>Rappel:</strong> Vous ne voyez que les rendez-vous où
                vous êtes explicitement assigné comme agent (agent.id ={" "}
                {currentUser?.uid})
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      {bookings.length > 0 && (
        <BookingsTable
          bookings={filteredBookings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      )}
    </div>
  );
}
