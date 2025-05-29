import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1, 'Le nom du service est requis'),
  description: z.string().optional(),
  duration: z.number().min(1, 'La durée doit être supérieure à 0'),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Prix invalide'),
  capacity: z.number().min(1, 'La capacité doit être supérieure à 0'),
  category: z.enum(['FEMMES', 'HOMMES']),
  color: z.string().min(1, 'La couleur est requise'),
  isActive: z.boolean().default(true),
});

export const agentSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  displayName: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  workingDays: z.array(z.string()).optional(),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  highlights: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  status: z.enum(['active', 'on_leave', 'inactive']).default('active'),
  isOnLeave: z.boolean().default(false),
  leaveStartDate: z.date().optional(),
  leaveEndDate: z.date().optional(),
});

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  serviceId: z.number().min(1, 'Le service est requis'),
  agentId: z.number().min(1, 'L\'agent est requis'),
  clientId: z.number().min(1, 'Le client est requis'),
  locationId: z.number().min(1, 'Le centre est requis'),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['confirmed', 'pending', 'completed', 'cancelled']).default('confirmed'),
  notes: z.string().optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{2})?$/, 'Montant invalide'),
});

export const locationSchema = z.object({
  name: z.string().min(1, 'Le nom du centre est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  city: z.string().min(1, 'La ville est requise'),
  postalCode: z.string().min(1, 'Le code postal est requis'),
  country: z.string().default('France'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  workingHours: z.record(z.object({
    start: z.string(),
    end: z.string(),
  })).optional(),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
  type: z.enum(['percentage', 'fixed_amount']),
  value: z.string().regex(/^\d+(\.\d{2})?$/, 'Valeur invalide'),
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
