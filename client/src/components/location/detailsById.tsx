/** @format */

// components/LocationDetails.tsx
/** @format */

import React from "react";
import { useLocation } from "@/hooks/useLocation";
import { MapPin, Building } from "lucide-react";

type Props = {
  booking: any;
};

type LocationItemProps = {
  location: any;
};

const LocationItem: React.FC<LocationItemProps> = ({ location }) => {
  return (
    <div className="location-item flex items-center space-x-3">
      <div className="location-icon"></div>
      <div className="location-info">
        <div className="font-medium text-sm">
          {location?.name || `Location ${location?.id}...`}
        </div>
        {location?.address && (
          <div className="text-xs text-gray-500 flex items-center">
            <Building className="w-3 h-3 mr-1" />
            {location.address}
          </div>
        )}
      </div>
    </div>
  );
};

function LocationDetails({ booking }: Props) {
  const locationId = booking.locationId;
  const { location, loading, error } = useLocation({ locationId });

  if (loading) {
    return (
      <div>
        <div className="loading flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span>Chargement de la location...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="error text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1">
      {location ? (
        <LocationItem location={location} />
      ) : (
        <div className="text-gray-500 text-sm">Aucune location spécifiée</div>
      )}
    </div>
  );
}

export default LocationDetails;
