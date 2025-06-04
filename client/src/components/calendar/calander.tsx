/** @format */

// components/CalendarGrid.tsx
import React from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { QuickReservation } from "@/types";
import ServiceDetails from "@/pages/ServiceByReservations";
// import ServiceDetails from";

interface CalendarGridProps {
  weekDays: Date[];
  reservations: QuickReservation[];
  onBookingClick: (booking: QuickReservation) => void;
  getBookingsForDate: (date: Date) => QuickReservation[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  weekDays,
  reservations,
  onBookingClick,
  getBookingsForDate,
}) => {
  // Créneaux horaires de 6h à 23h
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { weekday: "long" });
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6">
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-4 font-semibold text-center text-gray-600 border-r">
            Heure
          </div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-4 text-center border-r last:border-r-0 ${
                isToday(day)
                  ? "bg-blue-100 text-blue-800 font-bold"
                  : "text-gray-700"
              }`}>
              <div className="font-semibold text-sm">
                {getDayName(day).charAt(0).toUpperCase() +
                  getDayName(day).slice(1, 3)}
              </div>
              <div className="text-lg font-bold">{getDateNumber(day)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {getBookingsForDate(day).length} RDV
              </div>
            </div>
          ))}
        </div>

        {/* Créneaux horaires et réservations */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeSlot}
              className="grid grid-cols-8 border-b last:border-b-0">
              {/* Colonne des heures */}
              <div className="p-3 text-xs text-gray-500 border-r bg-gray-50 flex items-center justify-center font-medium">
                {timeSlot}
              </div>

              {/* Colonnes des jours */}
              {weekDays.map((day, dayIndex) => {
                const dayBookings = getBookingsForDate(day);
                const slotBookings = dayBookings.filter((booking) => {
                  const bookingHour = parseInt(
                    booking.selectedTime.split(":")[0],
                  );
                  const slotHour = parseInt(timeSlot.split(":")[0]);
                  return bookingHour === slotHour;
                });

                return (
                  <div
                    key={`${timeSlot}-${dayIndex}`}
                    className={`border-r last:border-r-0 min-h-[80px] p-1 relative ${
                      isToday(day) ? "bg-blue-50/30" : "bg-white"
                    }`}>
                    {slotBookings.map((booking, bookingIndex) => (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick(booking)}
                        className={`absolute left-1 right-1 rounded-md cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md ${getStatusColor(
                          booking.status,
                        )} border p-2 mb-1`}
                        style={{
                          top: `${bookingIndex * 2}px`,
                          minHeight: "70px",
                          zIndex: 10 + bookingIndex,
                        }}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(booking.status)}
                            <span className="font-medium">
                              {booking.selectedTime}
                            </span>
                          </div>
                          {booking.isRecurring && (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </div>
                        <div className="text-xs font-semibold truncate">
                          {booking.clientFirstName} {booking.clientLastName}
                        </div>
                        <div className="text-xs truncate opacity-80 mt-1">
                          <ServiceDetails booking={booking} />
                        </div>
                        <div className="text-xs font-medium text-green-600 mt-1">
                          {booking.totalAmount}€
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
