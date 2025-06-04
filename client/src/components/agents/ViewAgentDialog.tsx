/** @format */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Calendar,
  Clock,
  Star,
  X,
  Edit,
} from "lucide-react";
import { AgentWithDetails } from "@/types";

interface ViewAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentWithDetails | null;
  onEdit: (agent: AgentWithDetails) => void;
}

export default function ViewAgentDialog({
  isOpen,
  onClose,
  agent,
  onEdit,
}: ViewAgentDialogProps) {
  if (!agent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "vacation":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "inactive":
        return "Inactif";
      case "vacation":
        return "En congé";
      default:
        return status;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Détails de l'agent</DialogTitle>
            <Button
              variant="outline"
              onClick={() => onEdit(agent)}
              className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {agent.displayName || `${agent.firstName} ${agent.lastName}`}
                </h3>
                <p className="text-lg text-gray-600">{agent.title}</p>
                <Badge className={getStatusColor(agent.status)}>
                  {getStatusText(agent.status)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{agent.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{agent.phone}</p>
                  <p className="text-sm text-gray-500">Téléphone</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations professionnelles */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Informations professionnelles
              </h4>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {agent.totalBookings || 0}
                  </div>
                  <div className="text-sm text-green-700">
                    Total réservations
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-sm font-bold text-blue-600">
                    {agent.assignedLocationId || 0}
                  </div>
                  <div className="text-sm text-blue-700">Centre assigné id</div>
                </div>
              </div>

              {/* Bio */}
              {agent.bio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Biographie</h5>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {agent.bio}
                  </p>
                </div>
              )}

              {/* Points forts */}
              {agent.highlights && agent.highlights.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    Points forts
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {agent.highlights.map((highlight, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        {highlight.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Assignations et horaires */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Assignations et horaires
              </h4>

              {/* Centres assignés */}
              {agent.assignedLocations &&
                agent.assignedLocationId.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      Centres assignés
                    </h5>
                    <div className="space-y-2">{agent.assignedLocationId}</div>
                  </div>
                )}

              {/* Services assignés */}
              {agent.assignedServices && agent.assignedServices.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-green-500" />
                    Services assignés
                  </h5>
                  <div className="space-y-2">
                    {agent.assignedServices.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: service.color }}></div>
                        <span className="font-medium text-green-800">
                          {service.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horaires de travail */}
              {agent.workingHours && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    Horaires de travail
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(agent.workingHours).map(([day, hours]) => {
                      const dayLabels: any = {
                        monday: "Lundi",
                        tuesday: "Mardi",
                        wednesday: "Mercredi",
                        thursday: "Jeudi",
                        friday: "Vendredi",
                        saturday: "Samedi",
                        sunday: "Dimanche",
                      };

                      return hours ? (
                        <div
                          key={day}
                          className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="font-medium text-blue-800">
                            {dayLabels[day]}
                          </span>
                          <span className="text-blue-700">
                            {(hours as any).start} - {(hours as any).end}
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Statut de congé */}
              {agent.isOnLeave && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Actuellement en congé
                    </span>
                  </div>
                </div>
              )}
            </div>
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
