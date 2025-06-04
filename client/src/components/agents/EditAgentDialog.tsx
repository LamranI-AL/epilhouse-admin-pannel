/** @format */

// components/agents/EditAgentDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentForm } from "@/components/agents/AgentForm";
import { AgentWithDetails } from "@/types";
import { AgentFormData } from "@/lib/validations/schemas";

interface EditAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentWithDetails | null;
  onSubmit: (data: AgentFormData) => Promise<void>;
}

export default function EditAgentDialog({
  isOpen,
  onClose,
  agent,
  onSubmit,
}: EditAgentDialogProps) {
  const handleSubmit = async (data: AgentFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agent ? "Modifier l'agent" : "Créer un nouvel agent"}
          </DialogTitle>
        </DialogHeader>
        <AgentForm
          agent={agent as any}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
