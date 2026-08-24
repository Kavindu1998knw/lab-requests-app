import React from 'react';
import { useLab } from '../context/LabContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useLab();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container no-print">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-message ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
          {toast.type === 'error' && <AlertCircle size={18} color="var(--accent-rose)" />}
          {toast.type === 'info' && <Info size={18} color="var(--brand-500)" />}
          <div style={{ flex: 1, fontSize: '0.88rem', fontWeight: 500 }}>
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              display: 'flex',
              padding: '2px',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
