import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const dropWaitlistTable = pgTable("drop_waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DropWaitlistEntry = typeof dropWaitlistTable.$inferSelect;
