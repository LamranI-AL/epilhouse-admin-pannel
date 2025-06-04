/** @format */

// components/services/Services.tsx - Composant principal mis à jour
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Settings,
  Euro,
  Clock,
  Eye,
  Edit,
  Trash2,
  Tag,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  addService,
  deleteService,
  getAllServices,
  updateService,
} from "@/actions/services";
import { ServiceCategory } from "@/types";
import AddServiceDialog from "@/components/services/AddServiceDialog";
import ViewServiceDialog from "@/components/services/ViewServiceDialog";
import EditServiceDialog from "@/components/services/EditServiceDialog";
import DeleteServiceDialog from "@/components/services/DeleteServiceDialog";

export default function Services() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [selectedService, setSelectedService] =
    useState<ServiceCategory | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Charger tous les services
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getAllServices();
      if (data.success) {
        setServices(data.services as unknown as ServiceCategory[]);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actions des dialogs
  const handleViewService = (service: ServiceCategory) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const handleEditService = (service: ServiceCategory) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteService = (service: ServiceCategory) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  // Confirmation de suppression
  const handleDeleteConfirm = async (serviceId: string) => {
    try {
      await deleteService(serviceId);
      toast({
        title: "Service supprimé",
        description: "Le service a été supprimé avec succès.",
      });
      await loadServices();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le service.",
        variant: "destructive",
      });
    }
  };

  // Statistiques

  const stats = {
    total: services.length,

    active: services.filter((s) => s.isActive).length,
    // verifier si subServices est un tableau et aussi existant
    totalSubServices: services.reduce((acc, s) => {
      if (Array.isArray(s.subServices) && s.subServices.length > 0) {
        return acc + s.subServices.length;
      }
      return acc;
    }, 0),

    avgPrice: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Services
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos services et leurs tarifs
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un service
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Services
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              services disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Actifs
            </CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">services en ligne</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sous-services</CardTitle>
            <Tag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalSubServices}
            </div>
            <p className="text-xs text-muted-foreground">options disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prix Moyen</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.avgPrice}€
            </div>
            <p className="text-xs text-muted-foreground">prix moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Grille des services */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun service trouvé
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre premier service
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: service.color }}>
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge
                        className={
                          service.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }>
                        {service.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewService(service)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">
                      {service.subServices && service.subServices.length > 0
                        ? service.subServices.length
                        : 0}
                    </div>
                    <div className="text-xs text-gray-600">Sous-services</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {/* {Math.min(
                        ...service.subServices.map((s) => s.normalPrice),
                      )}{" "}
                      -{" "}
                      {Math.max(
                        ...service.subServices.map((s) => s.normalPrice),
                      )} */}
                      {service.subServices && service.subServices.length > 0
                        ? service.subServices.reduce(
                            (acc, s) => acc + s.normalPrice,
                            0,
                          ) / service.subServices.length
                        : 0}
                    </div>
                    <div className="text-xs text-gray-600">Prix</div>
                  </div>
                </div>

                {/* Aperçu des sous-services */}
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {service.subServices && service.subServices.length > 0
                    ? service.subServices.slice(0, 3).map((subService) => (
                        <div
                          key={subService.id}
                          className="flex justify-between items-center text-sm bg-white border rounded p-2">
                          <span className="font-medium">{subService.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">
                              {subService.normalPrice}€
                            </span>
                            {subService.discountPrice && (
                              <span className="text-orange-600 text-xs">
                                ({subService.discountPrice}€)
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    : null}
                  {service.subServices && service.subServices.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{service.subServices.length - 3} autres sous-services
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddServiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={loadServices}
      />

      <ViewServiceDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        service={selectedService}
        onEdit={handleEditService}
      />

      <EditServiceDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        service={selectedService}
        onSuccess={loadServices}
      />

      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        service={selectedService}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </div>
  );
}
