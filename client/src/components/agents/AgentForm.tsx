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
import { AgentWithDetails } from "@/types";
import { Camera } from "lucide-react";

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
          bio: agent.bio || "",
          workingDays: agent.workingDays || [],
          workingHours: agent.workingHours || { start: "09:00", end: "18:00" },
          highlights: agent.highlights || [],
          status: agent.status as "active" | "on_leave" | "inactive",
          isOnLeave: agent.isOnLeave,
        }
      : {
          firstName: "",
          lastName: "",
          displayName: "",
          email: "",
          phone: "",
          title: "",
          bio: "",
          workingDays: [],
          workingHours: { start: "09:00", end: "18:00" },
          highlights: [],
          status: "active",
          isOnLeave: false,
        },
  });

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm">
                  Définir l'avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
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
                      <FormLabel>Nom</FormLabel>
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
                          placeholder="Nom d'affichage"
                          {...field}
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
                      <FormLabel>Email</FormLabel>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="06 12 34 56 78"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
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
                        <SelectItem value="on_leave">En congé</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Extra Information */}
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
                    <FormLabel>Titre de l'agent</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Esthéticienne Senior"
                        {...field}
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description de l'agent, expérience, spécialités..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Agent Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Planning de l'Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="workingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jours de travail</FormLabel>
                    <div className="space-y-3">
                      {weekDays.map((day) => (
                        <div
                          key={day.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
                            09:00-18:00
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

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              {agent ? "Modifier" : "Créer"} l'agent
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
