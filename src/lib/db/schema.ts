import {
  pgTable,
  uuid,
  text,
  boolean,
  real,
  timestamp,
  date,
  jsonb,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── States ───────────────────────────────────────────────────────────────────

export const states = pgTable("states", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  portalName: text("portal_name").notNull(),
  portalUrl: text("portal_url"),
  status: text("status", { enum: ["active", "coming_soon"] })
    .notNull()
    .default("active"),
});

export const statesRelations = relations(states, ({ many }) => ({
  services: many(services),
}));

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  stateId: text("state_id")
    .notNull()
    .references(() => states.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  category: text("category", {
    enum: ["certificate", "pension", "welfare", "other"],
  }).notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["live", "beta", "coming_soon"],
  })
    .notNull()
    .default("coming_soon"),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  state: one(states, {
    fields: [services.stateId],
    references: [states.id],
  }),
  rulePacks: many(rulePacks),
  applications: many(applications),
}));

// ─── Rule Packs ───────────────────────────────────────────────────────────────

export const rulePacks = pgTable("rule_packs", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  version: integer("version").notNull().default(1),
  rules: jsonb("rules").notNull(),
  verificationLevel: text("verification_level", {
    enum: ["verified", "simplified"],
  }).notNull(),
  sourceMetadata: jsonb("source_metadata"),
  status: text("status", { enum: ["draft", "published"] })
    .notNull()
    .default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const rulePacksRelations = relations(rulePacks, ({ one }) => ({
  service: one(services, {
    fields: [rulePacks.serviceId],
    references: [services.id],
  }),
}));

// ─── Operators ────────────────────────────────────────────────────────────────

export const operators = pgTable("operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  fullName: text("full_name"),
  kioskId: text("kiosk_id"),
  role: text("role", { enum: ["operator", "admin"] })
    .notNull()
    .default("operator"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const operatorsRelations = relations(operators, ({ many }) => ({
  sessions: many(sessions),
  applications: many(applications),
}));

// ─── OTP Codes ────────────────────────────────────────────────────────────────

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  operator: one(operators, {
    fields: [sessions.operatorId],
    references: [operators.id],
  }),
}));

// ─── Applications ─────────────────────────────────────────────────────────────

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id),
  stateId: text("state_id")
    .notNull()
    .references(() => states.id),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id),
  rulePackId: uuid("rule_pack_id").references(() => rulePacks.id),
  citizenName: text("citizen_name").notNull(),
  status: text("status", {
    enum: ["draft", "checking", "blocked", "ready", "submitted"],
  })
    .notNull()
    .default("draft"),
  intendedUseDeadline: date("intended_use_deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  operator: one(operators, {
    fields: [applications.operatorId],
    references: [operators.id],
  }),
  state: one(states, {
    fields: [applications.stateId],
    references: [states.id],
  }),
  service: one(services, {
    fields: [applications.serviceId],
    references: [services.id],
  }),
  rulePack: one(rulePacks, {
    fields: [applications.rulePackId],
    references: [rulePacks.id],
  }),
  familyMembers: many(familyMembers),
  documents: many(documents),
  preflightChecks: many(preflightChecks),
  auditEvents: many(auditEvents),
}));

// ─── Family Members ───────────────────────────────────────────────────────────

export const familyMembers = pgTable("family_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  relation: text("relation").notNull(),
  isEarning: boolean("is_earning").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const familyMembersRelations = relations(familyMembers, ({ one }) => ({
  application: one(applications, {
    fields: [familyMembers.applicationId],
    references: [applications.id],
  }),
}));

// ─── Documents ────────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  familyMemberId: uuid("family_member_id").references(
    () => familyMembers.id,
    { onDelete: "set null" }
  ),
  docType: text("doc_type", {
    enum: [
      "identity_proof",
      "address_proof",
      "income_proof_salaried",
      "income_proof_nonsalaried",
      "photo",
      "community_proof",
      "residence_proof",
      "death_certificate",
      "age_proof",
      "bank_account_proof",
      "prior_caste_certificate",
      "community_reference",
    ],
  }).notNull(),
  mockFileName: text("mock_file_name").notNull(),
  mockImageUrl: text("mock_image_url").notNull(),
  ocrStatus: text("ocr_status", {
    enum: ["pending", "complete", "failed"],
  })
    .notNull()
    .default("pending"),
  ocrConfidence: real("ocr_confidence"),
  extractedData: jsonb("extracted_data"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  application: one(applications, {
    fields: [documents.applicationId],
    references: [applications.id],
  }),
  familyMember: one(familyMembers, {
    fields: [documents.familyMemberId],
    references: [familyMembers.id],
  }),
}));

// ─── Preflight Checks ────────────────────────────────────────────────────────

export const preflightChecks = pgTable("preflight_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  ruleId: text("rule_id").notNull(),
  severity: text("severity", { enum: ["blocker", "warning"] }).notNull(),
  result: text("result", {
    enum: ["pass", "fail", "manual_review"],
  }).notNull(),
  evidence: jsonb("evidence"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const preflightChecksRelations = relations(preflightChecks, ({ one, many }) => ({
  application: one(applications, {
    fields: [preflightChecks.applicationId],
    references: [applications.id],
  }),
  resolutions: many(resolutions),
}));

// ─── Resolutions ──────────────────────────────────────────────────────────────

export const resolutions = pgTable("resolutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => preflightChecks.id, { onDelete: "cascade" }),
  plainLanguageFix: text("plain_language_fix").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
});

export const resolutionsRelations = relations(resolutions, ({ one }) => ({
  check: one(preflightChecks, {
    fields: [resolutions.checkId],
    references: [preflightChecks.id],
  }),
}));

// ─── Audit Events ─────────────────────────────────────────────────────────────

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  application: one(applications, {
    fields: [auditEvents.applicationId],
    references: [applications.id],
  }),
}));

// ─── Exported Types ───────────────────────────────────────────────────────────

export type State = typeof states.$inferSelect;
export type NewState = typeof states.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type RulePack = typeof rulePacks.$inferSelect;
export type NewRulePack = typeof rulePacks.$inferInsert;
export type Operator = typeof operators.$inferSelect;
export type NewOperator = typeof operators.$inferInsert;
export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type PreflightCheck = typeof preflightChecks.$inferSelect;
export type NewPreflightCheck = typeof preflightChecks.$inferInsert;
export type Resolution = typeof resolutions.$inferSelect;
export type NewResolution = typeof resolutions.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
