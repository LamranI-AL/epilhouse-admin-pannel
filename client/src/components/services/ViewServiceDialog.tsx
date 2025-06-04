/** @format */

// components/services/ViewServiceDialog.tsx
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
  X,
  Zap,
  Percent,
} from "lucide-react";
import { ServiceCategory } from "@/types";

interface ViewServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceCategory | null;
  onEdit: (service: ServiceCategory) => void;
}

export default function ViewServiceDialog({
  isOpen,
  onClose,
  service,
  onEdit,
}: ViewServiceDialogProps) {
  if (!service) return null;

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
                style={{ backgroundColor: service.color }}>
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
          {/* Informations générales */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {service.subServices.length}
                </div>
                <div className="text-sm text-gray-600">Sous-services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.min(...service.subServices.map((s) => s.normalPrice))} -{" "}
                  {Math.max(...service.subServices.map((s) => s.normalPrice))}€
                </div>
                <div className="text-sm text-gray-600">Gamme de prix</div>
              </div>
              <div className="text-center">
                <Badge
                  className={
                    service.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }>
                  {service.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
            {service.description && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-gray-700">{service.description}</p>
              </div>
            )}
          </div>

          {/* Sous-services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-5 h-5 mr-2 text-purple-500" />
              Sous-services et Tarifs
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {service.subServices.map((subService) => (
                <div
                  key={subService.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {subService.name}
                      </h4>
                      {subService.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {subService.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Durée */}
                      <div className="flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {subService.duration} min
                        </span>
                      </div>

                      {/* Prix */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-full">
                            <Euro className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-700">
                              {subService.normalPrice}€
                            </span>
                          </div>

                          {subService.discountPrice && (
                            <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1 rounded-full">
                              <Percent className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-700">
                                {subService.discountPrice}€
                              </span>
                            </div>
                          )}
                        </div>

                        {subService.discountPrice && (
                          <div className="text-xs text-gray-500 mt-1">
                            Économie:{" "}
                            {subService.normalPrice - subService.discountPrice}€
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
