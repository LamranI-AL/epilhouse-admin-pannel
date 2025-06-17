/** @format */

// components/services/DeleteServiceDialog.tsx - Version ajustée et améliorée
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Settings,
  FolderOpen,
  Clock,
  Euro,
  Trash2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteService } from "@/actions/services";
import { Service, Category } from "@/types";

interface DeleteServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onSuccess: () => void;
  categories?: Category[];
}

export default function DeleteServiceDialog({
  isOpen,
  onClose,
  service,
  onSuccess,
  categories = [],
}: DeleteServiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<"warning" | "confirmation">("warning");
  const { toast } = useToast();

  if (!service) return null;

  const getCategory = () => {
    return categories.find((cat) => cat.id === service.categoryId);
  };

  const category = getCategory();
  const displayColor = service.color || category?.color || "#3B82F6";
  const isConfirmationValid =
    confirmationText.toLowerCase() === service.name.toLowerCase();
  const activeSubServices =
    service.subServices?.filter((sub) => sub.isActive) || [];
  const totalValue =
    service.subServices?.reduce((acc, sub) => acc + sub.normalPrice, 0) || 0;

  const handleConfirm = async () => {
    if (step === "warning") {
      setStep("confirmation");
      return;
    }

    if (!isConfirmationValid) {
      toast({
        title: "Erreur de confirmation",
        description: "Le nom du service ne correspond pas exactement",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await deleteService(service.id);

      if (result.success) {
        toast({
          title: "Service supprimé",
          description: `"${service.name}" a été supprimé avec succès`,
        });
        onSuccess();
        handleClose();
      } else {
        toast({
          title: "Erreur de suppression",
          description: result.error || "Impossible de supprimer le service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur système",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    setStep("warning");
    onClose();
  };

  const handleBack = () => {
    setStep("warning");
    setConfirmationText("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg text-red-900">
                {step === "warning"
                  ? "Supprimer le service"
                  : "Confirmation de suppression"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {step === "warning"
                  ? "Vérifiez les informations avant de continuer"
                  : "Tapez le nom exact pour confirmer"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informations du service */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-start space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: displayColor }}>
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {service.name}
                </h4>

                <div className="flex items-center gap-2 mt-1">
                  <FolderOpen className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">
                    {category?.name || "Catégorie supprimée"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">
                      {service.subServices?.length || 0}
                    </div>
                    <div className="text-gray-500">Sous-services</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {activeSubServices.length}
                    </div>
                    <div className="text-gray-500">Actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      {totalValue}€
                    </div>
                    <div className="text-gray-500">Valeur totale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {step === "warning" && (
            <>
              {/* Avertissement principal */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Attention :</strong> Cette action est irréversible et
                  supprimera définitivement le service ainsi que tous ses
                  sous-services.
                </AlertDescription>
              </Alert>

              {/* Détails des sous-services si existants */}
              {service.subServices && service.subServices.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Sous-services qui seront supprimés
                  </h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {service.subServices.map((subService) => (
                      <div
                        key={subService.id}
                        className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {subService.name}
                          </span>
                          {!subService.isActive && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                              Inactif
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {subService.duration}min
                          </div>
                          <div className="flex items-center gap-1 font-medium">
                            <Euro className="w-3 h-3" />
                            {subService.normalPrice}€
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact de la suppression */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">
                  Impact de la suppression
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ L'historique des réservations sera conservé</li>
                  <li>
                    ✓ Les clients pourront toujours voir leurs anciens
                    rendez-vous
                  </li>
                  <li>
                    ✗ Le service ne sera plus disponible pour de nouvelles
                    réservations
                  </li>
                  <li>✗ Toutes les configurations et tarifs seront perdus</li>
                </ul>
              </div>
            </>
          )}

          {step === "confirmation" && (
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Dernière étape :</strong> Tapez exactement le nom du
                  service pour confirmer la suppression.
                </AlertDescription>
              </Alert>

              <div>
                <Label
                  htmlFor="confirmation"
                  className="text-sm font-medium text-gray-700">
                  Nom du service à supprimer
                </Label>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono text-gray-800 border">
                  {service.name}
                </div>
              </div>

              <div>
                <Label
                  htmlFor="confirmationInput"
                  className="text-sm font-medium text-gray-700">
                  Confirmation (sensible à la casse)
                </Label>
                <Input
                  id="confirmationInput"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Tapez le nom exact du service"
                  className={`mt-1 ${
                    confirmationText && !isConfirmationValid
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : confirmationText && isConfirmationValid
                      ? "border-green-300 focus:border-green-500 bg-green-50"
                      : ""
                  }`}
                  autoFocus
                />
                {confirmationText && !isConfirmationValid && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Le nom ne correspond pas exactement
                  </p>
                )}
                {confirmationText && isConfirmationValid && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Confirmation valide
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {step === "confirmation" && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}>
              Retour
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={
              loading || (step === "confirmation" && !isConfirmationValid)
            }
            className="min-w-[120px]">
            {loading
              ? "Suppression..."
              : step === "warning"
              ? "Continuer"
              : "Supprimer définitivement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
