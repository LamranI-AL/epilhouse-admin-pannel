/** @format */

// hooks/useServices.ts - Hook mis à jour pour les services
import { useState, useEffect } from "react";
import { getAllServices, getServicesByCategory } from "@/actions/services";
import { Service } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useServices = (categoryId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = categoryId
        ? await getServicesByCategory(categoryId)
        : await getAllServices();

      if (result.success) {
        setServices(result.services as any);
      } else {
        setError(result.error || "Erreur inconnue");
        toast({
          title: "Erreur",
          description: result.error || "Impossible de charger les services",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = "Erreur lors du chargement des services";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [categoryId]);

  return {
    services,
    loading,
    error,
    refetch: loadServices,
  };
};
// /** @format */

// // hooks/useServices.ts
// import { useState, useEffect } from "react";
// import { getServiceById } from "@/actions/services";

// type ServiceProps = {
//   servicess: {
//     serviceId: string;
//     name: string;
//     date: string;
//   }[];
// };

// export const useServices = ({ servicess }: ServiceProps) => {
//   const [services, setServices] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   console.log(servicess);
//   console.log(services);

//   useEffect(() => {
//     const fetchServices = async () => {
//       if (!servicess || servicess.length === 0) {
//         setServices([]);
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const servicePromises = servicess.map(async (service) => {
//           const result = await getServiceById(service.serviceId);
//           return result.service;
//         });

//         const fetchedServices = await Promise.all(servicePromises);
//         setServices(fetchedServices);
//       } catch (err) {
//         setError("Erreur lors du chargement des services");
//         console.error("Error fetching services:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, [servicess]);

//   return { services, loading, error };
// };
