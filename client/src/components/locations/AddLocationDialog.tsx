/** @format */

// components/locations/AddLocationDialog.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addLocation, getCoordinatesFromAddress } from "@/actions/locations";
import SimpleMap from "@/components/locations/google-map";

interface AddLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLocationDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddLocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    phone: "",
    email: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    location: {
      latitude: 0,
      longitude: 0,
    },
    isActive: true,
    workingHours: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: { start: "10:00", end: "17:00" },
      sunday: null,
    },
  });

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateWorkingHours = (
    day: string,
    field: "start" | "end",
    value: string,
  ) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: formData.workingHours[day as keyof typeof formData.workingHours]
          ? {
              ...formData.workingHours[
                day as keyof typeof formData.workingHours
              ],
              [field]: value,
            }
          : {
              start: field === "start" ? value : "09:00",
              end: field === "end" ? value : "18:00",
            },
      },
    });
  };

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      workingHours: {
        ...formData.workingHours,
        [day]: formData.workingHours[day as keyof typeof formData.workingHours]
          ? null
          : { start: "09:00", end: "18:00" },
      },
    });
  };

  const handleMapSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      coordinates: { lat, lng },
      location: { latitude: lat, longitude: lng },
    });
    setIsMapOpen(false);
    toast({
      title: "Position sélectionnée",
      description: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Géocodage si pas de coordonnées
      if (!formData.coordinates.lat || !formData.coordinates.lng) {
        const coords = await getCoordinatesFromAddress(
          formData.address,
          formData.city,
          formData.country || "France",
        );

        if (coords.success && coords.coordinates) {
          formData.coordinates = coords.coordinates;
          formData.location = {
            latitude: coords.coordinates.lat,
            longitude: coords.coordinates.lng,
          };
        }
      }

      const result = await addLocation({
        ...formData,
        assignedAgents: [],
        assignedServices: [],
      });

      if (result.success) {
        onSuccess();
        onClose();
        toast({
          title: "Succès",
          description: "Location créée avec succès",
        });
        // Reset form
        setFormData({
          name: "",
          address: "",
          city: "",
          postalCode: "",
          country: "France",
          phone: "",
          email: "",
          coordinates: { lat: 0, lng: 0 },
          location: { latitude: 0, longitude: 0 },
          isActive: true,
          workingHours: {
            monday: { start: "09:00", end: "18:00" },
            tuesday: { start: "09:00", end: "18:00" },
            wednesday: { start: "09:00", end: "18:00" },
            thursday: { start: "09:00", end: "18:00" },
            friday: { start: "09:00", end: "18:00" },
            saturday: { start: "10:00", end: "17:00" },
            sunday: null,
          },
        });
      } else {
        toast({ title: "Erreur", description: result.error });
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };

  const dayNames = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouveau centre</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Ville *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Adresse *</Label>
              <Input
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code postal</Label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Pays</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <Label>Position</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMapOpen(true)}>
                  <Map className="h-4 w-4 mr-2" />
                  Sélectionner sur la carte
                </Button>
                {formData.coordinates.lat && formData.coordinates.lng && (
                  <span className="text-sm text-gray-600 py-2">
                    {formData.coordinates.lat.toFixed(6)},{" "}
                    {formData.coordinates.lng.toFixed(6)}
                  </span>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <Label>Horaires de travail</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(dayNames).map(([day, label]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4">
                    <div className="w-20 text-sm">{label}</div>
                    <Switch
                      checked={
                        formData.workingHours[
                          day as keyof typeof formData.workingHours
                        ] !== null
                      }
                      onCheckedChange={() => toggleDay(day)}
                    />
                    {formData.workingHours[
                      day as keyof typeof formData.workingHours
                    ] && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={
                            (
                              formData.workingHours[
                                day as keyof typeof formData.workingHours
                              ] as any
                            )?.start || "09:00"
                          }
                          onChange={(e) =>
                            updateWorkingHours(day, "start", e.target.value)
                          }
                          className="w-24"
                        />
                        <span className="text-sm">à</span>
                        <Input
                          type="time"
                          value={
                            (
                              formData.workingHours[
                                day as keyof typeof formData.workingHours
                              ] as any
                            )?.end || "18:00"
                          }
                          onChange={(e) =>
                            updateWorkingHours(day, "end", e.target.value)
                          }
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked)}
              />
              <Label>Centre actif</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog
        open={isMapOpen}
        onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Sélectionner la position</DialogTitle>
          </DialogHeader>
          <SimpleMap
            onLocationSelect={(position: { lat: number; lng: number }) =>
              handleMapSelect(position.lat, position.lng)
            }
            initialPosition={{
              lat: formData.coordinates.lat || 48.8566,
              lng: formData.coordinates.lng || 2.3522,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// co
