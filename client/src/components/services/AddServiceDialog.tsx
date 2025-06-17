/** @format */

// components/services/AddServiceDialog.tsx - Compatible avec nouvelle architecture
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Euro, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addService } from "@/actions/services";
import { Category, SubService } from "@/types";

interface AddServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export default function AddServiceDialog({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: AddServiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    color: "#3B82F6",
    isActive: true,
  });

  const [subServices, setSubServices] = useState<Omit<SubService, "id">[]>([
    {
      name: "",
      normalPrice: 0,
      discountPrice: undefined,
      duration: 30,
      description: "",
      isActive: true,
    },
  ]);

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addSubService = () => {
    setSubServices([
      ...subServices,
      {
        name: "",
        normalPrice: 0,
        discountPrice: undefined,
        duration: 30,
        description: "",
        isActive: true,
      },
    ]);
  };

  const removeSubService = (index: number) => {
    if (subServices.length > 1) {
      setSubServices(subServices.filter((_, i) => i !== index));
    }
  };

  const updateSubService = (index: number, field: string, value: any) => {
    const updated = [...subServices];
    updated[index] = { ...updated[index], [field]: value };
    setSubServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une catégorie",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const serviceData = {
        ...formData,
        subServices: subServices.map((sub, index) => ({
          ...sub,
          id: `sub_${Date.now()}_${index}`,
        })),
      };

      const result = await addService(serviceData);

      if (result.success) {
        onSuccess();
        onClose();
        toast({
          title: "Succès",
          description: "Service créé avec succès",
        });
        resetForm();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la création",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      color: "#3B82F6",
      isActive: true,
    });
    setSubServices([
      {
        name: "",
        normalPrice: 0,
        discountPrice: undefined,
        duration: 30,
        description: "",
        isActive: true,
      },
    ]);
  };

  const getSelectedCategory = () => {
    return categories.find((cat) => cat.id === formData.categoryId);
  };

  const predefinedColors = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau service</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nom du service *</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                placeholder="Ex: Épilation Laser"
              />
            </div>

            <div>
              <Label>Catégorie *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => updateField("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {getSelectedCategory() && (
                <p className="text-xs text-gray-500 mt-1">
                  Ce service sera classé dans la catégorie "
                  {getSelectedCategory()?.name}"
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Description du service..."
              rows={3}
            />
          </div>

          <div>
            <Label>Couleur du service (optionnel)</Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => updateField("color", e.target.value)}
                className="w-12 h-10 border rounded cursor-pointer"
              />
              <div className="flex space-x-1">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateField("color", color)}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Si non définie, la couleur de la catégorie sera utilisée
            </p>
          </div>

          {/* Sous-services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg">Sous-services et Tarifs</Label>
              <Button
                type="button"
                variant="outline"
                onClick={addSubService}
                className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un sous-service
              </Button>
            </div>

            <div className="space-y-4">
              {subServices.map((subService, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Sous-service {index + 1}
                    </h4>
                    {subServices.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubService(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom *</Label>
                      <Input
                        value={subService.name}
                        onChange={(e) =>
                          updateSubService(index, "name", e.target.value)
                        }
                        required
                        placeholder="Ex: Aisselles"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={subService.description}
                        onChange={(e) =>
                          updateSubService(index, "description", e.target.value)
                        }
                        placeholder="Description courte..."
                      />
                    </div>

                    <div>
                      <Label>Prix normal (€) *</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="number"
                          value={subService.normalPrice}
                          onChange={(e) =>
                            updateSubService(
                              index,
                              "normalPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          required
                          min="0"
                          step="0.01"
                          className="pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Prix promotionnel (€)</Label>
                      <div className="relative">
                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="number"
                          value={subService.discountPrice || ""}
                          onChange={(e) =>
                            updateSubService(
                              index,
                              "discountPrice",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          min="0"
                          step="0.01"
                          className="pl-10"
                          placeholder="Prix réduit (optionnel)"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Durée (minutes) *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="number"
                          value={subService.duration}
                          onChange={(e) =>
                            updateSubService(
                              index,
                              "duration",
                              parseInt(e.target.value) || 30,
                            )
                          }
                          required
                          min="1"
                          className="pl-10"
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={subService.isActive}
                        onCheckedChange={(checked) =>
                          updateSubService(index, "isActive", checked)
                        }
                      />
                      <Label>Sous-service actif</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statut actif du service */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField("isActive", checked)}
            />
            <Label>Service actif</Label>
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
              disabled={loading || !formData.categoryId}>
              {loading ? "Création..." : "Créer le service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
