/** @format */

// components/services/ViewServiceDialog.tsx - Compatible avec nouvelle architecture
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Clock,
  Euro,
  Tag,
  Edit,
  Percent,
  FolderOpen,
  Calendar,
} from "lucide-react";
import { Service, Category } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ViewServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onEdit: (service: Service) => void;
  categories: Category[];
}

export default function ViewServiceDialog({
  isOpen,
  onClose,
  service,
  onEdit,
  categories,
}: ViewServiceDialogProps) {
  if (!service) return null;

  const getCategory = () => {
    return categories.find((cat) => cat.id === service.categoryId);
  };

  const category = getCategory();
  const displayColor = service.color || category?.color || "#3B82F6";
  const activeSubServices =
    service.subServices?.filter((sub) => sub.isActive) || [];
  const avgPrice =
    service.subServices?.length > 0
      ? Math.round(
          service.subServices.reduce((acc, s) => acc + s.normalPrice, 0) /
            service.subServices.length,
        )
      : 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: displayColor }}>
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span>{service.name}</span>
            </DialogTitle>
            <Button
              variant="outline"
              onClick={() => onEdit(service)}
              className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la catégorie et statut */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm text-gray-600">Catégorie:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {category && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="font-medium">
                      {category?.name || "Catégorie supprimée"}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                className={
                  service.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }>
                {service.isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {avgPrice}€
                </div>
                <div className="text-sm text-gray-600">Prix moyen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {service.subServices?.reduce(
                    (acc, s) => acc + (s.duration || 0),
                    0,
                  ) || 0}
                  min
                </div>
                <div className="text-sm text-gray-600">Durée totale</div>
              </div>
            </div>

            {/* Description si disponible */}
            {service.description && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-700">{service.description}</p>
              </div>
            )}

            {/* Dates de création et modification */}
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Créé le</h4>
                <p className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {/* {format(service.createdAt, "dd/MM/yyyy à HH:mm", {
                    locale: fr,
                  })} */}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Modifié le</h4>
                <p className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {/* {format(service.updatedAt, "dd/MM/yyyy à HH:mm", {
                    locale: fr,
                  })} */}
                </p>
              </div>
            </div>
          </div>

          {/* Liste détaillée des sous-services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-purple-500" />
              Sous-services et Tarification
            </h3>

            {service.subServices && service.subServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {service.subServices.map((subService, index) => (
                  <div
                    key={subService.id}
                    className={`bg-white border rounded-lg p-4 transition-all ${
                      subService.isActive
                        ? "border-gray-200 hover:shadow-md"
                        : "border-gray-100 bg-gray-50 opacity-75"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {subService.name}
                          </h4>
                          <Badge
                            className={
                              subService.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }>
                            {subService.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>

                        {subService.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {subService.description}
                          </p>
                        )}

                        <div className="flex items-center space-x-4">
                          {/* Durée */}
                          <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {subService.duration} min
                            </span>
                          </div>

                          {/* Prix normal */}
                          <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
                            <Euro className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-700">
                              {subService.normalPrice}€
                            </span>
                          </div>

                          {/* Prix promotionnel si disponible */}
                          {subService.discountPrice && (
                            <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full">
                              <Percent className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-700">
                                {subService.discountPrice}€
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Calcul d'économie si prix promo */}
                        {subService.discountPrice && (
                          <div className="mt-2">
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                              Économie:{" "}
                              {subService.normalPrice -
                                subService.discountPrice}
                              € (
                              {Math.round(
                                ((subService.normalPrice -
                                  subService.discountPrice) /
                                  subService.normalPrice) *
                                  100,
                              )}
                              %)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Aucun sous-service configuré</p>
                <p className="text-sm text-gray-400">
                  Cliquez sur "Modifier" pour ajouter des sous-services
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
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
