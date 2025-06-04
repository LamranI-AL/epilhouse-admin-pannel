/** @format */

// components/agents/Agents.tsx - Composant principal mis à jour
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, UserCheck, UserX } from "lucide-react";
import { AgentWithDetails } from "@/types";
import { AgentFormData } from "@/lib/validations/schemas";
import { useToast } from "@/hooks/use-toast";
import {
  addAgent,
  getAllAgents,
  updateAgent,
  deleteAgent,
} from "@/actions/agents";
import AgentsTable from "@/components/agents/AgentsTable";
import ViewAgentDialog from "@/components/agents/ViewAgentDialog";
import EditAgentDialog from "@/components/agents/EditAgentDialog";
import DeleteAgentDialog from "@/components/agents/DeleteAgentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

export default function Agents() {
  const [agents, setAgents] = useState<AgentWithDetails[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithDetails | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  // const [user, setUser] = useState<User | null>(null);
  const { agentData, register } = useAuth();

  // Charger tous les agents
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const data = await getAllAgents();
      if (data.success) {
        setAgents(data.agents as AgentWithDetails[]);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Actions des dialogs
  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsCreateDialogOpen(true);
  };

  const handleViewAgent = (agent: AgentWithDetails) => {
    setSelectedAgent(agent);
    setIsViewDialogOpen(true);
  };

  const handleEditAgent = (agent: AgentWithDetails) => {
    setSelectedAgent(agent);
    setIsEditDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleDeleteAgent = (agent: AgentWithDetails) => {
    setSelectedAgent(agent);
    setIsDeleteDialogOpen(true);
  };

  // Soumission du formulaire (création/édition)
  const handleFormSubmit = async (data: AgentFormData) => {
    const newData = {
      ...data,
      totalBookings: selectedAgent?.totalBookings || 0,
      assignedLocations: selectedAgent?.assignedLocations || [],
      assignedServices: selectedAgent?.assignedServices || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: agentData?.id || "",
      updatedBy: agentData?.id || "",
    };

    try {
      if (selectedAgent) {
        await updateAgent(selectedAgent.id.toString(), newData as any);
        toast({
          title: "Agent modifié",
          description: "L'agent a été modifié avec succès.",
        });
      } else {
        // await addAgent(newData as any);
        // aussi fait register l'agent dans la table users
        await register(newData as any);
        toast({
          title: "Agent créé",
          description: "L'agent a été créé avec succès.",
        });
      }
      await loadAgents();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive",
      });
    }
  };

  // Confirmation de suppression
  const handleDeleteConfirm = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
      toast({
        title: "Agent supprimé",
        description: "L'agent a été supprimé avec succès.",
      });
      await loadAgents();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'agent.",
        variant: "destructive",
      });
    }
  };

  // Statistiques
  const stats = {
    total: agents.length,
    active: agents.filter((a) => a.status === "active").length,
    inactive: agents.filter((a) => a.status === "inactive").length,
    onLeave: agents.filter((a) => a.isOnLeave).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Agents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez votre équipe d'agents et leurs assignations
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button
            onClick={handleCreateAgent}
            className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer un nouvel agent
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              agents dans l'équipe
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agents Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">agents disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Congé</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.onLeave}
            </div>
            <p className="text-xs text-muted-foreground">agents en congé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((stats.active / stats.total) * 100) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">taux d'activité</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des agents */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun agent trouvé
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par créer votre premier agent
            </p>
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AgentsTable
          agents={agents}
          onView={handleViewAgent as any}
          onEdit={handleEditAgent}
          onDelete={handleDeleteAgent}
        />
      )}

      {/* Dialogs */}
      <EditAgentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        agent={null}
        onSubmit={handleFormSubmit}
      />

      <ViewAgentDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        agent={selectedAgent}
        onEdit={handleEditAgent}
      />

      <EditAgentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        agent={selectedAgent}
        onSubmit={handleFormSubmit}
      />

      <DeleteAgentDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        agent={selectedAgent}
        onConfirm={handleDeleteConfirm}
        loading={loading}
      />
    </div>
  );
}
