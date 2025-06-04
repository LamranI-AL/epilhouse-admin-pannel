/** @format */

import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Le nom du service est requis"),
  description: z.string().optional(),
  duration: z.number().min(1, "La durée doit être supérieure à 0"),
  price: z.string().regex(/^\d+(\.\d{2})?$/, "Prix invalide"),
  capacity: z.number().min(1, "La capacité doit être supérieure à 0"),
  category: z.enum(["FEMMES", "HOMMES"]),
  color: z.string().min(1, "La couleur est requise"),
  isActive: z.boolean().default(true),
});

export const agentSchema = z.object({
  // Informations personnelles (obligatoires)
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),

  // Informations optionnelles
  displayName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),

  // Rôle (obligatoire avec valeur par défaut)
  role: z.enum(["user", "admin", "superAdmin"]).default("user"),

  // Planning (optionnel mais structuré)
  workingDays: z.array(z.string()).nullable().optional(),
  workingHours: z
    .object({
      start: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Format d'heure invalide (HH:MM)",
        ),
      end: z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "Format d'heure invalide (HH:MM)",
        ),
    })
    .nullable()
    .optional()
    .refine((data) => {
      if (data && data.start && data.end) {
        const startTime = new Date(`1970-01-01T${data.start}:00`);
        const endTime = new Date(`1970-01-01T${data.end}:00`);
        return startTime < endTime;
      }
      return true;
    }, "L'heure de fin doit être après l'heure de début"),

  // Points forts/spécialités
  highlights: z
    .array(
      z.object({
        value: z.string().min(1, "La valeur est requise"),
        label: z.string().min(1, "Le libellé est requis"),
      }),
    )
    .nullable()
    .optional(),

  // Statut et congé
  status: z.string().min(1, "Le statut est requis").default("active"),
  isOnLeave: z.boolean().default(false),

  // Assignations (obligatoires)
  assignedLocationId: z.string().min(1, "Un centre doit être assigné"),
  assignedServiceIds: z
    .array(z.string())
    .min(1, "Au moins un service doit être assigné")
    .optional(),
});

export const clientSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  serviceId: z.number().min(1, "Le service est requis"),
  agentId: z.number().min(1, "L'agent est requis"),
  clientId: z.number().min(1, "Le client est requis"),
  locationId: z.number().min(1, "Le centre est requis"),
  startTime: z.date(),
  endTime: z.date(),
  status: z
    .enum(["confirmed", "pending", "completed", "cancelled"])
    .default("confirmed"),
  notes: z.string().optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{2})?$/, "Montant invalide"),
});

export const locationSchema = z.object({
  name: z.string().min(1, "Le nom du centre est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  country: z.string().default("France"),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  workingHours: z
    .record(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    )
    .optional(),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  type: z.enum(["percentage", "fixed_amount"]),
  value: z.string().regex(/^\d+(\.\d{2})?$/, "Valeur invalide"),
  applicableServices: z.array(z.string()).optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  usageLimit: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
export type AgentFormData = z.infer<typeof agentSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
