import { sql } from "drizzle-orm";
import { pgTable, varchar, text, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const designDnaProfilesTable = pgTable("design_dna_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  favouriteColours: jsonb("favourite_colours").$type<string[]>().default([]).notNull(),
  musicGenres: jsonb("music_genres").$type<string[]>().default([]).notNull(),
  styleVibes: jsonb("style_vibes").$type<string[]>().default([]).notNull(),
  designKeywords: jsonb("design_keywords").$type<string[]>().default([]).notNull(),
  purchaseHistory: jsonb("purchase_history").$type<PurchaseRecord[]>().default([]).notNull(),
  projectHistory: jsonb("project_history").$type<ProjectRecord[]>().default([]).notNull(),
  rawNotes: text("raw_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const designDnaSuggestionsTable = pgTable("design_dna_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  colourPalette: jsonb("colour_palette").$type<string[]>().default([]).notNull(),
  dnaVersion: integer("dna_version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface PurchaseRecord {
  item: string;
  category: string;
  date: string;
  colours?: string[];
}

export interface ProjectRecord {
  name: string;
  type: string;
  date: string;
  description?: string;
  colours?: string[];
  tags?: string[];
}

export type DesignDnaProfile = typeof designDnaProfilesTable.$inferSelect;
export type InsertDesignDnaProfile = typeof designDnaProfilesTable.$inferInsert;
export type DesignDnaSuggestion = typeof designDnaSuggestionsTable.$inferSelect;
export type InsertDesignDnaSuggestion = typeof designDnaSuggestionsTable.$inferInsert;
