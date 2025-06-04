/** @format */

// components/agents/DeleteAgentDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, User } from "lucide-react";
import { AgentWithDetails } from "@/types";

interface DeleteAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentWithDetails | null;
  onConfirm: (agentId: string) => Promise<void>;
  loading?: boolean;
}

export default function DeleteAgentDialog({
  isOpen,
  onClose,
  agent,
  onConfirm,
  loading = false,
}: DeleteAgentDialogProps) {
  if (!agent) return null;

  const handleConfirm = async () => {
    await onConfirm(agent.id.toString());
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
              <DialogTitle className="text-lg">Supprimer l'agent</DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                Cette action ne peut pas être annulée
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">
                  {agent.displayName || `${agent.firstName} ${agent.lastName}`}
                </p>
                <p className="text-sm text-gray-600">{agent.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">
              Attention - Suppression définitive
            </h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Toutes les informations de l'agent seront supprimées</li>
              <li>• Les assignations aux centres seront supprimées</li>
              <li>• L'historique des réservations sera conservé</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Êtes-vous sûr de vouloir supprimer cet agent ?</strong>
            </p>
            <p className="mt-1">
              Tapez{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                {agent.firstName}
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
