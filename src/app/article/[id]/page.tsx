import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { id: resolvedParams.id, status: { in: ['READY_FOR_EXPORT', 'SUBMITTED'] } },
    include: { metadata: true, authors: { orderBy: { order: 'asc' } } }
  });

  if (!article || !article.metadata) return {};

  const m = article.metadata;
  
  const authors = article.authors.map(a => a.name);

  // HighWire Press Tags for Google Scholar
  return {
    title: m.title || article.originalFileName,
    description: m.abstract?.substring(0, 200) || "Read the full research article.",
    other: {
      "citation_title": m.title || article.originalFileName,
      "citation_journal_title": m.journalName || "Journal",
      "citation_volume": m.volume || "",
      "citation_issue": m.issue || "",
      "citation_firstpage": m.pages?.split('-')[0] || "",
      "citation_lastpage": m.pages?.split('-')[1] || "",
      "citation_doi": m.doi || "",
      "citation_publication_date": m.publicationDate ? new Date(m.publicationDate).toISOString().split('T')[0] : "",
      "citation_pdf_url": `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/${article.id}/export?type=pdf`,
      ...Object.fromEntries(authors.map((author, i) => [`citation_author_${i}`, author]))
    }
  };
}

export default async function PublicArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { id: resolvedParams.id, status: { in: ['READY_FOR_EXPORT', 'SUBMITTED'] } },
    include: { metadata: true, authors: { orderBy: { order: 'asc' } } }
  });

  if (!article || !article.metadata) return notFound();

  // In a real app, we would dynamically generate HTML from XML or read from storage.
  // For now, we simulate an article landing page.
  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '40px', borderBottom: '2px solid #eaeaea', paddingBottom: '20px' }}>
        <h3 style={{ color: '#0056b3', textTransform: 'uppercase', fontSize: '0.9rem' }}>{article.metadata.journalName || 'Journal'} {article.metadata.volume && `Vol. ${article.metadata.volume}`}</h3>
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginTop: '10px' }}>{article.metadata.title}</h1>
        <div style={{ marginTop: '20px', color: '#555', fontSize: '1.1rem' }}>
          {article.authors.map(a => a.name).join(', ')}
        </div>
        {article.metadata.doi && <div style={{ marginTop: '10px' }}><strong>DOI:</strong> {article.metadata.doi}</div>}
      </header>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Abstract</h2>
        <p style={{ lineHeight: 1.6, fontSize: '1.1rem' }}>{article.metadata.abstract}</p>
      </section>

      {article.metadata.keywords && (
        <section style={{ marginBottom: '40px' }}>
          <strong>Keywords:</strong> {article.metadata.keywords}
        </section>
      )}

      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <p>This is a public preview page intended for <strong>Google Scholar Indexing</strong> via embedded HighWire Press meta tags.</p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Full text is accessible via PDF download or institutional subscription.</p>
      </div>
    </div>
  );
}
