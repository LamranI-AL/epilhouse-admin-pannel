/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

interface GoogleMapComponentProps {
  onLocationSelect: (position: { lat: number; lng: number }) => void;
  initialPosition?: { lat: number; lng: number } | null;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  onLocationSelect,
  initialPosition,
  height = "400px",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchInput, setSearchInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Position par défaut (Paris)
  const defaultPosition = { lat: 48.8566, lng: 2.3522 };
  const mapCenter = initialPosition || defaultPosition;

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      initializeMap();
    }
  }, [isLoaded]);

  const loadGoogleMaps = () => {
    // Vérifier si Google Maps est déjà chargé
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Attendre que le script se charge
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return;
    }
    const NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "";

    // Charger le script Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error("Erreur lors du chargement de Google Maps");
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);

    // Ajouter un marqueur initial si une position est fournie
    if (initialPosition) {
      const initialMarker = new window.google.maps.Marker({
        position: initialPosition,
        map: mapInstance,
        draggable: true,
        title: "Position sélectionnée",
      });

      setMarker(initialMarker);

      // Écouter le déplacement du marqueur
      initialMarker.addListener("dragend", () => {
        const position = initialMarker.getPosition();
        onLocationSelect({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    }

    // Ajouter un écouteur de clic sur la carte
    mapInstance.addListener("click", (event: any) => {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      // Supprimer l'ancien marqueur s'il existe
      if (marker) {
        marker.setMap(null);
      }

      // Créer un nouveau marqueur
      const newMarker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
        draggable: true,
        title: "Position sélectionnée",
      });

      setMarker(newMarker);

      // Écouter le déplacement du marqueur
      newMarker.addListener("dragend", () => {
        const markerPosition = newMarker.getPosition();
        onLocationSelect({
          lat: markerPosition.lat(),
          lng: markerPosition.lng(),
        });
      });

      onLocationSelect(position);
    });
  };

  const searchLocation = async () => {
    if (!searchInput.trim() || !window.google || !map) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: searchInput }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const position = {
          lat: location.lat(),
          lng: location.lng(),
        };

        // Centrer la carte sur le résultat
        map.setCenter(position);
        map.setZoom(15);

        // Supprimer l'ancien marqueur s'il existe
        if (marker) {
          marker.setMap(null);
        }

        // Créer un nouveau marqueur
        const newMarker = new window.google.maps.Marker({
          position: position,
          map: map,
          draggable: true,
          title: "Position trouvée",
        });

        setMarker(newMarker);

        // Écouter le déplacement du marqueur
        newMarker.addListener("dragend", () => {
          const markerPosition = newMarker.getPosition();
          onLocationSelect({
            lat: markerPosition.lat(),
            lng: markerPosition.lng(),
          });
        });

        onLocationSelect(position);
      } else {
        alert("Adresse non trouvée. Veuillez essayer une autre recherche.");
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchLocation();
    }
  };

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Chargement de Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher une adresse..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          onClick={searchLocation}
          variant="outline">
          <MapPin className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p>
          <strong>Instructions :</strong>
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Cliquez sur la carte pour placer un marqueur</li>
          <li>Faites glisser le marqueur pour ajuster la position</li>
          <li>Utilisez la barre de recherche pour trouver une adresse</li>
        </ul>
      </div>

      {/* Carte */}
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-300"
        style={{ height }}
      />
    </div>
  );
};

export default GoogleMapComponent;
