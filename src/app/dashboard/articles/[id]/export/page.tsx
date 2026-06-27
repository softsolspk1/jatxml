import { db } from "@/lib/db";
import Link from "next/link";
import { Download, FileText, Archive, BookOpen, Globe, Send } from "lucide-react";
import { notFound } from "next/navigation";
import PipelineVisualizer from "../PipelineVisualizer";
import SubmitButton from "./SubmitButton";

export default async function ExportCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await db.article.findUnique({
    where: { id: resolvedParams.id },
    include: { metadata: true }
  });

  if (!article) {
    notFound();
  }

  const exportOptions = [
    {
      id: 'xml',
      title: 'Raw XML File',
      description: 'Standard NISO JATS compliant XML file.',
      icon: <FileText size={24} style={{ color: '#0284C7' }} />,
      format: 'xml',
      buttonText: 'Download XML'
    },
    {
      id: 'zip',
      title: 'Complete ZIP Package',
      description: 'Includes JATS, PMC, SciELO XMLs, HTML, Images, and Validation Reports.',
      icon: <Archive size={24} style={{ color: '#F59E0B' }} />,
      format: 'zip',
      buttonText: 'Download Full Package'
    },
    {
      id: 'pmc',
      title: 'PMC Submission Package',
      description: 'Specific ZIP containing PMC validated XML, packaged images, and PMC report.',
      icon: <BookOpen size={24} style={{ color: '#059669' }} />,
      format: 'pmc',
      buttonText: 'Download PMC Package'
    },
    {
      id: 'scielo',
      title: 'SciELO Submission Package',
      description: 'Specific ZIP containing SciELO validated XML, packaged images, and SciELO report.',
      icon: <Globe size={24} style={{ color: '#8B5CF6' }} />,
      format: 'scielo',
      buttonText: 'Download SciELO Package'
    }
  ];

  return (
    <div>
      <PipelineVisualizer currentStatus={article.status} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>Export & Download Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            Article: {article.title || article.originalFileName}
          </p>
        </div>
        <Link href="/dashboard/articles" className="button button-outline">Back to Articles</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {exportOptions.map((option) => (
          <div key={option.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '50%' }}>
                {option.icon}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>{option.title}</h3>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', flex: 1, marginBottom: '25px' }}>
              {option.description}
            </p>
            
            <a 
              href={`/api/articles/${article.id}/export?format=${option.format}`}
              className="button"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}
            >
              <Download size={18} /> {option.buttonText}
            </a>
          </div>
        ))}
        
        {/* Step 7: Submission Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid var(--brand-blue)', backgroundColor: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <div style={{ padding: '15px', backgroundColor: 'var(--brand-blue)', borderRadius: '50%' }}>
              <Send size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--brand-blue)' }}>Step 7: Final Submission</h3>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', flex: 1, marginBottom: '25px' }}>
            Automatically deploy the validated packages to PubMed Central, SciELO, Crossref, and Google Scholar via automated indexing APIs.
          </p>
          
          <SubmitButton articleId={article.id} isAlreadySubmitted={article.status === 'SUBMITTED'} />
        </div>

      </div>
    </div>
  );
}
