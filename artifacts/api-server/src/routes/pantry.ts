import { and, asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateItemBody,
  CreateItemResponse,
  DeleteItemParams,
  EnsureMyRoleResponse,
  GetMeResponse,
  ListAdminItemsResponse,
  ListItemsResponse,
} from "@workspace/api-zod";
import { db, itemsTable, userRolesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function currentUserId(res: Parameters<typeof requireAuth>[1]): string {
  return res.locals.userId as string;
}

function serializeItem<T extends { expiresOn: Date }>(
  item: T,
): Omit<T, "expiresOn"> & { expiresOn: string } {
  return { ...item, expiresOn: item.expiresOn.toISOString().slice(0, 10) };
}

router.get("/me", requireAuth, async (_req, res): Promise<void> => {
  const userId = currentUserId(res);
  const [roleRow] = await db
    .select({ role: userRolesTable.role })
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId))
    .limit(1);

  res.json(GetMeResponse.parse({ id: userId, role: roleRow?.role ?? "member" }));
});

router.post("/me/role", requireAuth, async (_req, res): Promise<void> => {
  const userId = currentUserId(res);
  await db
    .insert(userRolesTable)
    .values({ userId, role: "member" })
    .onConflictDoNothing();

  const [roleRow] = await db
    .select({ role: userRolesTable.role })
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId))
    .limit(1);

  res.json(EnsureMyRoleResponse.parse({ id: userId, role: roleRow?.role ?? "member" }));
});

router.get("/items", requireAuth, async (_req, res): Promise<void> => {
  const userId = currentUserId(res);
  const items = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.createdBy, userId))
    .orderBy(asc(itemsTable.expiresOn), asc(itemsTable.name));
  res.json(ListItemsResponse.parse(items).map(serializeItem));
});

router.post("/items", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateItemBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid pantry item");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const name = parsed.data.name.trim();
  if (!name) {
    res.status(400).json({ error: "Item name is required" });
    return;
  }

  const [item] = await db
    .insert(itemsTable)
    .values({
      name,
      quantity: parsed.data.quantity,
      expiresOn: parsed.data.expiresOn.toISOString().slice(0, 10),
      createdBy: currentUserId(res),
    })
    .returning();

  res.status(201).json(serializeItem(CreateItemResponse.parse(item)));
});

router.delete("/items/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const deleted = await db
    .delete(itemsTable)
    .where(
      and(
        eq(itemsTable.id, params.data.id),
        eq(itemsTable.createdBy, currentUserId(res)),
      ),
    )
    .returning({ id: itemsTable.id });

  if (deleted.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.sendStatus(204);
});

router.get(
  "/admin/items",
  requireAuth,
  async (req, res, next): Promise<void> => {
    const userId = currentUserId(res);
    const [roleRow] = await db
      .select({ role: userRolesTable.role })
      .from(userRolesTable)
      .where(eq(userRolesTable.userId, userId))
      .limit(1);

    if (roleRow?.role !== "admin") {
      res.status(403).json({ error: "Admin role required" });
      return;
    }

    next();
  },
  async (_req, res): Promise<void> => {
    const items = await db
      .select()
      .from(itemsTable)
      .orderBy(asc(itemsTable.expiresOn), asc(itemsTable.name));
    res.json(ListAdminItemsResponse.parse(items).map(serializeItem));
  },
);

export default router;
