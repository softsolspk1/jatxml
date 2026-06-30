import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ActivateDoiClient from "./ActivateDoiClient";
import { redirect } from "next/navigation";

export default async function ActivateDoiPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch only articles that have metadata extracted
  const articles = await db.article.findMany({
    where: {
      status: { not: "UPLOADED" } 
    },
    orderBy: { createdAt: 'desc' },
    include: { authors: true, metadata: true }
  });

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>Activate DOI (Crossref)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Push Article metadata to Crossref to officially activate DOIs.</p>
      </div>

      <ActivateDoiClient articles={articles} />
    </div>
  );
}
