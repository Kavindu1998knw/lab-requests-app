import React from 'react';
import { useLab } from '../context/LabContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  FlaskConical,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  Printer,
  Edit,
  LogOut,
} from 'lucide-react';

export const Dashboard = () => {
  const { logout } = useAuth();
  const {
    stats,
    samples,
    setActiveTab,
    setSelectedSample,
    setEditingSample,
    setPrintSample,
  } = useLab();

  const safeSamples = Array.isArray(samples) ? samples : [];

  const recentSamples = [...safeSamples]
    .sort((a, b) => new Date(b.createdAt || b.submissionDate) - new Date(a.createdAt || a.submissionDate))
    .slice(0, 8);

  const formatCurrency = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return 'LKR 0';
    return `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            GSMB Laboratory Overview
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveTab('samples')}
          >
            <FileSpreadsheet size={16} />
            <span>Manage Sample</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingSample(null);
              setActiveTab('new_sample');
            }}
          >
            <Plus size={16} />
            <span>Add Sample</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={logout}
            title="Sign Out of System"
            style={{
              color: 'var(--accent-rose)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Total Requisitions"
          value={stats.totalSamples || safeSamples.length}
          icon={FlaskConical}
          accentColor="#0ea5e9"
          accentBg="var(--brand-50)"
        />
        <MetricCard
          title="In Testing / Progress"
          value={stats.inProgress || 0}
          icon={PlayCircle}
          accentColor="#6366f1"
          accentBg="var(--accent-indigo-bg)"
        />
        <MetricCard
          title="Completed & Issued"
          value={stats.completedReports || 0}
          icon={CheckCircle2}
          accentColor="#10b981"
          accentBg="var(--accent-emerald-bg)"
        />
        <MetricCard
          title="Pending Queue"
          value={stats.pendingAnalysis || 0}
          icon={Clock}
          accentColor="#f59e0b"
          accentBg="var(--accent-amber-bg)"
        />
      </div>

      {/* Recent Submissions Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Requisitions</h2>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setActiveTab('samples')}
            style={{ fontSize: '0.85rem' }}
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ref Number</th>
                <th>Client Name</th>
                <th>Analysis Type</th>
                <th>Sample Type & Qty</th>
                <th>Status</th>
                <th>Total Fee</th>
                <th>Advance</th>
                <th>Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentSamples.length > 0 ? (
                recentSamples.map((sample) => {
                  const bal = Math.max(0, (sample.feeWithVat || 0) - (sample.advanceAmount || 0));
                  return (
                    <tr key={sample.id || sample._id} style={{ cursor: 'pointer' }} onClick={() => setSelectedSample(sample)}>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-600)' }}>
                          {sample.referenceNumber}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          #{sample.recordId} • {formatDate(sample.submissionDate)}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sample.clientName}</div>
                        {sample.telephone && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                            {sample.telephone}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sample.analysisType}</div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'var(--brand-50)',
                            color: 'var(--brand-700)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          {sample.categoryCode || '—'}
                        </span>
                      </td>
                      <td>
                        {sample.sampleType} <span style={{ color: 'var(--text-muted)' }}>({sample.sampleCount || 1})</span>
                      </td>
                      <td>
                        <StatusBadge status={sample.analysisState} />
                      </td>
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(sample.feeWithVat)}
                      </td>
                      <td>
                        {sample.advanceAmount ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                            {formatCurrency(sample.advanceAmount)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>0.00</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: bal > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                          {formatCurrency(bal)}
                        </span>
                      </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          title="Print Receipt Slip"
                          onClick={() => {
                            setPrintSample(sample);
                            window.print();
                          }}
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: '30px', height: '30px' }}
                          title="Edit"
                          onClick={() => {
                            setEditingSample(sample);
                            setActiveTab('new_sample');
                          }}
                        >
                          <Edit size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No requisitions recorded yet. Click "+ Add Sample" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
