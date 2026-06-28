"use client";

import { useState } from "react";
import ValidationReportModal from "./ValidationReportModal";
import { FileCheck } from "lucide-react";

export default function ValidationReportTrigger({ articleId }: { articleId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="button button-outline"
        style={{ padding: '8px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--brand-green)', color: 'var(--brand-green)' }}
        title="View Validation Report"
      >
        <FileCheck size={16} /> Validate
      </button>

      <ValidationReportModal 
        articleId={articleId} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
