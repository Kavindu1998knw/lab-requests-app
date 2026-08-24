import React from 'react';
import { useLab } from '../context/LabContext';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Printer,
  Edit,
  Trash2,
  FlaskConical,
  CreditCard,
  UserCheck,
  Tag,
  Building,
} from 'lucide-react';

export const SampleDetailModal = () => {
  const {
    selectedSample,
    setSelectedSample,
    setEditingSample,
    setActiveTab,
    deleteSample,
    setPrintSample,
  } = useLab();

  if (!selectedSample) return null;

  const sample = selectedSample;

  const handleEdit = () => {
    setEditingSample(sample);
    setSelectedSample(null);
    setActiveTab('new_sample');
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete sample ${sample.referenceNumber}?`
      )
    ) {
      await deleteSample(sample.id || sample._id, sample.referenceNumber);
    }
  };

  const handlePrint = () => {
    setPrintSample(sample);
    window.print();
  };

  const formatCurrency = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '—';
    return `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedSample(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{sample.referenceNumber}</h2>
              {sample.categoryCode && (
                <span
                  style={{
                    backgroundColor: 'var(--brand-50)',
                    color: 'var(--brand-700)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {sample.categoryCode}
                </span>
              )}
              <StatusBadge status={sample.analysisState} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handlePrint} title="Print Requisition Receipt">
              <Printer size={15} />
              <span>Print Slip</span>
            </button>
            <button className="btn btn-secondary" onClick={handleEdit} title="Edit Sample">
              <Edit size={15} />
              <span>Edit</span>
            </button>
            <button className="btn-icon" onClick={handleDelete} title="Delete Sample" style={{ color: 'var(--accent-rose)' }}>
              <Trash2 size={16} />
            </button>
            <button className="btn-icon" onClick={() => setSelectedSample(null)}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Relevant Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Client & Sample Info */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={16} color="var(--brand-500)" />
              Client & Sample Identification
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Name of Client:</span>
                <div style={{ fontWeight: 600 }}>{sample.clientName}</div>
              </div>
              {sample.address && (
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Address:</span>
                  <div>{sample.address}</div>
                </div>
              )}
              {sample.telephone && (
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Telephone:</span>
                  <div>{sample.telephone}</div>
                </div>
              )}
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Sample Type / Matrix:</span>
                <div style={{ fontWeight: 600 }}>
                  {sample.sampleType} — <span style={{ color: 'var(--brand-600)' }}>{sample.sampleCount} Sample(s)</span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Type of Analysis:</span>
                <div style={{ fontWeight: 600 }}>{sample.analysisType} {sample.categoryCode && `(${sample.categoryCode})`}</div>
              </div>
            </div>
          </div>

          {/* Requested Tests & Remarks */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} color="var(--accent-indigo)" />
              Requested Tests & Remarks
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Requested Tests:</span>
                <div className="tag-container" style={{ marginTop: '4px' }}>
                  {sample.requestedTests && sample.requestedTests.length > 0 ? (
                    sample.requestedTests.map((t, i) => (
                      <span key={i} className="tag-pill" style={{ backgroundColor: 'var(--brand-50)', color: 'var(--brand-700)', fontWeight: 600 }}>
                        {t}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None specified</span>
                  )}
                </div>
              </div>

              {sample.remarks && (
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Remarks:</span>
                  <p style={{ fontSize: '0.85rem', marginTop: '2px', backgroundColor: 'var(--bg-tertiary)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    {sample.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financials (SSCL 2.56% + VAT 18%) */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={16} color="var(--accent-emerald)" />
              Financial & Payment Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Fee (Without VAT):</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(sample.feeWithoutVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Fee (With VAT):</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(sample.feeWithVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Advance Paid:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{formatCurrency(sample.advanceAmount)}</span>
              </div>
              {sample.advanceReceiptNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Advance Receipt No:</span>
                  <span style={{ fontWeight: 600 }}>{sample.advanceReceiptNo}</span>
                </div>
              )}
              {sample.totalReceiptNo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Receipt No:</span>
                  <span style={{ fontWeight: 600 }}>{sample.totalReceiptNo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Laboratory Custody & Issuance */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={16} color="var(--accent-purple)" />
              Laboratory Staff & Issuance
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Sample Received By:</span>
                <div style={{ fontWeight: 600 }}>{sample.sampleReceivedBy || '—'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Incharge of Samples:</span>
                <div style={{ fontWeight: 600 }}>{sample.inchargeOfSamples || '—'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Date of Issuing:</span>
                <div>{formatDate(sample.reportIssueDate)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Issuing Method:</span>
                <div>{sample.issuingMethod || 'Hard Copy'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>Issued By:</span>
                <div>{sample.issuedBy || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
