import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CitationsTableClient from "./CitationsTableClient";

export default async function CitationsPage() {
  const session = await getServerSession(authOptions);

  // Fetch only articles that have metadata extracted
  const articles = await db.article.findMany({
    where: {
      status: { not: "UPLOADED" } // Meaning it has some metadata at least
    },
    orderBy: { createdAt: 'desc' },
    include: { authors: true, metadata: true }
  });

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>Article Citations (RIS Format)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Download RIS citations for processed articles.</p>
      </div>

      <CitationsTableClient articles={articles} />
    </div>
  );
}
