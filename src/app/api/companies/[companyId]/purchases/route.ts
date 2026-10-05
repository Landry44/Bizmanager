import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

const schema = z.object({
  payment: z.enum(["CASH", "AIRTEL_MONEY", "MOOV_MONEY", "BANK", "CREDIT"]),
  supplierId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().int().nonnegative(),
    })
  ).min(1),
});

export async function GET(
  _: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const membership = await db.membership.findFirst({
      where: { userId: user.id, companyId },
    });
    if (!membership) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const purchases = await db.purchase.findMany({
      where: { companyId },
      include: { items: { include: { product: true } }, supplier: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(purchases);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const membership = await db.membership.findFirst({
      where: { userId: user.id, companyId },
    });
    if (!membership || !["OWNER", "ADMIN", "MANAGER", "STOCK_MANAGER", "ACCOUNTANT"].includes(membership.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const d = schema.parse(await req.json());
    const ids = d.items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { companyId, id: { in: ids } } });
    if (products.length !== ids.length) throw new Error("Produit introuvable");

    const total = d.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

    const purchase = await db.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          companyId,
          payment: d.payment,
          supplierId: d.supplierId || null,
          total,
          items: { create: d.items.map((i) => ({ ...i, total: i.quantity * i.unitPrice })) },
        },
      });

      for (const i of d.items) {
        await tx.product.update({
          where: { id: i.productId },
          data: { stock: { increment: i.quantity }, purchasePrice: i.unitPrice },
        });
        await tx.stockMovement.create({
          data: { companyId, productId: i.productId, type: "PURCHASE", quantity: i.quantity, note: "Achat" },
        });
      }

      if (d.payment === "CREDIT" && d.supplierId) {
        await tx.supplier.update({
          where: { id: d.supplierId },
          data: { balance: { increment: total } },
        });
      }

      await tx.auditLog.create({
        data: { action: "CREATE", entity: "purchase", entityId: purchase.id, companyId, actorId: user.id },
      });

      return p;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur" }, { status: 400 });
  }
}