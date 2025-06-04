/** @format */

// hooks/useLocation.ts
/** @format */

import { useState, useEffect } from "react";
import { getLocationById } from "@/actions/locations"; // Assuming this function exists

type LocationProps = {
  locationId: string;
};

export const useLocation = ({ locationId }: LocationProps) => {
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("LocationId:", locationId);
  console.log("Location:", location);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) {
        setLocation(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getLocationById(locationId);
        setLocation(result.location || result); // Handle different response formats
      } catch (err) {
        setError("Erreur lors du chargement de la location");
        console.error("Error fetching location:", err);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  return { location, loading, error };
};
