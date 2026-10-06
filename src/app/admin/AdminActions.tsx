"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminActions({ 
  companyId, 
  currentPlan 
}: { 
  companyId: string; 
  currentPlan: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateSubscription(data: any) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour");
      }
    } catch {
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <select
        value={currentPlan}
        onChange={(e) => updateSubscription({ plan: e.target.value, status: "ACTIVE" })}
        disabled={loading}
        style={{ padding: "6px", borderRadius: 4, border: "1px solid #ccc", fontSize: 12 }}
      >
        <option value="FREE">FREE</option>
        <option value="BUSINESS">BUSINESS</option>
        <option value="ENTERPRISE">ENTERPRISE</option>
      </select>
      <button
        onClick={() => updateSubscription({ extendTrialDays: 14 })}
        disabled={loading}
        style={{
          padding: "6px 10px",
          borderRadius: 4,
          border: "none",
          background: "#fbbf24",
          color: "white",
          fontSize: 12,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        +14 jours
      </button>
    </div>
  );
}