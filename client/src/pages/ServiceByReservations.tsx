/** @format */

// components/ServiceDetails.tsx
import React, { useState, useEffect } from "react";
import { getServiceById } from "@/actions/services";
import { getCategoryById } from "@/actions/categories";
import { Euro, Clock, Tag, AlertCircle, Loader } from "lucide-react";

type Props = {
  booking: any;
};

export interface ServiceDetail {
  serviceName: string;
  subServiceName: string;
  subServiceDescription?: string;
  price: number;
  duration: number;
  categoryName: string;
  categoryColor: string;
}

function ServiceDetails({ booking }: Props) {
  const [serviceDetails, setServiceDetails] = useState<ServiceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!booking?.selectedServices || booking.selectedServices.length === 0) {
        setServiceDetails([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const details: ServiceDetail[] = [];

        for (const selectedService of booking.selectedServices) {
          const { serviceId, subServiceId, useDiscountPrice } = selectedService;

          // Récupérer le service
          const serviceResult = await getServiceById(serviceId);

          if (serviceResult.success && serviceResult.service) {
            const service = serviceResult.service;

            // Récupérer la catégorie
            const categoryResult = await getCategoryById(
              service.categoryId as any,
            );
            const category = categoryResult.success
              ? categoryResult.category
              : null;

            // Trouver le sous-service
            const subService = service.subServices?.find(
              (sub) => sub.id === subServiceId,
            );

            if (subService) {
              // Déterminer le prix à utiliser
              const price =
                useDiscountPrice && subService.discountPrice
                  ? subService.discountPrice
                  : subService.normalPrice;

              details.push({
                serviceName: service.name,
                subServiceName: subService.name,
                subServiceDescription: subService?.description as any,
                price: price,
                duration: subService.duration || 30,
                categoryName: category?.name || "Catégorie inconnue",
                categoryColor: category?.color || "#6B7280",
              });
            }
          }
        }

        setServiceDetails(details);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails:", err);
        setError("Impossible de charger les détails des services");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [booking]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (serviceDetails.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Aucun service spécifié</p>
      </div>
    );
  }

  return (
    <div className="">
      {serviceDetails.map((detail, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Catégorie */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: detail.categoryColor }}
                />
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {detail.categoryName}
                </span>
              </div>

              {/* Service et sous-service */}
              <div className="mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {detail.serviceName}
                </h4>
                <p className="text-gray-700 font-medium">
                  {detail.subServiceName}
                </p>
                {detail.subServiceDescription && (
                  <p className="text-xs text-gray-500 mt-1">
                    {detail.duration}
                  </p>
                )}
              </div>

              {/* Durée */}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{detail.duration} min</span>
              </div>
            </div>

            {/* Prix */}
            <div className="text-right ml-4">
              <div className="text-lg font-bold text-green-600 flex items-center">
                <Euro className="w-4 h-4 mr-1" />
                {detail.price}€
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Total si plusieurs services */}
      {serviceDetails.length > 1 && (
        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <div className="text-xl font-bold text-green-600 flex items-center">
              <Euro className="w-5 h-5 mr-1" />
              {serviceDetails.reduce(
                (total, detail) => total + detail.price,
                0,
              )}
              €
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetails;
