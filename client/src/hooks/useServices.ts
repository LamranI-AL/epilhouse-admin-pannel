/** @format */

// hooks/useServices.ts
import { useState, useEffect } from "react";
import { getServiceById } from "@/actions/services";

type ServiceProps = {
  servicess: {
    serviceId: string;
    name: string;
    date: string;
  }[];
};

export const useServices = ({ servicess }: ServiceProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(servicess);
  console.log(services);

  useEffect(() => {
    const fetchServices = async () => {
      if (!servicess || servicess.length === 0) {
        setServices([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const servicePromises = servicess.map(async (service) => {
          const result = await getServiceById(service.serviceId);
          return result.service;
        });

        const fetchedServices = await Promise.all(servicePromises);
        setServices(fetchedServices);
      } catch (err) {
        setError("Erreur lors du chargement des services");
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [servicess]);

  return { services, loading, error };
};
