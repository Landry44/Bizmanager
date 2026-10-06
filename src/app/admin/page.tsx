import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import AdminActions from "./AdminActions";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.email !== "eyenelandry44@gmail.com") {
    redirect("/dashboard");
  }

  const companies = await db.company.findMany({
    include: { memberships: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Supervision BizManager
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Liste des entreprises inscrites sur la plateforme.
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Entreprise</th>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Administrateur</th>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Plan</th>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Statut</th>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Fin d'essai</th>
            <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12, fontWeight: 500 }}>{company.name}</td>
              <td style={{ padding: 12 }}>
                {company.memberships[0]?.user.email || "Non défini"}
              </td>
              <td style={{ padding: 12 }}>
                <span style={{
                  padding: "4px 8px", borderRadius: 4, fontSize: 12,
                  fontWeight: "bold", backgroundColor: "#e5e7eb", color: "#374151"
                }}>FREE</span>
              </td>
              <td style={{ padding: 12 }}>
                <span style={{
                  padding: "4px 8px", borderRadius: 4, fontSize: 12,
                  fontWeight: "bold", backgroundColor: "#fef9c3", color: "#854d0e"
                }}>TRIALING</span>
              </td>
              <td style={{ padding: 12 }}>-</td>
              <td style={{ padding: 12 }}>
                <AdminActions companyId={company.id} currentPlan="FREE" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {companies.length === 0 && (
        <p style={{ marginTop: 24, color: "#999" }}>
          Aucune entreprise inscrite pour le moment.
        </p>
      )}
    </main>
  );
}
