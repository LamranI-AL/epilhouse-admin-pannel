/** @format */

// components/locations/ManageAgentsDialog.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllAgents } from "@/actions/agents";
import { updateLocation } from "@/actions/locations";

interface ManageAgentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  location: any;
  onSuccess: () => void;
}

export default function ManageAgentsDialog({
  isOpen,
  onClose,
  location,
  onSuccess,
}: ManageAgentsDialogProps) {
  const [allAgents, setAllAgents] = useState<any[]>([]);
  const [assignedAgents, setAssignedAgents] = useState<any[]>([]);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && location) {
      loadAgents();
    }
  }, [isOpen, location]);

  const loadAgents = async () => {
    try {
      const result = await getAllAgents();
      if (result.success) {
        setAllAgents(result.agents || []);
        setAssignedAgents(location.assignedAgents || []);

        // Filtrer les agents disponibles (non assignés)
        const assignedIds = (location.assignedAgents || []).map(
          (a: any) => a.id,
        );
        const available = result.agents?.filter(
          (agent: any) => !assignedIds.includes(agent.id),
        );
        setAvailableAgents(available || []);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
      });
    }
  };

  const addAgent = async (agent: any) => {
    const newAgent = {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      displayName: agent.displayName,
    };

    const updatedAssigned = [...assignedAgents, newAgent];
    setAssignedAgents(updatedAssigned);
    setAvailableAgents(availableAgents.filter((a) => a.id !== agent.id));

    await saveChanges(updatedAssigned);
  };

  const removeAgent = async (agentId: string) => {
    const removedAgent = assignedAgents.find((a) => a.id === agentId);
    const updatedAssigned = assignedAgents.filter((a) => a.id !== agentId);
    setAssignedAgents(updatedAssigned);

    if (removedAgent) {
      const fullAgent = allAgents.find((a) => a.id === agentId);
      if (fullAgent) {
        setAvailableAgents([...availableAgents, fullAgent]);
      }
    }

    await saveChanges(updatedAssigned);
  };

  const saveChanges = async (updatedAgents: any[]) => {
    setLoading(true);
    try {
      const result = await updateLocation(location.id, {
        ...location,
        assignedAgents: updatedAgents,
      });

      if (result.success) {
        onSuccess();
        toast({
          title: "Succès",
          description: "Agents mis à jour",
        });
      } else {
        toast({ title: "Erreur", description: result.error });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableAgents = availableAgents.filter(
    (agent) =>
      `${agent.firstName} ${agent.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (agent.displayName &&
        agent.displayName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Gérer les agents - {location?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Agents assignés */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Agents assignés ({assignedAgents.length})
            </h3>
            {assignedAgents.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun agent assigné</p>
            ) : (
              <div className="space-y-2">
                {assignedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">
                          {agent.displayName ||
                            `${agent.firstName} ${agent.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {agent.firstName} {agent.lastName}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAgent(agent.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recherche et agents disponibles */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Agents disponibles ({filteredAvailableAgents.length})
            </h3>

            {/* Barre de recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredAvailableAgents.length === 0 ? (
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "Aucun agent trouvé"
                  : "Tous les agents sont assignés"}
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredAvailableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">
                          {agent.displayName ||
                            `${agent.firstName} ${agent.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {agent.firstName} {agent.lastName}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addAgent(agent)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
