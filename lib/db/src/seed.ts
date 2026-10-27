import { eq } from "drizzle-orm";
import { db, itemsTable, pool, userRolesTable } from "./index";

const demoUserId = process.env.DEMO_USER_ID ?? "demo-user";

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const examples = [
  { name: "Rolled oats", quantity: 1, expiresOn: daysFromNow(120) },
  { name: "Chickpeas", quantity: 4, expiresOn: daysFromNow(240) },
  { name: "Olive oil", quantity: 1, expiresOn: daysFromNow(180) },
  { name: "Tomatoes", quantity: 3, expiresOn: daysFromNow(8) },
  { name: "Brown rice", quantity: 2, expiresOn: daysFromNow(300) },
];

try {
  await db
    .insert(userRolesTable)
    .values({ userId: demoUserId, role: "member" })
    .onConflictDoNothing();

  const existing = await db
    .select({ name: itemsTable.name })
    .from(itemsTable)
    .where(eq(itemsTable.createdBy, demoUserId));
  const existingNames = new Set(existing.map((item) => item.name));
  const missingExamples = examples
    .filter((item) => !existingNames.has(item.name))
    .map((item) => ({ ...item, createdBy: demoUserId }));

  if (missingExamples.length > 0) {
    await db.insert(itemsTable).values(missingExamples);
  }
} finally {
  await pool.end();
}
