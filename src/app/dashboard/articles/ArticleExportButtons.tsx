'use client';

import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ArticleExportButtons({ articles }: { articles: any[] }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Article Tracking Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Article Title', 'Authors', 'Status', 'Uploaded']],
      body: articles.map(article => [
        article.title || article.originalFileName || 'N/A',
        article.authors?.length > 0 ? `${article.authors[0].name} et al.` : 'N/A',
        article.status.replace(/_/g, ' '),
        new Date(article.createdAt).toLocaleDateString()
      ])
    });
    doc.save('article_tracking_report.pdf');
  };

  const exportCSV = () => {
    const headers = ['Article Title', 'Authors', 'Status', 'Uploaded'];
    const rows = articles.map(article => [
      `"${(article.title || article.originalFileName || 'N/A').replace(/"/g, '""')}"`,
      `"${(article.authors?.length > 0 ? `${article.authors[0].name} et al.` : 'N/A').replace(/"/g, '""')}"`,
      article.status.replace(/_/g, ' '),
      new Date(article.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article_tracking_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button onClick={exportCSV} className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Download size={18} /> Excel (CSV)
      </button>
      <button onClick={exportPDF} className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={18} /> PDF
      </button>
    </div>
  );
}
