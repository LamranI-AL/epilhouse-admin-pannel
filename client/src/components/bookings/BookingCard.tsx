/** @format */

// components/BookingCard.tsx
import { getCategoryById } from "@/actions/categories";
import { getServiceById } from "@/actions/services";
import React, { useState, useEffect } from "react";

// Simuler les icônes
const CheckCircle = ({ className }: any) => (
  <div className={`${className} text-green-600`}>✓</div>
);
const XCircle = ({ className }: any) => (
  <div className={`${className} text-red-600`}>✗</div>
);
const Clock = ({ className }: any) => (
  <div className={`${className} text-yellow-600`}>⏰</div>
);
const AlertCircle = ({ className }: any) => (
  <div className={`${className} text-gray-600`}>⚠</div>
);
const RefreshCw = ({ className }: any) => (
  <div className={`${className} text-blue-600`}>↻</div>
);
const Loader = ({ className }: any) => (
  <div className={`${className} text-blue-600`}>⏳</div>
);

// Types
interface ServiceDetail {
  serviceName: string;
  subServiceName: string;
  subServiceDescription?: string;
  price: number;
  duration: number;
  categoryName: string;
  categoryColor: string;
}

interface BookingCardProps {
  booking: any;
  bookingIndex: number;
  onClick: (booking: any) => void;
  //   getServiceById: (serviceId: string) => Promise<any>;
  //   getCategoryById: (categoryId: string) => Promise<any>;
  timeSlot: string;
  HOUR_HEIGHT: number;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  bookingIndex,
  onClick,
  //   getServiceById,
  //   getCategoryById,
  timeSlot,
  HOUR_HEIGHT = 80,
}) => {
  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>([]);
  const [totalDuration, setTotalDuration] = useState(30); // Durée par défaut
  const [loading, setLoading] = useState(true);

  // Calculer la durée totale à partir des détails des services
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!booking?.selectedServices || booking.selectedServices.length === 0) {
        setServiceDetails([]);
        setTotalDuration(30); // Durée par défaut
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const details: ServiceDetail[] = [];
        let duration = 0;

        for (const selectedService of booking.selectedServices) {
          const {
            serviceId,
            subServiceId,
            useDiscountPrice,
            sessionsCount = 1,
          } = selectedService;

          // Récupérer le service
          const serviceResult = await getServiceById(serviceId);

          if (serviceResult.success && serviceResult.service) {
            const service = serviceResult.service;

            // Récupérer la catégorie
            const categoryResult = await getCategoryById(
              service.categoryId as string,
            );
            const category = categoryResult.success
              ? categoryResult.category
              : null;

            // Trouver le sous-service
            const subService = service.subServices?.find(
              (sub: any) => sub.id === subServiceId,
            );

            if (subService) {
              // Déterminer le prix à utiliser
              const price =
                useDiscountPrice && subService.discountPrice
                  ? subService.discountPrice
                  : subService.normalPrice;

              // Calculer la durée totale en tenant compte des sessions
              const serviceDuration =
                (subService.duration || 30) * sessionsCount;
              duration += serviceDuration;

              details.push({
                serviceName: service.name,
                subServiceName: subService.name,
                // subServiceDescription: subService?.description,
                price: price,
                duration: serviceDuration,
                categoryName: category?.name || "Catégorie inconnue",
                categoryColor: category?.color || "#6B7280",
              });
            }
          }
        }

        setServiceDetails(details);
        setTotalDuration(duration || 30); // Durée par défaut si aucun service
      } catch (err) {
        console.error("Erreur lors de la récupération des détails:", err);
        setTotalDuration(30); // Durée par défaut en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [booking, getServiceById, getCategoryById]);

  // Calculer la hauteur en pixels basée sur la durée
  const getBookingHeight = (): number => {
    // Convertir minutes en pixels (1 heure = HOUR_HEIGHT px)
    return Math.max((totalDuration / 60) * HOUR_HEIGHT, 30); // Minimum 30px
  };

  // Calculer la position verticale dans le créneau
  const getBookingTopPosition = (): number => {
    const bookingTime = booking.selectedTime;
    const [bookingHour, bookingMinute] = bookingTime.split(":").map(Number);
    const [slotHour] = timeSlot.split(":").map(Number);

    if (bookingHour === slotHour) {
      // Calculer la position basée sur les minutes
      return (bookingMinute / 60) * HOUR_HEIGHT;
    }
    return 0;
  };

  // Calculer l'heure de fin
  const getEndTime = (): string => {
    const [hour, minute] = booking.selectedTime.split(":").map(Number);
    const endMinutes = hour * 60 + minute + totalDuration;

    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    return `${endHour.toString().padStart(2, "0")}:${endMin
      .toString()
      .padStart(2, "0")}`;
  };

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

  const height = getBookingHeight();
  const topPosition = getBookingTopPosition();

  return (
    <div
      key={booking.id}
      onClick={() => onClick(booking)}
      className={`absolute left-1 right-1 rounded-md cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md ${getStatusColor(
        booking.status,
      )} border p-2 overflow-hidden`}
      style={{
        top: `${topPosition}px`,
        height: `${height}px`,
        minHeight: "30px",
        zIndex: 10 + bookingIndex,
      }}>
      {/* Header avec statut et heure */}
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center space-x-1">
          {getStatusIcon(booking.status)}
          <span className="font-medium">{booking.selectedTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          {booking.isRecurring && <RefreshCw className="w-3 h-3" />}
          {loading && <Loader className="w-3 h-3 animate-spin" />}
        </div>
      </div>

      {/* Nom du client */}
      <div className="text-xs font-semibold truncate">
        {booking.clientFirstName} {booking.clientLastName}
      </div>

      {/* Durée et heure de fin */}
      <div className="text-xs opacity-70 mt-1">
        {totalDuration}min ({booking.selectedTime} - {getEndTime()})
      </div>

      {/* Services (si assez de place) */}
      {height > 60 && serviceDetails.length > 0 && (
        <div className="text-xs opacity-60 mt-1">
          {serviceDetails.length === 1 ? (
            <div className="truncate">{serviceDetails[0].subServiceName}</div>
          ) : (
            <div className="truncate">{serviceDetails.length} services</div>
          )}
        </div>
      )}

      {/* Prix */}
      <div className="text-xs font-medium text-green-600 mt-1">
        {booking.totalAmount}€
      </div>

      {/* Détails des services (si assez de place) */}
      {height > 100 && serviceDetails.length > 0 && (
        <div className="mt-2 space-y-1">
          {serviceDetails.slice(0, 2).map((detail, index) => (
            <div
              key={index}
              className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: detail.categoryColor }}
              />
              <span className="text-xs truncate opacity-75">
                {detail.subServiceName} ({detail.duration}min)
              </span>
            </div>
          ))}
          {serviceDetails.length > 2 && (
            <div className="text-xs opacity-50">
              +{serviceDetails.length - 2} autres...
            </div>
          )}
        </div>
      )}

      {/* Notes (si assez de place) */}
      {height > 120 && booking.notes && (
        <div className="text-xs opacity-50 mt-1 truncate">
          📝 {booking.notes}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
