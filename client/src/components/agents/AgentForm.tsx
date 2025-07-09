/** @format */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentSchema, AgentFormData } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentWithDetails, ServiceCategory, LocationWithAgents } from "@/types";
import { Camera, MapPin, Briefcase, Clock, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllLocations } from "@/actions/locations";
import { getAllServices } from "@/actions/services";

interface AgentFormProps {
  agent?: AgentWithDetails;
  onSubmit: (data: AgentFormData) => void;
  onCancel: () => void;
}

const weekDays = [
  { id: "monday", label: "Lundi", value: "lundi" },
  { id: "tuesday", label: "Mardi", value: "mardi" },
  { id: "wednesday", label: "Mercredi", value: "mercredi" },
  { id: "thursday", label: "Jeudi", value: "jeudi" },
  { id: "friday", label: "Vendredi", value: "vendredi" },
  { id: "saturday", label: "Samedi", value: "samedi" },
  { id: "sunday", label: "Dimanche", value: "dimanche" },
];

export function AgentForm({ agent, onSubmit, onCancel }: AgentFormProps) {
  const [locations, setLocations] = useState<LocationWithAgents[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    agent?.assignedServices?.map((s) => s.id) || [],
  );
  const [highlights, setHighlights] = useState<
    Array<{ value: string; label: string }>
  >(agent?.highlights || []);
  const [newHighlight, setNewHighlight] = useState({ value: "", label: "" });
  const [loading, setLoading] = useState(true);

  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: agent
      ? {
          firstName: agent.firstName,
          lastName: agent.lastName,
          displayName: agent.displayName || "",
          email: agent.email,
          phone: agent.phone || "",
          title: agent.title || "",
          password: agent.password || "",
          role: agent.role,
          bio: agent.bio || "",
          workingDays: agent.workingDays || [],
          workingHours: agent.workingHours || { start: "09:00", end: "18:00" },
          status: agent.status,
          isOnLeave: agent.isOnLeave,
          assignedLocationId: agent.assignedLocations?.id || "",
          assignedServiceIds: agent.assignedServices?.map((s) => s.id) || [],
        }
      : {
          firstName: "",
          lastName: "",
          displayName: "",
          email: "",
          phone: "",
          password: "",
          title: "",
          role: "user",
          bio: "",
          workingDays: [],
          workingHours: { start: "09:00", end: "18:00" },
          status: "active",
          isOnLeave: false,
          assignedLocationId: "",
          assignedServiceIds: [],
        },
  });
  // console.log(defaultValues);

  // Charger les locations et services
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [locationsResult, servicesResult] = await Promise.all([
          getAllLocations(),
          getAllServices(),
        ]);

        if (locationsResult.success) {
          setLocations(locationsResult.locations as LocationWithAgents[]);
        }

        if (servicesResult.success) {
          setServices(servicesResult.services as any[]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer la sélection de services
  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter((id) => id !== serviceId)
      : [...selectedServices, serviceId];

    setSelectedServices(updatedServices);
    form.setValue("assignedServiceIds", updatedServices);
  };
  // gerer location id

  // Gérer les highlights
  const addHighlight = () => {
    if (newHighlight.value && newHighlight.label) {
      const updatedHighlights = [...highlights, newHighlight];
      setHighlights(updatedHighlights);
      setNewHighlight({ value: "", label: "" });
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = highlights.filter((_, i) => i !== index);
    setHighlights(updatedHighlights);
  };

  const handleSubmit = (data: any) => {
    // Ajouter les highlights au data
    const formDataWithHighlights = {
      ...data,
      highlights,
      assignedServiceIds: selectedServices,
    };
    // console.log(formDataWithHighlights);
    onSubmit(formDataWithHighlights);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8">
          {/* Informations Générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>Informations Générales</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  {agent ? (
                    <span className="text-xl font-semibold text-blue-700">
                      {agent.firstName[0]}
                      {agent.lastName[0]}
                    </span>
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Définir l'avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Prénom"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nom"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nom d'affichage (optionnel)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@exemple.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mot de passe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="06 12 34 56 78 (optionnel)"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* <SelectItem value="user">Utilisateur</SelectItem> */}
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="superAdmin">
                            Super Administrateur
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isOnLeave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>En congé</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Cochez si l'agent est actuellement en congé
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Assignations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Assignations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Centre assigné */}
              <FormField
                control={form.control}
                name="assignedLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centre assigné *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un centre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem
                            key={location.id}
                            value={location.id.toString()}>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{location.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Services assignés */}
              <div className="space-y-4">
                <FormLabel>Services assignés</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <span className="font-medium text-gray-900">
                          {service.name}
                        </span>
                      </div>

                      {/* Sous-services */}
                      <div className="ml-6 space-y-2">
                        {service.subServices?.map((subService) => (
                          <div
                            key={subService.id}
                            className="flex items-center space-x-3 p-2 border border-gray-200 rounded">
                            <Checkbox
                              checked={selectedServices.includes(subService.id)}
                              onCheckedChange={() =>
                                handleServiceToggle(subService.id)
                              }
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {subService.name}
                              </div>
                              {subService.description && (
                                <div className="text-xs text-gray-500">
                                  {subService.description}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {subService.duration} min
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations Supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Supplémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre/Poste</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Esthéticienne Senior, Responsable Centre (optionnel)"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biographie</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description de l'agent, expérience, spécialités, formations... (optionnel)"
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Points forts */}
              <div className="space-y-4">
                <FormLabel>Points forts / Spécialités</FormLabel>

                {/* Liste des highlights existants */}
                {highlights.length > 0 && (
                  <div className="space-y-2">
                    {highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div>
                          <div className="font-medium text-blue-900">
                            {highlight.label}
                          </div>
                          <div className="text-sm text-blue-700">
                            {highlight.value}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHighlight(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajouter un nouveau highlight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-dashed border-gray-300 rounded-lg">
                  <Input
                    placeholder="Titre (ex: Expérience)"
                    value={newHighlight.label}
                    onChange={(e) =>
                      setNewHighlight((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Valeur (ex: 5 ans)"
                    value={newHighlight.value}
                    onChange={(e) =>
                      setNewHighlight((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHighlight}
                    disabled={!newHighlight.label || !newHighlight.value}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Planning de Travail</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Horaires généraux */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workingHours.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de début</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workingHours.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heure de fin</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Jours de travail */}
              <FormField
                control={form.control}
                name="workingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jours de travail</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {weekDays.map((day) => (
                        <div
                          key={day.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            field.value?.includes(day.value)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked: any) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, day.value]);
                                } else {
                                  field.onChange(
                                    current.filter((d) => d !== day.value),
                                  );
                                }
                              }}
                            />
                            <span className="font-medium text-gray-900">
                              {day.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {form.watch("workingHours.start")} -{" "}
                            {form.watch("workingHours.end")}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6">
              Annuler
            </Button>
            <Button
              type="submit"
              className="px-6">
              {agent ? "Modifier" : "Créer"} l'agent
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
