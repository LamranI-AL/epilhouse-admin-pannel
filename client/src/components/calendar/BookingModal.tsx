/** @format */

// components/BookingModal.tsx
import React from "react";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { QuickReservation } from "@/types";
// import ServiceDetails from "./ServiceByReservations";
import ServiceDetails from "@/pages/ServiceByReservations";
import LocationDetails from "@/components/location/detailsById";
import { useAuth } from "@/providers/auth-provider";

interface BookingModalProps {
  booking: QuickReservation;
  onClose: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({
  booking,
  onClose,
  onAccept,
  onReject,
  onDelete,
  loading,
}) => {
  const { currentUser, logout, userRole, agentData } = useAuth();
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
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmé";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header du modal */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Détails de la réservation</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu du modal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations client */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Informations client
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.clientFirstName} {booking.clientLastName}
                    </div>
                    <div className="text-sm text-gray-500">Nom complet</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.clientEmail}
                    </div>
                    <div className="text-sm text-gray-500">Email</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.clientPhone}
                    </div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations réservation */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                Détails de la réservation
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(booking.selectedDate).toLocaleDateString(
                        "fr-FR",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Date du rendez-vous
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {booking.selectedTime}
                    </div>
                    <div className="text-sm text-gray-500">
                      Heure du rendez-vous
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      <LocationDetails booking={booking} />
                    </div>
                    <div className="text-sm text-gray-500">Localisation</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      <ServiceDetails booking={booking} />
                    </div>
                    <div className="text-sm text-gray-500">Service</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-green-600 text-lg">
                      {booking.totalAmount}€
                    </div>
                    <div className="text-sm text-gray-500">Montant total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statut et informations supplémentaires */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(booking.status)}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    booking.status,
                  )}`}>
                  {getStatusText(booking.status)}
                </span>
                {booking.isRecurring && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-sm">Récurrent</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Notes:
                </h5>
                <p className="text-yellow-700">{booking.notes}</p>
              </div>
            )}
          </div>
          {userRole === "superAdmin" && (
            <div className="mt-6 flex justify-end space-x-3">
              {booking.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      onAccept(booking.id);
                      onClose();
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => {
                      onReject(booking.id);
                      onClose();
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center disabled:opacity-50">
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(booking.id)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
