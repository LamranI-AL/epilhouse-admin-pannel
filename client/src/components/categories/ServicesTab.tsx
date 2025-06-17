/** @format */

// components/services/ServicesTab.tsx - Onglet des services
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Settings, Eye, Edit, Trash2, Filter } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { Service } from "@/types";
import AddServiceDialog from "../services/AddServiceDialog";
import ViewServiceDialog from "../services/ViewServiceDialog";
import EditServiceDialog from "../services/EditServiceDialog";
import DeleteServiceDialog from "../services/DeleteServiceDialog";

export default function ServicesTab() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const { categories } = useCategories();
  const { services, loading, refetch } = useServices(
    selectedCategoryId === "all" ? undefined : selectedCategoryId,
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Catégorie inconnue";
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || "#6B7280";
  };

  const stats = {
    total: services.length,
    active: services.filter((s) => s.isActive).length,
    totalSubServices: services.reduce(
      (acc, s) => acc + (s.subServices?.length || 0),
      0,
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Services</h3>
          <p className="text-sm text-gray-500">
            Gérez vos services et leurs sous-services
          </p>
        </div>
        <div className="flex gap-3">
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un service
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {selectedCategoryId === "all"
                ? "tous services"
                : "dans cette catégorie"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services Actifs
            </CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
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
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalSubServices}
            </div>
            <p className="text-xs text-muted-foreground">options disponibles</p>
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
              {selectedCategoryId === "all"
                ? "Aucun service trouvé"
                : "Aucun service dans cette catégorie"}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedCategoryId === "all"
                ? "Commencez par créer votre premier service"
                : "Ajoutez des services à cette catégorie"}
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
              className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: getCategoryColor(service.categoryId),
                      }}>
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge
                          className={
                            service.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }>
                          {service.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs">
                          {getCategoryName(service.categoryId)}
                        </Badge>
                      </div>
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
                      {service.subServices?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Sous-services</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {service.subServices && service.subServices.length > 0
                        ? Math.round(
                            service.subServices.reduce(
                              (acc, s) => acc + s.normalPrice,
                              0,
                            ) / service.subServices.length,
                          )
                        : 0}
                      €
                    </div>
                    <div className="text-xs text-gray-600">Prix moyen</div>
                  </div>
                </div>

                {/* Aperçu des sous-services */}
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {service.subServices && service.subServices.length > 0 ? (
                    service.subServices.slice(0, 3).map((subService) => (
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
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-2">
                      Aucun sous-service
                    </div>
                  )}
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
        onSuccess={refetch}
        categories={categories}
      />

      <ViewServiceDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        service={selectedService as any}
        onEdit={handleEditService as any}
        categories={categories}
      />

      <EditServiceDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        service={selectedService}
        onSuccess={refetch}
        categories={categories}
      />

      <DeleteServiceDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        service={selectedService}
        onSuccess={refetch}
      />
    </div>
  );
}
