import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Image src="/logo.png" alt="JATS XML Converter Logo" width={50} height={50} style={{ objectFit: 'contain' }} />
          <h2>Automated JATS XML Conversion Platform</h2>
        </div>
        <nav style={{ display: 'flex', gap: '20px' }}>
          <Link href="/dashboard" className="button button-outline" style={{ color: 'white', borderColor: 'white' }}>Dashboard</Link>
          <Link href="/login" className="button" style={{ backgroundColor: 'white', color: 'var(--brand-blue)' }}>Login</Link>
        </nav>
      </header>
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <section className="card" style={{ textAlign: 'center', padding: '80px 20px', marginBottom: '40px', borderTop: '4px solid var(--brand-green)' }}>
          <h1 style={{ fontSize: '2.8rem', marginBottom: '20px', color: 'var(--brand-blue)' }}>Scholarly Database Indexing made simple</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px' }}>
            Automatically convert scholarly research articles (DOCX) into industry-standard JATS XML formats for PMC, SciELO, and Crossref.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link href="/dashboard/upload" className="button" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>Start Converting</Link>
            <Link href="/about" className="button button-outline" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>Learn More</Link>
          </div>
        </section>
        
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--brand-blue)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--brand-blue)', fontSize: '1.3rem' }}>Metadata Extraction</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Automatically pull title, abstract, authors, and references from Word documents with incredible accuracy.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--brand-green)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--brand-green)', fontSize: '1.3rem' }}>Strict Validation</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Validate generated XML against official JATS DTD schemas and PMC strict rules before final export.</p>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--brand-blue)' }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--brand-blue)', fontSize: '1.3rem' }}>Automated Packages</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>Download complete ZIP packages containing XML, images, supplementary files, and PDF representations.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
