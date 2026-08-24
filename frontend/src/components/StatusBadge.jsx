import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertCircle, FileCheck, Layers, Sparkles } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const rawStatus = status || 'Not started';
  const s = rawStatus.toLowerCase();

  if (s.includes('completed')) {
    return (
      <span className="status-badge completed">
        <CheckCircle2 size={13} />
        {rawStatus}
      </span>
    );
  }

  if (s.includes('issued') || s.includes('sdg')) {
    return (
      <span className="status-badge issued">
        <FileCheck size={13} />
        {rawStatus}
      </span>
    );
  }

  if (s.includes('instrumental')) {
    return (
      <span className="status-badge progress" style={{ backgroundColor: 'var(--brand-100)', color: 'var(--brand-700)' }}>
        <Sparkles size={13} />
        {rawStatus}
      </span>
    );
  }

  if (s.includes('preparation') || s.includes('grinding') || s.includes('progress')) {
    return (
      <span className="status-badge progress">
        <Layers size={13} />
        {rawStatus}
      </span>
    );
  }

  if (s.includes('cancel') || s.includes('reject')) {
    return (
      <span className="status-badge cancelled">
        <AlertCircle size={13} />
        {rawStatus}
      </span>
    );
  }

  return (
    <span className="status-badge pending">
      <Clock size={13} />
      {rawStatus}
    </span>
  );
};
