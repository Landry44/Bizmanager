import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Début du seed...");

  // 1. Créer l'entreprise de démonstration (version simplifiée)
  const company = await db.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: {
      id: "demo-company",
      name: "Mon Entreprise",
    },
  });
  console.log("Entreprise créée :", company.name);

  // 2. Créer l'utilisateur administrateur
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  const user = await db.user.upsert({
    where: { email: "admin@bizmanager.local" },
    update: {},
    create: {
      email: "admin@bizmanager.local",
      passwordHash: passwordHash,
      firstName: "Admin",
      lastName: "BizManager",
      isActive: true,
    },
  });
  console.log("Utilisateur créé :", user.email);

  // 3. Lier l'utilisateur à l'entreprise en tant qu'OWNER
  await db.membership.upsert({
    where: { id: "demo-membership" },
    update: {},
    create: {
      id: "demo-membership",
      userId: user.id,
      companyId: company.id,
      role: "OWNER",
    },
  });
  console.log("Membreship créé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });