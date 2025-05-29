import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("agent"), // "admin" | "agent"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("France"),
  phone: text("phone"),
  email: text("email"),
  coordinates: jsonb("coordinates").$type<{lat: number, lng: number}>(),
  workingHours: jsonb("working_hours").$type<Record<string, {start: string, end: string}>>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  capacity: integer("capacity").default(1).notNull(),
  category: text("category").notNull(), // "FEMMES" | "HOMMES"
  color: text("color").notNull(), // for calendar display
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agents table
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  title: text("title"),
  bio: text("bio"),
  workingDays: jsonb("working_days").$type<string[]>(),
  workingHours: jsonb("working_hours").$type<{start: string, end: string}>(),
  highlights: jsonb("highlights").$type<Array<{value: string, label: string}>>(),
  status: text("status").notNull().default("active"), // "active" | "on_leave" | "inactive"
  isOnLeave: boolean("is_on_leave").default(false).notNull(),
  leaveStartDate: timestamp("leave_start_date"),
  leaveEndDate: timestamp("leave_end_date"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Agent locations - many to many relationship
export const agentLocations = pgTable("agent_locations", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
});

// Agent services - many to many relationship  
export const agentServices = pgTable("agent_services", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("confirmed"), // "confirmed" | "pending" | "completed" | "cancelled"
  notes: text("notes"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("open"), // "open" | "closed" | "pending"
  paymentStatus: text("payment_status").notNull().default("not_paid"), // "paid" | "not_paid" | "partial"
  fulfillmentStatus: text("fulfillment_status").notNull().default("not_fulfilled"), // "fulfilled" | "not_fulfilled" | "partial"
  confirmationCode: text("confirmation_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // "cash" | "card" | "transfer" | "online"
  status: text("status").notNull().default("pending"), // "pending" | "completed" | "failed"
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // "percentage" | "fixed_amount"
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  applicableServices: jsonb("applicable_services").$type<string[]>(),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
