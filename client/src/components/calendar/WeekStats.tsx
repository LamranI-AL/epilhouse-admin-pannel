/** @format */

// components/WeekStats.tsx
import React from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import { QuickReservation } from "@/types";

interface WeekStatsProps {
  weekDays: Date[];
  getBookingsForDate: (date: Date) => QuickReservation[];
}

const WeekStats: React.FC<WeekStatsProps> = ({
  weekDays,
  getBookingsForDate,
}) => {
  // Calculer les statistiques de la semaine
  const weekStats = {
    total: weekDays.reduce(
      (sum, day) => sum + getBookingsForDate(day).length,
      0,
    ),
    confirmed: weekDays.reduce(
      (sum, day) =>
        sum +
        getBookingsForDate(day).filter((b) => b.status === "confirmed").length,
      0,
    ),
    pending: weekDays.reduce(
      (sum, day) =>
        sum +
        getBookingsForDate(day).filter((b) => b.status === "pending").length,
      0,
    ),
    cancelled: weekDays.reduce(
      (sum, day) =>
        sum +
        getBookingsForDate(day).filter((b) => b.status === "cancelled").length,
      0,
    ),
    revenue: weekDays.reduce(
      (sum, day) =>
        sum +
        getBookingsForDate(day)
          .filter((b) => b.status === "confirmed")
          .reduce((total, b) => total + b.totalAmount, 0),
      0,
    ),
  };

  return (
    <div className="px-6 py-4 border-t bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Statistiques de la semaine
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {weekStats.total}
              </div>
              <div className="text-sm text-gray-600">Total RDV</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {weekStats.confirmed}
              </div>
              <div className="text-sm text-gray-600">Confirmés</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {weekStats.pending}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-600">
                {weekStats.cancelled}
              </div>
              <div className="text-sm text-gray-600">Annulés</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {weekStats.revenue}€
              </div>
              <div className="text-sm text-gray-600">Revenus</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekStats;
