/** @format */

// components/locations/Locations.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Users,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllLocations, deleteLocation } from "@/actions/locations";
import AddLocationDialog from "@/components/locations/AddLocationDialog";
import ManageAgentsDialog from "@/components/locations/ManageAgentsDialog";
import ManageServicesDialog from "@/components/locations/ManageServicesDialog";

export default function Locations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAgentsDialogOpen, setIsAgentsDialogOpen] = useState(false);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load data
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const result = await getAllLocations();
      if (result.success) {
        setLocations(result.locations as any[]);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les locations",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
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

  const handleManageAgents = (location: any) => {
    setSelectedLocation(location);
    setIsAgentsDialogOpen(true);
  };

  const handleManageServices = (location: any) => {
    setSelectedLocation(location);
    setIsServicesDialogOpen(true);
  };

  if (loading && !locations.length) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Centres</h1>
          <p className="text-gray-600">
            Gérez vos centres et leurs assignations ({locations.length} centres)
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un centre
        </Button>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card
            key={location.id}
            className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Informations de base */}
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>
                  {location.address}, {location.city}
                </span>
              </div>

              {location.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{location.phone}</span>
                </div>
              )}

              {location.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{location.email}</span>
                </div>
              )}

              {/* Horaires de travail */}
              {location.workingHours && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
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

              {/* Assignations */}
              <div className="mt-4 space-y-2">
                {/* Agents */}
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Agents ({location.assignedAgents?.length || 0})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageAgents(location)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 h-8 px-2">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>

                {/* Services */}
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Services ({location.assignedServices?.length || 0})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageServices(location)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-100 h-8 px-2">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Statut et coordonnées */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    location.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {location.isActive ? "Actif" : "Inactif"}
                </span>

                {location.coordinates &&
                  location.coordinates.lat &&
                  location.coordinates.lng && (
                    <span className="text-xs text-gray-500">
                      {location.coordinates.lat.toFixed(4)},{" "}
                      {location.coordinates.lng.toFixed(4)}
                    </span>
                  )}
              </div>

              {/* Aperçu des assignations */}
              {(location.assignedAgents?.length > 0 ||
                location.assignedServices?.length > 0) && (
                <div className="mt-3 pt-3 border-t">
                  {location.assignedAgents?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">
                        Agents assignés:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {location.assignedAgents
                          .slice(0, 2)
                          .map((agent: any) => (
                            <span
                              key={agent.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {agent.displayName ||
                                `${agent.firstName} ${agent.lastName}`}
                            </span>
                          ))}
                        {location.assignedAgents.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{location.assignedAgents.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {location.assignedServices?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Services disponibles:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {location.assignedServices
                          .slice(0, 2)
                          .map((service: any) => (
                            <span
                              key={service.id}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: service.color,
                                }}></div>
                              {service.name}
                            </span>
                          ))}
                        {location.assignedServices.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{location.assignedServices.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {locations.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            Aucun centre trouvé
          </h3>
          <p className="text-gray-500 mb-4">
            Commencez par créer votre premier centre
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un centre
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <AddLocationDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={loadLocations}
      />

      <ManageAgentsDialog
        isOpen={isAgentsDialogOpen}
        onClose={() => setIsAgentsDialogOpen(false)}
        location={selectedLocation}
        onSuccess={loadLocations}
      />

      <ManageServicesDialog
        isOpen={isServicesDialogOpen}
        onClose={() => setIsServicesDialogOpen(false)}
        location={selectedLocation}
        onSuccess={loadLocations}
      />
    </div>
  );
}
