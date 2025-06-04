/** @format */

// components/services/DeleteServiceDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from "lucide-react";
import { ServiceCategory } from "@/types";

interface DeleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceCategory | null;
  onConfirm: (serviceId: string) => Promise<void>;
  loading?: boolean;
}

export default function DeleteServiceDialog({
  isOpen,
  onClose,
  service,
  onConfirm,
  loading = false,
}: DeleteServiceDialogProps) {
  if (!service) return null;

  const handleConfirm = async () => {
    await onConfirm(service.id);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Supprimer le service
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Cette action ne peut pas être annulée
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: service.color }}>
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-sm text-gray-600">
                  {service.subServices.length} sous-service(s)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">
              Attention - Suppression définitive
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Le service et tous ses sous-services seront supprimés</li>
              <li>• Les tarifs et configurations seront perdus</li>
              <li>• L'historique des réservations sera conservé</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>

          {/* Aperçu des sous-services */}
          {service.subServices.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">
                Sous-services qui seront supprimés :
              </h5>
              <div className="space-y-1">
                {service.subServices.slice(0, 3).map((subService) => (
                  <div
                    key={subService.id}
                    className="flex justify-between text-sm text-yellow-700">
                    <span>{subService.name}</span>
                    <span className="font-medium">
                      {subService.normalPrice}€
                    </span>
                  </div>
                ))}
                {service.subServices.length > 3 && (
                  <div className="text-xs text-yellow-600">
                    +{service.subServices.length - 3} autres sous-services
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <p>
              <strong>Êtes-vous sûr de vouloir supprimer ce service ?</strong>
            </p>
            <p className="mt-1">
              Tapez{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                {service.name}
              </span>{" "}
              pour confirmer la suppression.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}>
              {loading ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
