import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { id: resolvedParams.id },
    include: { metadata: true }
  });

  if (!article || !article.metadata) return notFound();

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Review Extracted Metadata</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Left: Metadata Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-green)', marginBottom: '20px' }}>Editable Metadata Form</h2>
          <ReviewForm articleId={article.id} initialData={article.metadata} />
        </div>

        {/* Right: Article Preview or Processing State */}
        <div className="card" style={{ backgroundColor: 'var(--bg-color)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Document Preview</h2>
          <div style={{ padding: '20px', border: '1px solid var(--border-color)', backgroundColor: 'white', minHeight: '400px', borderRadius: '4px' }}>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '150px' }}>Original Document Preview will render here...</p>
          </div>
        </div>

      </div>
    </div>
  );
}
