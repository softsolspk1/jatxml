import { db } from "@/lib/db";
import { notFound } from "next/navigation";

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
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Article Title</label>
              <textarea 
                defaultValue={article.metadata.title || ''} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Abstract</label>
              <textarea 
                defaultValue={article.metadata.abstract || ''} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', minHeight: '150px', fontFamily: 'inherit' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '5px' }}>Keywords</label>
              <input 
                type="text"
                defaultValue={article.metadata.keywords || ''} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'inherit' }}
              />
            </div>
            <button type="button" className="button" style={{ marginTop: '20px' }}>Save & Generate XML</button>
          </form>
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
