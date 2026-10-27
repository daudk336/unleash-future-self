import { sql } from "drizzle-orm";
import { check, pgTable, text } from "drizzle-orm/pg-core";

export const userRolesTable = pgTable(
  "user_roles",
  {
    userId: text("user_id").primaryKey(),
    role: text("role", { enum: ["admin", "member"] })
      .notNull()
      .default("member"),
  },
  (table) => [
    check(
      "user_roles_role_check",
      sql`${table.role} in ('admin', 'member')`,
    ),
  ],
);

export type UserRole = typeof userRolesTable.$inferSelect;
