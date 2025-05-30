/** @format */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Plus,
  User,
  Search,
  CheckCircle,
  AlertTriangle,
  Users,
  Save,
} from "lucide-react";

// Types
interface ServiceWithAgents {
  id?: string;
  name: string;
  description: string | null;
  duration: number;
  price: string;
  capacity: number;
  category: string;
  color: string;
  isActive: boolean;
  assignedAgents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
  }>;
}

interface AgentWithDetails {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  email: string;
  phone: string | null;
  title: string | null;
  status: string;
  isOnLeave: boolean;
  totalBookings: number;
  assignedServices: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: string;
  capacity: number;
  category: "FEMMES" | "HOMMES";
  color: string;
  isActive: boolean;
}

interface EnhancedServiceFormProps {
  service?: ServiceWithAgents;
  onSubmit: (data: ServiceFormData, assignedAgents: string[]) => void;
  onCancel: () => void;
  getAllAgents: () => Promise<{
    success: boolean;
    agents?: AgentWithDetails[];
  }>;
}

const colorOptions = [
  { value: "#3B82F6", label: "Bleu", class: "bg-blue-500" },
  { value: "#10B981", label: "Vert", class: "bg-green-500" },
  { value: "#8B5CF6", label: "Violet", class: "bg-purple-500" },
  { value: "#EF4444", label: "Rouge", class: "bg-red-500" },
  { value: "#F59E0B", label: "Orange", class: "bg-orange-500" },
  { value: "#EAB308", label: "Jaune", class: "bg-yellow-500" },
];

export function EnhancedServiceForm({
  service,
  onSubmit,
  onCancel,
  getAllAgents,
}: EnhancedServiceFormProps) {
  const [availableAgents, setAvailableAgents] = useState<AgentWithDetails[]>(
    [],
  );
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);

  const form = useForm<ServiceFormData>({
    defaultValues: service
      ? {
          name: service.name,
          description: service.description || "",
          duration: service.duration,
          price: service.price,
          capacity: service.capacity,
          category: service.category as "FEMMES" | "HOMMES",
          color: service.color,
          isActive: service.isActive,
        }
      : {
          name: "",
          description: "",
          duration: 30,
          price: "45.00",
          capacity: 1,
          category: "FEMMES",
          color: "#3B82F6",
          isActive: true,
        },
  });

  // Charger les agents au montage du composant
  useEffect(() => {
    loadAgents();
    if (service?.assignedAgents) {
      setSelectedAgents(service.assignedAgents.map((agent) => agent.id));
    }
  }, [service]);

  const loadAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const result = await getAllAgents();
      console.log(result);
      if (result.success && result.agents) {
        // Filtrer les agents actifs uniquement
        const activeAgents = result.agents.filter(
          (agent) => agent.status === "active" && !agent.isOnLeave,
        );
        setAvailableAgents(activeAgents);
        console.log(activeAgents);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des agents:", error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const getSelectedAgentsData = () => {
    return availableAgents.filter((agent) => selectedAgents.includes(agent.id));
  };

  const getFilteredAgents = () => {
    return availableAgents.filter((agent) => {
      const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
      const email = agent.email?.toLowerCase() || "";
      const displayName = agent.displayName?.toLowerCase() || "";

      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        displayName.includes(searchTerm.toLowerCase())
      );
    });
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId],
    );
  };

  const handleSubmit = (data: ServiceFormData) => {
    // Vérifier que le nombre d'agents n'excède pas la capacité
    if (selectedAgents.length > data.capacity) {
      alert(
        `Vous ne pouvez pas assigner plus de ${data.capacity} agents à ce service.`,
      );
      return;
    }
    // cre un service avec les données
    const newService = {
      ...data,
      assignedAgents: selectedAgents,
    };
    console.log(newService);
    onSubmit(newService, selectedAgents);
  };

  const capacityWarning = selectedAgents.length > form.watch("capacity");

  return (
    <div className="bg-white rounded-lg shadow-sm border max-w-4xl mx-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {service ? "Modifier le service" : "Créer un nouveau service"}
              </h2>
              <p className="text-sm text-gray-600">
                Configurez les détails et assignez les agents
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Informations du service
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du service *
                </label>
                <input
                  {...form.register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="ex: Épilation 1 Zone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  {...form.register("category")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="FEMMES">Femmes</option>
                  <option value="HOMMES">Hommes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...form.register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Description du service..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (minutes) *
                </label>
                <input
                  type="number"
                  {...form.register("duration", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (€) *
                </label>
                <input
                  {...form.register("price")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="45.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité (agents max) *
                </label>
                <input
                  type="number"
                  {...form.register("capacity", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Couleur
                </label>
                <select
                  {...form.register("color")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  {colorOptions.map((color) => (
                    <option
                      key={color.value}
                      value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  {...form.register("isActive")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Service actif
                </label>
              </div>
            </div>
          </div>

          {/* Gestion des agents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Agents assignés ({selectedAgents.length}/
                {form.watch("capacity")})
              </h3>
              <button
                type="button"
                onClick={() => setShowAgentSelection(!showAgentSelection)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Users className="w-4 h-4" />
                <span>Gérer les agents</span>
              </button>
            </div>

            {capacityWarning && (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-orange-700">
                  Attention: Vous avez assigné plus d'agents que la capacité
                  autorisée.
                </span>
              </div>
            )}

            {/* Agents sélectionnés */}
            {selectedAgents.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Agents sélectionnés:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getSelectedAgentsData().map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-medium text-xs">
                            {agent.firstName[0]}
                            {agent.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {agent.firstName} {agent.lastName}
                          </div>
                          {agent.title && (
                            <div className="text-xs text-gray-500">
                              {agent.title}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAgentToggle(agent.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sélection d'agents */}
            {showAgentSelection && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher un agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {isLoadingAgents ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500">
                        Chargement des agents...
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {getFilteredAgents().map((agent) => (
                        <div
                          key={agent.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAgents.includes(agent.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAgentToggle(agent.id)}>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-medium text-xs">
                                {agent.firstName[0]}
                                {agent.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {agent.firstName} {agent.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {agent.email}{" "}
                                {agent.title && `• ${agent.title}`}
                              </div>
                            </div>
                          </div>
                          {selectedAgents.includes(agent.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      ))}

                      {getFilteredAgents().length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Aucun agent trouvé
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Annuler
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(form.getValues())}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              <span>{service ? "Modifier" : "Créer"} le service</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedServiceForm;
