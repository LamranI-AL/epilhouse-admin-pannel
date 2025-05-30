/** @format */

import { useEffect, useState } from "react";
import { AgentForm } from "@/components/agents/AgentForm";
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AgentWithDetails } from "@/types";
import { AgentFormData } from "@/lib/validations/schemas";
import { useToast } from "@/hooks/use-toast";
import { addAgent, getAllAgents, updateAgent } from "@/actions/agents";
import AgentsTable from "@/components/agents/AgentsTable";

export default function Agents() {
  const [agents, setAgents] = useState<AgentWithDetails[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithDetails | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsFormOpen(true);
  };
  //fitcer all agents
  useEffect(() => {
    const fitchAllAgents = async () => {
      const data = await getAllAgents();
      setAgents(data.agents as any);
      console.log(data.agents);
    };
    fitchAllAgents();
  }, []);

  const handleFormSubmit = async (data: AgentFormData) => {
    const newData = {
      ...data,
      totalBookings: 0,
      assignedLocations: [],
      assignedServices: [],
    };
    if (selectedAgent) {
      await updateAgent(selectedAgent.id.toString(), newData);
      toast({
        title: "Agent modifié",
        description: "L'agent a été modifié avec succès.",
      });
    } else {
      try {
        await addAgent(newData as any);
        toast({
          title: "Agent créé",
          description: "L'agent a été créé avec succès.",
        });
      } catch (error) {
        console.log(error);
        toast({
          title: "Erreur",
          description:
            "Une erreur est survenue lors de la création de l'agent.",
        });
      }
    }
    console.log(data);
    // setIsFormOpen(false);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div className="space-y-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Gestion des Agents
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Button onClick={handleCreateAgent}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un nouvel agent
          </Button>
        </div>
      </div>

      {/* Agent Creation Form - Always visible as requested in the design */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm
            agent={selectedAgent as any}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </CardContent>
      </Card> */}

      {/* Agent Form Dialog for separate modal if needed */}
      <Dialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAgent ? "Modifier l'agent" : "Créer un nouvel agent"}
            </DialogTitle>
          </DialogHeader>
          <AgentForm
            agent={selectedAgent as any}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
      {agents?.length === 0 ? (
        <div>no data</div>
      ) : (
        <AgentsTable agents={agents} />
      )}
    </div>
  );
}
