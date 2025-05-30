/** @format */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, MapPin, Phone, Mail, Edit, Trash2, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllLocations,
  addLocation,
  updateLocation,
  deleteLocation,
  getCoordinatesFromAddress,
} from "@/actions/locations";
import { getAllAgents } from "@/actions/agents";
import { getAllServices } from "@/actions/services";
import SimpleMap from "@/components/locations/google-map";

export default function Locations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state - CORRIGÉ: Structure cohérente des coordonnées
  const [formData, setFormData] = useState<any>({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    phone: "",
    email: "",
    // CORRIGÉ: Utiliser la même structure que Firebase
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
    assignedAgents: [],
    assignedServices: [],
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [locationsRes, agentsRes, servicesRes] = await Promise.all([
        getAllLocations(),
        getAllAgents(),
        getAllServices(),
      ]);

      if (locationsRes.success) setLocations(locationsRes.locations as any);
      if (agentsRes.success) setAgents(agentsRes.agents as any);
      if (servicesRes.success) setServices(servicesRes.services as any);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleCreate = () => {
    setSelectedLocation(null);
    setFormData({
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
      assignedAgents: [],
      assignedServices: [],
    });
    setIsFormOpen(true);
  };

  const handleEdit = (location: any) => {
    setSelectedLocation(location);
    // CORRIGÉ: S'assurer que la structure est cohérente
    const editData = {
      ...location,
      coordinates: location.coordinates || { lat: 0, lng: 0 },
      location: location.location || {
        latitude: location.coordinates?.lat || 0,
        longitude: location.coordinates?.lng || 0,
      },
    };
    setFormData(editData);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette location ?")) return;

    const result = await deleteLocation(id);
    if (result.success) {
      setLocations(locations.filter((l) => l.id !== id));
      toast({ title: "Succès", description: "Location supprimée" });
    } else {
      toast({ title: "Erreur", description: result.error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // CORRIGÉ: Géocodage avec structure cohérente
      if (!formData.coordinates.lat || !formData.coordinates.lng) {
        const coords = await getCoordinatesFromAddress(
          formData.address,
          formData.city,
          formData.country || "France",
        );

        if (coords.success && coords.coordinates) {
          formData.coordinates = coords.coordinates;
          formData.location = coords.coordinates.lat;
        }
      }

      // CORRIGÉ: Mapper les agents et services correctement
      const dataToSend = {
        ...formData,
        assignedAgents:
          formData.assignedAgents
            ?.map((agentId: string) => {
              const agent = agents.find((a) => a.id === agentId);
              return agent
                ? {
                    id: agent.id,
                    firstName: agent.firstName,
                    lastName: agent.lastName,
                    displayName: agent.displayName,
                  }
                : null;
            })
            .filter(Boolean) || [],
        assignedServices:
          formData.assignedServices
            ?.map((serviceId: string) => {
              const service = services.find((s) => s.id === serviceId);
              return service
                ? {
                    id: service.id,
                    name: service.name,
                    color: service.color,
                  }
                : null;
            })
            .filter(Boolean) || [],
      };

      const result = selectedLocation
        ? await updateLocation(selectedLocation.id!, dataToSend)
        : await addLocation(dataToSend);

      if (result.success) {
        await loadData();
        setIsFormOpen(false);
        toast({
          title: "Succès",
          description: selectedLocation
            ? "Location modifiée"
            : "Location créée",
        });
      } else {
        toast({ title: "Erreur", description: result.error });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue" });
    } finally {
      setLoading(false);
    }
  };

  // CORRIGÉ: Fonction de sélection sur la carte
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

  const updateField = (field: keyof any, value: any) => {
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
        [day]: formData.workingHours?.[day]
          ? { ...formData.workingHours[day], [field]: value }
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
        [day]: formData.workingHours?.[day]
          ? null
          : { start: "09:00", end: "18:00" },
      },
    });
  };

  const toggleAgent = (agentId: string) => {
    const current = formData.assignedAgents || [];
    const updated = current.includes(agentId)
      ? current.filter((id: any) => id !== agentId)
      : [...current, agentId];
    setFormData({ ...formData, assignedAgents: updated });
  };

  const toggleService = (serviceId: string) => {
    const current = formData.assignedServices || [];
    const updated = current.includes(serviceId)
      ? current.filter((id: any) => id !== serviceId)
      : [...current, serviceId];
    setFormData({ ...formData, assignedServices: updated });
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

  if (loading && !locations.length) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Centres</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {location.address}, {location.city}
                </span>
              </div>
              {location.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{location.phone}</span>
                </div>
              )}
              {location.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{location.email}</span>
                </div>
              )}

              {/* CORRIGÉ: Affichage des heures de travail */}
              {location.workingHours && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">
                    Horaires:
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    {Object.entries(location.workingHours).map(
                      ([day, hours]) => {
                        const dayLabels: any = {
                          monday: "Lun",
                          tuesday: "Mar",
                          wednesday: "Mer",
                          thursday: "Jeu",
                          friday: "Ven",
                          saturday: "Sam",
                          sunday: "Dim",
                        };

                        return hours ? (
                          <div
                            key={day}
                            className="flex justify-between">
                            <span>{dayLabels[day]}</span>
                            <span>
                              {(hours as any).start} - {(hours as any).end}
                            </span>
                          </div>
                        ) : null;
                      },
                    )}
                  </div>
                </div>
              )}

              {/* CORRIGÉ: Affichage des assignations */}
              <div className="mt-3">
                {location.assignedAgents?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Agents:{" "}
                    </span>
                    <span className="text-xs text-gray-600">
                      {location.assignedAgents.length} assigné(s)
                    </span>
                  </div>
                )}
                {location.assignedServices?.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-700">
                      Services:{" "}
                    </span>
                    <span className="text-xs text-gray-600">
                      {location.assignedServices.length} disponible(s)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    location.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {location.isActive ? "Actif" : "Inactif"}
                </span>
                {/* CORRIGÉ: Affichage des coordonnées */}
                {location.coordinates &&
                  location.coordinates.lat &&
                  location.coordinates.lng && (
                    <span className="text-xs text-gray-500">
                      {location.coordinates.lat.toFixed(4)},{" "}
                      {location.coordinates.lng.toFixed(4)}
                    </span>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLocation ? "Modifier" : "Créer"} un centre
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Ville</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Adresse</Label>
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

            {/* Location */}
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
              <Label>Horaires</Label>
              <div className="space-y-2 mt-1">
                {Object.entries(dayNames).map(([day, label]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4">
                    <div className="w-20 text-sm">{label}</div>
                    <Switch
                      checked={formData.workingHours?.[day] !== null}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    {formData.workingHours?.[day] && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.workingHours[day]?.start || "09:00"}
                          onChange={(e) =>
                            updateWorkingHours(day, "start", e.target.value)
                          }
                          className="w-24"
                        />
                        <span className="text-sm">à</span>
                        <Input
                          type="time"
                          value={formData.workingHours[day]?.end || "18:00"}
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

            {/* Agents */}
            <div>
              <Label>Agents</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedAgents?.includes(agent.id) || false
                      }
                      onChange={() => toggleAgent(agent.id)}
                    />
                    {agent.displayName ||
                      `${agent.firstName} ${agent.lastName}`}
                  </label>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <Label>Services</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        formData.assignedServices?.includes(service.id) || false
                      }
                      onChange={() => toggleService(service.id)}
                    />
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: service.color }}></div>
                    {service.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked: any) =>
                  updateField("isActive", checked)
                }
              />
              <Label>Centre actif</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}>
                {loading
                  ? "En cours..."
                  : selectedLocation
                  ? "Modifier"
                  : "Créer"}
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
    </div>
  );
}
