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
} from "drizzle-orm/pg-core";

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceId: text("service_id").notNull().default("rj_family_income_certificate"),
  state: text("state").notNull().default("rajasthan"),
  operatorName: text("operator_name").notNull(),
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

export const checks = pgTable("checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  ruleId: text("rule_id").notNull(),
  severity: text("severity", { enum: ["blocker", "warning"] }).notNull(),
  status: text("status", { enum: ["pass", "fail", "manual_review"] }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const resolutions = pgTable("resolutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkId: uuid("check_id")
    .notNull()
    .references(() => checks.id, { onDelete: "cascade" }),
  plainLanguageFix: text("plain_language_fix").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type NewFamilyMember = typeof familyMembers.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Check = typeof checks.$inferSelect;
export type NewCheck = typeof checks.$inferInsert;
export type Resolution = typeof resolutions.$inferSelect;
export type NewResolution = typeof resolutions.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
