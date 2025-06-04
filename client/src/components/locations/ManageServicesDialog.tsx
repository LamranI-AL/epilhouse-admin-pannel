/** @format */

// components/locations/ManageServicesDialog.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllServices } from "@/actions/services";
import { updateLocation } from "@/actions/locations";

interface ManageServicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location: any;
  onSuccess: () => void;
}

export default function ManageServicesDialog({
  isOpen,
  onClose,
  location,
  onSuccess,
}: ManageServicesDialogProps) {
  const [allServices, setAllServices] = useState<any[]>([]);
  const [assignedServices, setAssignedServices] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && location) {
      loadServices();
    }
  }, [isOpen, location]);

  const loadServices = async () => {
    try {
      const result = await getAllServices();
      if (result.success) {
        setAllServices(result.services || []);
        setAssignedServices(location.assignedServices || []);

        // Filtrer les services disponibles (non assignés)
        const assignedIds = (location.assignedServices || []).map(
          (s: any) => s.id,
        );
        const available = result.services?.filter(
          (service: any) => !assignedIds.includes(service.id),
        );
        setAvailableServices(available || []);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
      });
    }
  };

  const addService = async (service: any) => {
    const newService = {
      id: service.id,
      name: service.name,
      color: service.color,
    };

    const updatedAssigned = [...assignedServices, newService];
    setAssignedServices(updatedAssigned);
    setAvailableServices(availableServices.filter((s) => s.id !== service.id));

    await saveChanges(updatedAssigned);
  };

  const removeService = async (serviceId: string) => {
    const removedService = assignedServices.find((s) => s.id === serviceId);
    const updatedAssigned = assignedServices.filter((s) => s.id !== serviceId);
    setAssignedServices(updatedAssigned);

    if (removedService) {
      const fullService = allServices.find((s) => s.id === serviceId);
      if (fullService) {
        setAvailableServices([...availableServices, fullService]);
      }
    }

    await saveChanges(updatedAssigned);
  };

  const saveChanges = async (updatedServices: any[]) => {
    setLoading(true);
    try {
      const result = await updateLocation(location.id, {
        ...location,
        assignedServices: updatedServices,
      });

      if (result.success) {
        onSuccess();
        toast({
          title: "Succès",
          description: "Services mis à jour",
        });
      } else {
        toast({ title: "Erreur", description: result.error });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableServices = availableServices.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gérer les services - {location?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Services assignés */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Services assignés ({assignedServices.length})
            </h3>
            {assignedServices.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun service assigné</p>
            ) : (
              <div className="space-y-2">
                {assignedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: service.color }}></div>
                      <Settings className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">{service.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(service.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recherche et services disponibles */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Services disponibles ({filteredAvailableServices.length})
            </h3>

            {/* Barre de recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredAvailableServices.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Aucun service trouvé"
                  : "Tous les services sont assignés"}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredAvailableServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: service.color }}></div>
                      <Settings className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addService(service)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
