import React, { useState, useMemo } from 'react';
import { useLab } from '../context/LabContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Printer,
  ArrowUpDown,
} from 'lucide-react';

const GSMB_ANALYSIS_TYPES = ['Dolomite', 'General', 'Project', 'Quartz', 'Water'];

export const SamplesList = () => {
  const {
    samples,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    setSelectedSample,
    setEditingSample,
    setActiveTab,
    deleteSample,
    setPrintSample,
  } = useLab();

  const [selectedAnalysisType, setSelectedAnalysisType] = useState('all');
  const [sortField, setSortField] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtered & Sorted list
  const filteredSamples = useMemo(() => {
    return samples
      .filter((s) => {
        // Status filter
        if (statusFilter !== 'all') {
          const state = (s.analysisState || 'Not started').toLowerCase();
          if (statusFilter === 'not_started' && !state.includes('not started') && !state.includes('received')) return false;
          if (statusFilter === 'prep' && !state.includes('preparation') && !state.includes('grinding')) return false;
          if (statusFilter === 'instrumental' && !state.includes('instrumental')) return false;
          if (statusFilter === 'sdg' && !state.includes('sdg')) return false;
          if (statusFilter === 'completed' && !state.includes('completed') && !state.includes('issued')) return false;
        }

        // Analysis Type filter
        if (selectedAnalysisType !== 'all' && (s.analysisType || '').toLowerCase() !== selectedAnalysisType.toLowerCase()) {
          return false;
        }

        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchRef = (s.referenceNumber || '').toLowerCase().includes(q);
          const matchReport = (s.reportNumber || '').toLowerCase().includes(q);
          const matchCat = (s.categoryCode || '').toLowerCase().includes(q);
          const matchClient = (s.clientName || '').toLowerCase().includes(q);
          const matchType = (s.sampleType || '').toLowerCase().includes(q);
          const matchAnal = (s.analysisType || '').toLowerCase().includes(q);
          const matchLoc = (s.locationAreaDistrict || '').toLowerCase().includes(q);
          const matchRecord = String(s.recordId || '').includes(q);
          if (!matchRef && !matchReport && !matchCat && !matchClient && !matchType && !matchAnal && !matchLoc && !matchRecord) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === 'submissionDate' || sortField === 'createdAt') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [samples, searchQuery, statusFilter, selectedAnalysisType, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    if (filteredSamples.length === 0) return;

    const headers = [
      'Record ID',
      'Reference Number',
      'Report Number',
      'Category Code',
      'Submission Date',
      'Client Name',
      'Telephone',
      'Location District',
      'Analysis Type',
      'Sample Matrix',
      'Sample Count',
      'Analysis State',
      'Fee Without Tax',
      'Total Fee (With VAT/SSCL)',
      'Advance Amount',
      'Advance Receipt',
      'Tax Invoice No',
      'Received By',
      'In-Charge',
    ];

    const rows = filteredSamples.map((s) => [
      s.recordId,
      `"${s.referenceNumber || ''}"`,
      `"${s.reportNumber || ''}"`,
      `"${s.categoryCode || ''}"`,
      `"${s.submissionDate ? new Date(s.submissionDate).toISOString().split('T')[0] : ''}"`,
      `"${(s.clientName || '').replace(/"/g, '""')}"`,
      `"${s.telephone || ''}"`,
      `"${(s.locationAreaDistrict || '').replace(/"/g, '""')}"`,
      `"${(s.analysisType || '').replace(/"/g, '""')}"`,
      `"${(s.sampleType || '').replace(/"/g, '""')}"`,
      s.sampleCount || 1,
      `"${s.analysisState || ''}"`,
      s.feeWithoutVat || 0,
      s.feeWithVat || 0,
      s.advanceAmount || 0,
      `"${s.advanceReceiptNo || ''}"`,
      `"${s.taxInvoiceNo || ''}"`,
      `"${s.sampleReceivedBy || ''}"`,
      `"${s.inchargeOfSamples || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gsmb_lab_samples_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  const formatCurrency = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '—';
    return `LKR ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            GSMB Laboratory Samples
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={exportToCSV} title="Export current list to CSV">
            <Download size={16} />
            <span>Export CSV</span>
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
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'not_started', label: 'Not Started' },
            { id: 'prep', label: 'Prep / Grinding' },
            { id: 'instrumental', label: 'Instrumental' },
            { id: 'sdg', label: 'SDG Approval' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className="btn btn-ghost"
              style={{
                fontSize: '0.82rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor:
                  statusFilter === tab.id ? 'var(--brand-600)' : 'var(--bg-tertiary)',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Analysis Type Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '170px' }}>
            <select
              className="form-select"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
              value={selectedAnalysisType}
              onChange={(e) => setSelectedAnalysisType(e.target.value)}
            >
              <option value="all">All Analysis Types</option>
              {GSMB_ANALYSIS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="nav-search-bar" style={{ width: '240px', padding: '0.4rem 0.8rem' }}>
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: '0.82rem' }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('recordId')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Record #</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => toggleSort('referenceNumber')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Reference #</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Report Ref</th>
                <th onClick={() => toggleSort('submissionDate')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => toggleSort('clientName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Client Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Analysis & Matrix</th>
                <th>Workflow State</th>
                <th>Total Fee</th>
                <th>Advance</th>
                <th>Balance</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.length > 0 ? (
                filteredSamples.map((sample) => {
                  const bal = Math.max(0, (sample.feeWithVat || 0) - (sample.advanceAmount || 0));
                  return (
                    <tr
                      key={sample.id || sample._id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedSample(sample)}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                        #{sample.recordId}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-600)' }}>
                          {sample.referenceNumber}
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            backgroundColor: 'var(--brand-50)',
                            color: 'var(--brand-700)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {sample.categoryCode || '—'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                        {formatDate(sample.submissionDate)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{sample.clientName}</div>
                        {sample.locationAreaDistrict && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                            📍 {sample.locationAreaDistrict}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sample.analysisType}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {sample.sampleType} • <strong>{sample.sampleCount} units</strong>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={sample.analysisState} />
                      </td>
                      <td style={{ fontWeight: 600 }}>
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
                          style={{ width: '32px', height: '32px' }}
                          title="Print Receipt Slip"
                          onClick={() => {
                            setPrintSample(sample);
                            window.print();
                          }}
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit Sample"
                          onClick={() => {
                            setEditingSample(sample);
                            setActiveTab('new_sample');
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: '32px', height: '32px', color: 'var(--accent-rose)' }}
                          title="Delete Sample"
                          onClick={() => {
                            if (window.confirm(`Delete sample ${sample.referenceNumber}?`)) {
                              deleteSample(sample.id || sample._id, sample.referenceNumber);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No sample records match your filters.
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
