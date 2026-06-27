'use client';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, label: 'Upload Article', statuses: ['UPLOADED', 'METADATA_EXTRACTED', 'UNDER_REVIEW', 'XML_GENERATED', 'VALIDATION_FAILED', 'VALIDATION_PASSED', 'READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 2, label: 'Metadata Extraction', statuses: ['METADATA_EXTRACTED', 'UNDER_REVIEW', 'XML_GENERATED', 'VALIDATION_FAILED', 'VALIDATION_PASSED', 'READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 3, label: 'Editorial Review', statuses: ['UNDER_REVIEW', 'XML_GENERATED', 'VALIDATION_FAILED', 'VALIDATION_PASSED', 'READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 4, label: 'XML Generation', statuses: ['XML_GENERATED', 'VALIDATION_FAILED', 'VALIDATION_PASSED', 'READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 5, label: 'Validation', statuses: ['VALIDATION_FAILED', 'VALIDATION_PASSED', 'READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 6, label: 'Export Package', statuses: ['READY_FOR_EXPORT', 'SUBMITTED'] },
  { id: 7, label: 'Submission', statuses: ['SUBMITTED'] },
];

export default function PipelineVisualizer({ currentStatus }: { currentStatus: string }) {
  // Determine if the current status implies completion of a specific step
  // We'll calculate the current active step index (0-based)
  let activeStepIndex = 0;
  
  // Special handling for failures
  const isFailed = currentStatus === 'VALIDATION_FAILED';

  // Determine how far along the pipeline we are
  if (currentStatus === 'UPLOADED') activeStepIndex = 1; // Finished upload, waiting for extraction
  else if (currentStatus === 'METADATA_EXTRACTED') activeStepIndex = 2; // Waiting for review
  else if (currentStatus === 'UNDER_REVIEW') activeStepIndex = 2; // Currently in review
  else if (currentStatus === 'XML_GENERATED') activeStepIndex = 4; // Generated, entering validation
  else if (currentStatus === 'VALIDATION_FAILED') activeStepIndex = 4; // Stuck at validation
  else if (currentStatus === 'VALIDATION_PASSED') activeStepIndex = 5; // Ready for export
  else if (currentStatus === 'READY_FOR_EXPORT') activeStepIndex = 5; // Ready for export
  else if (currentStatus === 'SUBMITTED') activeStepIndex = 7; // Completed all

  return (
    <div className="card" style={{ marginBottom: '30px', padding: '20px 30px' }}>
      <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-blue)', marginBottom: '20px', fontWeight: 600 }}>Article Processing Pipeline</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        {/* Progress Background Line */}
        <div style={{ 
          position: 'absolute', top: '20px', left: '40px', right: '40px', height: '4px', 
          backgroundColor: 'var(--border-color)', zIndex: 1 
        }} />
        
        {/* Active Progress Line */}
        <div style={{ 
          position: 'absolute', top: '20px', left: '40px', height: '4px', 
          backgroundColor: 'var(--brand-green)', zIndex: 2,
          width: `calc(${(Math.min(activeStepIndex, 6) / 6) * 100}% - 40px)`,
          transition: 'width 0.5s ease-in-out'
        }} />

        {PIPELINE_STEPS.map((step, index) => {
          const isCompleted = index < activeStepIndex || (step.id === 7 && activeStepIndex === 7);
          const isCurrent = index === activeStepIndex && !isCompleted;
          
          let iconColor = 'var(--text-secondary)';
          let bgColor = 'white';
          
          if (isCompleted) {
            iconColor = 'var(--brand-green)';
          } else if (isCurrent) {
            iconColor = 'white';
            bgColor = isFailed && step.id === 5 ? '#EF4444' : 'var(--brand-blue)';
          }

          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '100px' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '50%', 
                backgroundColor: bgColor,
                border: `3px solid ${isCompleted ? 'var(--brand-green)' : isCurrent ? (isFailed && step.id === 5 ? '#EF4444' : 'var(--brand-blue)') : 'var(--border-color)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '10px', transition: 'all 0.3s ease'
              }}>
                {isCompleted ? (
                  <CheckCircle2 size={24} color={iconColor} />
                ) : isCurrent ? (
                  <Clock size={20} color={iconColor} className={isFailed ? '' : 'animate-pulse'} />
                ) : (
                  <Circle size={16} color={iconColor} />
                )}
              </div>
              <span style={{ 
                fontSize: '0.8rem', textAlign: 'center', fontWeight: isCurrent ? 700 : 500,
                color: isCompleted ? 'var(--brand-green)' : isCurrent ? (isFailed && step.id === 5 ? '#EF4444' : 'var(--brand-blue)') : 'var(--text-secondary)'
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
