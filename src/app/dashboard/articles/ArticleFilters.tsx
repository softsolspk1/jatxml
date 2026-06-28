'use client';

import { Search, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ArticleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  // Using an input for Journal to simulate the filter for now.
  const [journal, setJournal] = useState(searchParams.get('journal') || '');

  const handleApply = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (status) params.set('status', status);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (journal) params.set('journal', journal);

    router.push(`/dashboard/articles?${params.toString()}`);
  };

  return (
    <div className="card" style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
        <Search size={18} style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          placeholder="Search by Title, Author, or DOI..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
        />
      </div>
      
      <select 
        value={status} 
        onChange={e => setStatus(e.target.value)}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
      >
        <option value="">Status: All</option>
        <option value="UPLOADED">Uploaded</option>
        <option value="METADATA_EXTRACTED">Metadata Extracted</option>
        <option value="UNDER_REVIEW">Under Review</option>
        <option value="XML_GENERATED">XML Generated</option>
        <option value="VALIDATION_FAILED">Validation Failed</option>
        <option value="VALIDATION_PASSED">Validation Passed</option>
        <option value="READY_FOR_EXPORT">Ready for Export</option>
      </select>

      <input 
        type="text" 
        placeholder="Journal Filter" 
        value={journal}
        onChange={e => setJournal(e.target.value)}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }} 
      />

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="date" 
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }} 
          title="From Date"
        />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>to</span>
        <input 
          type="date" 
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }} 
          title="Till Date"
        />
      </div>
      
      <button onClick={handleApply} className="button button-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={18} /> Apply Filters
      </button>
    </div>
  );
}
