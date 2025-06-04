/** @format */

// components/ServiceDetails.tsx
/** @format */
import React from "react";
import { useServices } from "@/hooks/useServices";

type Props = {
  booking: any;
};
type ServiceItemProps = {
  service: any;
  index: number;
};

const ServiceItem: React.FC<ServiceItemProps> = ({ service, index }) => {
  return (
    <div
      key={index}
      className="service-item">
      <div className="service-icon">
        {/* Vous pouvez ajouter une dic cercle ici */}
        {/* <div className="service-icon-circle bg-slate-300 rounded-full w-10 h-10 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            {service?.name?.charAt(0)}
          </span>
        </div> */}
      </div>
      <span>{service?.name || `Service ${service?.id || index}...`}</span>
    </div>
  );
};

function ServiceDetails({ booking }: Props) {
  const servicess = booking.selectedServices;
  const { services, loading, error } = useServices({ servicess });

  if (loading) {
    return (
      <div>
        <div className="loading">Chargement des services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1">
      {services && services.length > 0 ? (
        services.map((service: any, index: any) => (
          <ServiceItem
            key={service?.id || index}
            service={service}
            index={index}
          />
        ))
      ) : (
        <div>Aucun service spécifié</div>
      )}
    </div>
  );
}

export default ServiceDetails;
