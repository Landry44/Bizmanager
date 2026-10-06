import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user || user.email !== "eyenelandry44@gmail.com") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { plan, status, extendTrialDays } = body;

    const dataToUpdate: any = {};
    if (plan) {
      dataToUpdate.plan = plan;
      // Mettre à jour les limites en fonction du plan
      if (plan === "FREE") {
        dataToUpdate.maxUsers = 2;
        dataToUpdate.maxProducts = 100;
      } else if (plan === "BUSINESS") {
        dataToUpdate.maxUsers = 10;
        dataToUpdate.maxProducts = 5000;
      } else if (plan === "ENTERPRISE") {
        dataToUpdate.maxUsers = 100;
        dataToUpdate.maxProducts = 50000;
      }
    }

    if (status) dataToUpdate.status = status;

    if (extendTrialDays) {
      dataToUpdate.trialEndsAt = new Date(
        Date.now() + extendTrialDays * 24 * 60 * 60 * 1000
      );
      dataToUpdate.status = "TRIALING";
    }

    const updated = await db.subscription.update({
      where: { companyId },
      data: dataToUpdate,
    });

    // Journaliser le changement
    await db.auditLog.create({
      data: {
        action: "SUBSCRIPTION_CHANGE",
        entity: "Subscription",
        entityId: updated.id,
        metadata: { plan, status, extendTrialDays },
        companyId,
        actorId: user.id,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur modification abonnement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}