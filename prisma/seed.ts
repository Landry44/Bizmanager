import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const EMAIL = "eyenelandry44@gmail.com";
const PASSWORD = "admin123";
const COMPANY_ID = "demo-company";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // 1. Créer ou mettre à jour l'utilisateur administrateur
  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: {
      passwordHash,
      firstName: "Admin",
      lastName: "BizManager",
      isActive: true,
    },
    create: {
      email: EMAIL,
      passwordHash,
      firstName: "Admin",
      lastName: "BizManager",
      isActive: true,
    },
  });

  // 2. Créer l'entreprise de démonstration
  const company = await db.company.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: "Mon Entreprise",
      currency: "XAF",
      timezone: "Africa/Libreville",
    },
  });

  // 3. Lier l'utilisateur à l'entreprise en tant qu'OWNER
  await db.membership.upsert({
    where: { userId_companyId: { userId: user.id, companyId: company.id } },
    update: { role: "OWNER" },
    create: { userId: user.id, companyId: company.id, role: "OWNER" },
  });

  // 4. Créer un abonnement FREE avec essai de 14 jours
  await db.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      plan: "FREE",
      status: "TRIALING",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      maxUsers: 2,
      maxProducts: 100,
    },
  });

  console.log(`Compte Owner prêt : ${EMAIL} / ${PASSWORD}`);
  console.log(`Entreprise: ${company.name} | rôle: OWNER`);
  console.log("Abonnement FREE créé avec succès !");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});