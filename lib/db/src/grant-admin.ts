import { db, pool, userRolesTable } from "./index";

const userId = process.env.PANTRY_ADMIN_USER_ID;
if (!userId) {
  throw new Error("PANTRY_ADMIN_USER_ID must be set to a trusted Clerk user id");
}

try {
  await db
    .insert(userRolesTable)
    .values({ userId, role: "admin" })
    .onConflictDoUpdate({
      target: userRolesTable.userId,
      set: { role: "admin" },
    });
} finally {
  await pool.end();
}
