/** @format */

// components/BookingCalendar.tsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { QuickReservation } from "@/types";
import { useBooking } from "@/hooks/use-booking";
import { updateBookingStatus, deleteQuickBooking } from "@/actions/Bookings";

import BookingModal from "@/components/calendar/BookingModal";
import CalendarGrid from "@/components/calendar/calander";
import WeekStats from "@/components/calendar/WeekStats";

const BookingCalendar = () => {
  const { quickBookings } = useBooking();

  // State pour les données
  const [reservations, setReservations] = useState<QuickReservation[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] =
    useState<QuickReservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    if (quickBookings) {
      setReservations(quickBookings);
    }
  }, [quickBookings]);

  // Fonctions utilitaires pour le calendrier
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi = premier jour
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return reservations.filter((booking) => booking.selectedDate === dateStr);
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = getWeekDays(weekStart);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  // Actions sur les réservations
  const handleAccept = async (id: string) => {
    setLoading(true);
    try {
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
      setShowModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = (booking: QuickReservation) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getMonthYear = () => {
    return currentDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                Calendrier des Réservations
              </h1>
              <p className="text-blue-100">Vue hebdomadaire des rendez-vous</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Semaine précédente">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <div className="text-lg font-semibold">{getMonthYear()}</div>
                <div className="text-sm text-blue-100">
                  {weekDays[0].getDate()} - {weekDays[6].getDate()}
                </div>
              </div>
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Semaine suivante">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grille du calendrier */}
        <CalendarGrid
          weekDays={weekDays}
          reservations={reservations}
          onBookingClick={handleBookingClick}
          getBookingsForDate={getBookingsForDate}
        />

        {/* Statistiques de la semaine */}
        <WeekStats
          weekDays={weekDays}
          getBookingsForDate={getBookingsForDate}
        />
      </div>

      {/* Modal de détails */}
      {showModal && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setShowModal(false)}
          onAccept={handleAccept}
          onReject={handleReject}
          onDelete={handleDelete}
          loading={loading}
        />
      )}
    </div>
  );
};

export default BookingCalendar;
