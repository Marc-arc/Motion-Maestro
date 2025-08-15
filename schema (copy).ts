import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  status: text("status").notNull().default("uploaded"), // uploaded, processing, processed, error
  extractedText: text("extracted_text"),
  processingError: text("processing_error"),
});

export const extractedInformation = pgTable("extracted_information", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id).notNull(),
  caseNumber: text("case_number"),
  court: text("court"),
  judge: text("judge"),
  petitionerName: text("petitioner_name"),
  petitionerAddress: text("petitioner_address"),
  petitionerPhone: text("petitioner_phone"),
  respondentName: text("respondent_name"),
  respondentAddress: text("respondent_address"),
  respondentPhone: text("respondent_phone"),
  marriageDate: text("marriage_date"),
  separationDate: text("separation_date"),
  filingDate: text("filing_date"),
  // Attorney information
  attorneyName: text("attorney_name"),
  attorneyAddress: text("attorney_address"),
  attorneyPhone: text("attorney_phone"),
  attorneyEmail: text("attorney_email"),
  // Federal court specific fields
  appelantName: text("appellant_name"),
  judgmentType: text("judgment_type"),
  judgmentDate: text("judgment_date"),
  clientName: text("client_name"),
  applicantName: text("applicant_name"),
  barState: text("bar_state"),
  admissionDate: text("admission_date"),
  localCounselName: text("local_counsel_name"),
  localCounselFirm: text("local_counsel_firm"),
  localCounselAddress: text("local_counsel_address"),
  localCounselPhone: text("local_counsel_phone"),
  localCounselEmail: text("local_counsel_email"),
  monthlyIncome: text("monthly_income"),
  monthlyExpenses: text("monthly_expenses"),
  cashOnHand: text("cash_on_hand"),
  propertyDescription: text("property_description"),
  employmentStatus: text("employment_status"),
  jurisdictionBasis: text("jurisdiction_basis"),
  venueBasis: text("venue_basis"),
  plaintiffDescription: text("plaintiff_description"),
  defendantDescription: text("defendant_description"),
  claimStatement: text("claim_statement"),
  damageAmount: text("damage_amount"),
  // Criminal case fields
  defendantName: text("defendant_name"),
  arrestDate: text("arrest_date"),
  initialAppearanceDate: text("initial_appearance_date"),
  reasonForExclusion: text("reason_for_exclusion"),
  justificationForExclusion: text("justification_for_exclusion"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  prosecutorName: text("prosecutor_name"),
  prosecutorAddress: text("prosecutor_address"),
  prosecutorPhone: text("prosecutor_phone"),
  defenseAttorneyName: text("defense_attorney_name"),
  defenseAttorneyAddress: text("defense_attorney_address"),
  defenseAttorneyPhone: text("defense_attorney_phone"),
  // Subpoena fields
  witnessName: text("witness_name"),
  witnessAddress: text("witness_address"),
  courtLocation: text("court_location"),
  hearingDate: text("hearing_date"),
  hearingTime: text("hearing_time"),
  documentsRequired: text("documents_required"),
  // Related cases
  relatedCaseName: text("related_case_name"),
  relatedCaseNumber: text("related_case_number"),
  relatedCaseJudge: text("related_case_judge"),
  relationshipDescription: text("relationship_description"),
  reasonForRelation: text("reason_for_relation"),
  // Minnesota state form fields
  childName: text("child_name"),
  childBirthDate: text("child_birth_date"),
  custodyBasis: text("custody_basis"),
  custodyRequest: text("custody_request"),
  relationship: text("relationship"),
  abuseDescription: text("abuse_description"),
  abuseDate: text("abuse_date"),
  abuseLocation: text("abuse_location"),
  harassmentDescription: text("harassment_description"),
  harassmentDate: text("harassment_date"),
  harassmentLocation: text("harassment_location"),
  claimDescription: text("claim_description"),
  currentName: text("current_name"),
  birthDate: text("birth_date"),
  birthPlace: text("birth_place"),
  newName: text("new_name"),
  reasonForChange: text("reason_for_change"),
  criminalCharge: text("criminal_charge"),
  convictionDate: text("conviction_date"),
  convictionCourt: text("conviction_court"),
  convictionCaseNumber: text("conviction_case_number"),
  sentenceCompleted: text("sentence_completed"),
  expungementBenefit: text("expungement_benefit"),
  propertyAddress: text("property_address"),
  tenancyType: text("tenancy_type"),
  monthlyRent: text("monthly_rent"),
  rentDueDate: text("rent_due_date"),
  defaultDescription: text("default_description"),
  noticeServed: text("notice_served"),
  noticeDate: text("notice_date"),
  tenancyEndDate: text("tenancy_end_date"),
  rentOwed: text("rent_owed"),
  wardName: text("ward_name"),
  wardBirthDate: text("ward_birth_date"),
  wardAddress: text("ward_address"),
  wardRelationship: text("ward_relationship"),
  guardianshipReason: text("guardianship_reason"),
  petitionerQualifications: text("petitioner_qualifications"),
  priorityPersons: text("priority_persons"),
  decedentName: text("decedent_name"),
  deathDate: text("death_date"),
  deathPlace: text("death_place"),
  domicileCounty: text("domicile_county"),
  willDate: text("will_date"),
  namedExecutor: text("named_executor"),
  estateValue: text("estate_value"),
  heirsDevisees: text("heirs_devisees"),
  requestedExecutor: text("requested_executor"),
  additionalInfo: jsonb("additional_info"),
  extractedAt: timestamp("extracted_at").defaultNow().notNull(),
});

export const legalTemplates = pgTable("legal_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // motion, petition, etc.
  category: text("category").notNull(), // divorce, custody, etc.
  template: text("template").notNull(),
  requiredFields: jsonb("required_fields").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertExtractedInformationSchema = createInsertSchema(extractedInformation).omit({
  id: true,
  extractedAt: true,
});

export const insertLegalTemplateSchema = createInsertSchema(legalTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ExtractedInformation = typeof extractedInformation.$inferSelect;
export type InsertExtractedInformation = z.infer<typeof insertExtractedInformationSchema>;
export type LegalTemplate = typeof legalTemplates.$inferSelect;
export type InsertLegalTemplate = z.infer<typeof insertLegalTemplateSchema>;
