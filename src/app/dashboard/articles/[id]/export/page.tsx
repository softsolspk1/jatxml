import { db } from "@/lib/db";
import Link from "next/link";
import { Download, FileText, Archive, BookOpen, Globe, Send, Info, Key, CheckSquare, Server } from "lucide-react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PipelineVisualizer from "../PipelineVisualizer";
import SubmitButton from "./SubmitButton";

export default async function ExportCenterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || 'REVIEWER';
  
  // XML Operator should not see the final packages per requirements
  if (role === 'XML_OPERATOR') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Unauthorized</h2>
        <p>XML Operators cannot download finalized export packages.</p>
        <Link href="/dashboard/articles" className="button" style={{ marginTop: '20px', display: 'inline-block' }}>Back to Articles</Link>
      </div>
    );
  }

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

      {/* Manual Submission Guide */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          <Info size={24} /> Export & Submission Guide
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
          Scholarly databases generally do not offer public automated API endpoints for direct submission. 
          To successfully publish this article, please follow these manual submission steps using the downloaded packages above.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Key size={20} /> 1. Crossref DOI Registration
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Crossref handles DOI assignments. You must use the <strong>Complete ZIP Package</strong> which contains the <code>crossref.xml</code> file.
            </p>
            <ul style={{ color: 'var(--text-secondary)', marginTop: '10px', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>Log in to the <a href="https://doi.crossref.org/servlet/deposit" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-blue)' }}>Crossref Web Deposit Portal</a>.</li>
              <li>Upload the <code>crossref.xml</code> file directly to the portal.</li>
              <li>Alternatively, if you use OJS (Open Journal Systems), you can use their built-in Crossref plugin.</li>
            </ul>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #059669' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Server size={20} /> 2. PubMed Central (PMC) Submission
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              PMC requires strict compliance and receives submissions exclusively through their secure FTP server.
            </p>
            <ul style={{ color: 'var(--text-secondary)', marginTop: '10px', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>Download the <strong>PMC Submission Package</strong> above.</li>
              <li>Connect to the NIH FTP server (e.g., <code>ftp-private.ncbi.nlm.nih.gov</code>) using your organization's assigned PMC FTP credentials.</li>
              <li>Upload the entire ZIP package directly to your designated publisher drop-folder.</li>
              <li>PMC will automatically process the ZIP and email your organization with the ingestion report.</li>
            </ul>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #8B5CF6' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CheckSquare size={20} /> 3. SciELO Submission
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              SciELO relies on the SciELO PC Programs toolkit and national portal coordinators.
            </p>
            <ul style={{ color: 'var(--text-secondary)', marginTop: '10px', paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>Download the <strong>SciELO Submission Package</strong>.</li>
              <li>Run the package through the local SciELO Markup and Packa tools (if required by your national SciELO coordinator).</li>
              <li>Upload the final package to your national SciELO FTP or web management portal.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
