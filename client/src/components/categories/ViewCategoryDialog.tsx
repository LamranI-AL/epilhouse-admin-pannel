/** @format */

// components/categories/ViewCategoryDialog.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Tag, Calendar } from "lucide-react";
import { Category } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: Category) => void;
  category: Category | null;
}

export default function ViewCategoryDialog({
  isOpen,
  onClose,
  onEdit,
  category,
}: Props) {
  if (!category) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.color }}>
              <Tag className="w-4 h-4 text-white" />
            </div>
            {category.name}
          </DialogTitle>
          <DialogDescription>Détails de la catégorie</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Statut</h4>
            <Badge
              className={
                category.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }>
              {category.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>

          {category.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Couleur</h4>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-mono">{category.color}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Créé le</h4>
              <p className="text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(category.createdAt, "dd/MM/yyyy", { locale: fr })}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Modifié le</h4>
              <p className="text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(category.updatedAt, "dd/MM/yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={() => onEdit(category)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
