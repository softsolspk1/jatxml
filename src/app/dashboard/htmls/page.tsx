import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import HTMLsTableClient from "./HTMLsTableClient";

export default async function HTMLsPage() {
  const session = await getServerSession(authOptions);

  // We only fetch articles that have metadata extracted or are in a valid state to generate HTML
  // Usually anything past METADATA_EXTRACTED can have HTML generated.
  const articles = await db.article.findMany({
    where: { 
      status: { 
        in: ['METADATA_EXTRACTED', 'READY_FOR_EXPORT', 'XML_GENERATED', 'SUBMITTED'] 
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>HTMLs Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and download generated HTMLs for articles.</p>
      </div>

      <HTMLsTableClient initialArticles={articles} />
    </div>
  );
}
