import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/src/lib/db";
import { createSession } from "@/src/lib/auth";

const schema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    const { companyName, email, password, firstName, lastName } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName,
          lastName,
          isActive: true,
        },
      });

      const company = await tx.company.create({
        data: {
          name: companyName,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "OWNER",
        },
      });

      return { user, company };
    });

    await createSession(result.user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
} correction de register
