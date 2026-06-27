import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { convertToHTML } from "@/lib/xml/htmlConverter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PipelineVisualizer from "../PipelineVisualizer";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  const article = await db.article.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      metadata: true, 
      references: true, 
      figures: true, 
      tables: true, 
      authors: { orderBy: { order: 'asc' } },
      history: { orderBy: { createdAt: 'desc' }, include: { user: true } }
    }
  });

  if (!article || !article.metadata) return notFound();

  const previewHtml = convertToHTML(article.metadata, article.authors, article.references, article.figures);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Review Extracted Metadata</h1>
      <PipelineVisualizer currentStatus={article.status} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Left: Metadata Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-green)', marginBottom: '20px' }}>Editable Metadata Form</h2>
          <ReviewForm 
            articleId={article.id} 
            initialData={article.metadata} 
            initialAuthors={article.authors || []}
            initialReferences={article.references || []}
            history={article.history || []}
            role={(session?.user as any)?.role || 'REVIEWER'}
          />
        </div>

        {/* Right: Article Preview or Processing State */}
        <div className="card" style={{ backgroundColor: 'var(--bg-color)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)', marginBottom: '20px' }}>Document Preview</h2>
          <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'white', minHeight: '600px', borderRadius: '4px', overflow: 'hidden' }}>
             <iframe srcDoc={previewHtml} style={{ width: '100%', height: '100%', border: 'none', minHeight: '600px' }} title="Document Preview" />
          </div>
        </div>

      </div>
    </div>
  );
}
